import os
from typing import Any, Optional
from sqlalchemy.orm import Session
import joblib
import pandas as pd
import numpy as np
from .. import models

# Paths
DIR_PATH = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = DIR_PATH + "/artifacts"
PERF_MODEL_PATH = f"{ARTIFACTS_DIR}/perf_predictor.joblib"
REC_MODEL_PATH = f"{ARTIFACTS_DIR}/rec_engine.joblib"

# Global model references
perf_model: Optional[Any] = None
rec_model: Optional[Any] = None
le_class: Optional[Any] = None
le_lang: Optional[Any] = None
le_weak: Optional[Any] = None
le_rec: Optional[Any] = None
student_clusterer: Optional[Any] = None

def load_models_lazy():
    global perf_model, rec_model, le_class, le_lang, le_weak, le_rec, student_clusterer
    if perf_model is not None:
        return

    # Self-healing check: if files do not exist, train them
    if not os.path.exists(PERF_MODEL_PATH):
        print("Model files not found. Auto-training models...")
        from .models_trainer import train_and_save_models
        train_and_save_models()

    perf_model = joblib.load(PERF_MODEL_PATH)
    rec_model = joblib.load(REC_MODEL_PATH)
    le_class = joblib.load(f"{ARTIFACTS_DIR}/le_class.joblib")
    le_lang = joblib.load(f"{ARTIFACTS_DIR}/le_lang.joblib")
    le_weak = joblib.load(f"{ARTIFACTS_DIR}/le_weak.joblib")
    le_rec = joblib.load(f"{ARTIFACTS_DIR}/le_rec.joblib")
    student_clusterer = joblib.load(f"{ARTIFACTS_DIR}/student_clusterer.joblib")

def get_student_metrics(student_id: int, db: Session):
    # Retrieve all quiz attempts
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.student_id == student_id).all()
    # Retrieve all skill assessments
    assessments = db.query(models.SkillAssessment).filter(models.SkillAssessment.student_id == student_id).all()
    # Retrieve course progress
    progress_records = db.query(models.ProgressTracking).filter(models.ProgressTracking.student_id == student_id).all()

    avg_quiz = sum([a.score for a in attempts]) / len(attempts) if attempts else 50.0
    avg_assess = sum([sa.score for sa in assessments]) / len(assessments) if assessments else 50.0
    avg_progress = sum([pr.completion_percentage for pr in progress_records]) / len(progress_records) if progress_records else 0.0

    return avg_quiz, avg_assess, avg_progress, attempts, assessments, progress_records

def analyze_skill_gap(student_id: int, db: Session):
    load_models_lazy()
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return {"weak_subjects": [], "strong_subjects": [], "skill_gap_percentage": 100.0}

    avg_quiz, avg_assess, avg_progress, attempts, assessments, progress_records = get_student_metrics(student_id, db)

    # Subject-wise categorization
    subject_scores = {}
    
    # Process quiz attempts
    for attempt in attempts:
        quiz = db.query(models.Quiz).filter(models.Quiz.id == attempt.quiz_id).first()
        if quiz and quiz.lesson:
            course = quiz.lesson.course
            if course:
                cat = course.category
                if cat not in subject_scores:
                    subject_scores[cat] = []
                subject_scores[cat].append(attempt.score)

    # Process explicit skill assessments
    for sa in assessments:
        cat = sa.skill_name
        if cat not in subject_scores:
            subject_scores[cat] = []
        subject_scores[cat].append(sa.score)

    weak_subjects = []
    strong_subjects = []

    for subj, scores in subject_scores.items():
        avg_subj = sum(scores) / len(scores)
        if avg_subj < 60:
            weak_subjects.append(subj)
        elif avg_subj >= 75:
            strong_subjects.append(subj)

    # Fallback to defaults if no attempts exist
    if not subject_scores:
        weak_subjects = ["Mathematics", "English"]
        strong_subjects = ["Science"]

    # Skill Gap percentage
    all_scores = [a.score for a in attempts] + [sa.score for sa in assessments]
    overall_avg = sum(all_scores) / len(all_scores) if all_scores else 50.0
    skill_gap = max(0.0, 100.0 - overall_avg)

    return {
        "weak_subjects": weak_subjects,
        "strong_subjects": strong_subjects,
        "skill_gap_percentage": round(float(skill_gap), 2)
    }

def get_learning_recommendations(student_id: int, db: Session):
    load_models_lazy()
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return {"recommended_courses": [], "recommended_lessons": [], "improvement_plan": ""}

    # Extract weak subjects
    gap_analysis = analyze_skill_gap(student_id, db)
    weak_subjects_list = gap_analysis.get("weak_subjects") or []
    weak_subject: str = weak_subjects_list[0] if weak_subjects_list else "Math"

    # Encode inputs for model
    try:
        class_enc = le_class.transform([student.class_level])[0] if le_class is not None else 0
    except Exception:
        class_enc = 0
    try:
        lang_enc = le_lang.transform([student.language])[0] if le_lang is not None else 0
    except Exception:
        lang_enc = 0
    try:
        weak_enc = le_weak.transform([weak_subject])[0] if le_weak is not None else 0
    except Exception:
        weak_enc = 0

    input_df = pd.DataFrame([{
        "class_level": class_enc,
        "language": lang_enc,
        "weak_subject": weak_enc
    }])

    # Predict course category
    assert rec_model is not None, "rec_model not loaded"
    assert le_rec is not None, "le_rec not loaded"
    pred_category_enc = rec_model.predict(input_df)[0]
    rec_category = le_rec.inverse_transform([pred_category_enc])[0]

    # Query matching courses
    rec_courses = db.query(models.Course).filter(
        models.Course.category.like(f"%{rec_category.split(' ')[0]}%")
    ).all()
    
    # If no match, suggest some courses
    if not rec_courses:
        rec_courses = db.query(models.Course).limit(2).all()

    # Get recommended lessons
    rec_lessons = []
    for course in rec_courses:
        lessons = db.query(models.Lesson).filter(models.Lesson.course_id == course.id).all()
        rec_lessons.extend(lessons)

    improvement_plan = (
        f"Based on your profile, your primary weak subject area is {weak_subject}. "
        f"We recommend enrolling in the {rec_category} module, beginning with lessons in "
        f"'{rec_lessons[0].title if rec_lessons else 'Introductory Concepts'}'. "
        f"Spend 20 minutes daily on localized {student.language} voice explanations and attempt quizzes "
        f"to check your understanding."
    )

    return {
        "recommended_courses": rec_courses,
        "recommended_lessons": rec_lessons[:3],
        "improvement_plan": improvement_plan
    }

def get_performance_prediction(student_id: int, db: Session):
    load_models_lazy()
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return {"predicted_future_score": 50.0, "risk_level": "Medium", "suggested_actions": []}

    avg_quiz, avg_assess, avg_progress, _, _, _ = get_student_metrics(student_id, db)

    input_df = pd.DataFrame([{
        "avg_quiz_score": avg_quiz,
        "avg_assess_score": avg_assess,
        "progress_pct": avg_progress
    }])

    assert perf_model is not None, "perf_model not loaded"
    predicted_score = perf_model.predict(input_df)[0]
    predicted_score = float(np.clip(predicted_score, 0, 100))

    if predicted_score < 55:
        risk_level = "High"
        actions = [
            "Schedule 1-on-1 tutoring sessions immediately.",
            "Complete basic prerequisite quizzes again.",
            "Utilize localized audio instructions for difficult topics."
        ]
    elif predicted_score < 75:
        risk_level = "Medium"
        actions = [
            "Complete pending lesson course progress.",
            "Attempt quizzes for weak subjects.",
            "Revise lessons with low quiz scores."
        ]
    else:
        risk_level = "Low"
        actions = [
            "Unlock advanced course content.",
            "Assist peers in study groups.",
            "Take mock final examination prep tests."
        ]

    return {
        "predicted_future_score": round(predicted_score, 1),
        "risk_level": risk_level,
        "suggested_actions": actions
    }
