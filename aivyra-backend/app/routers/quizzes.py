from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

def update_student_overall_skill_score(student_id: int, db: Session):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return

    # Gather quiz attempt scores
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.student_id == student_id).all()
    # Gather skill assessment scores
    assessments = db.query(models.SkillAssessment).filter(models.SkillAssessment.student_id == student_id).all()

    scores = [a.score for a in attempts] + [sa.score for sa in assessments]
    if scores:
        student.skill_score = sum(scores) / len(scores)
    else:
        student.skill_score = 0.0

    db.commit()

@router.post("", response_model=schemas.QuizResponse)
def create_quiz(
    quiz: schemas.QuizCreate,
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN", "TEACHER"])),
    db: Session = Depends(get_db)
):
    # Verify lesson exists
    lesson = db.query(models.Lesson).filter(models.Lesson.id == quiz.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    db_quiz = models.Quiz(**quiz.dict())
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.get("/{id}", response_model=schemas.QuizResponse)
def get_quiz_by_id(id: int, db: Session = Depends(get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/{id}/questions", response_model=schemas.QuestionResponse)
def add_question_to_quiz(
    id: int,
    question: schemas.QuestionBase,
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN", "TEACHER"])),
    db: Session = Depends(get_db)
):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    db_question = models.Question(**question.dict(), quiz_id=id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.post("/{id}/attempt", response_model=schemas.QuizAttemptResponse)
def submit_quiz_attempt(
    id: int,
    attempt_in: schemas.QuizAttemptCreate,
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    quiz = db.query(models.Quiz).filter(models.Quiz.id == id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Add attempt
    db_attempt = models.QuizAttempt(
        student_id=student.id,
        quiz_id=id,
        score=attempt_in.score
    )
    db.add(db_attempt)
    db.commit()

    # Recalculate student skill score
    update_student_overall_skill_score(student.id, db)
    db.refresh(db_attempt)
    return db_attempt

@router.get("/attempts/my", response_model=List[schemas.QuizAttemptResponse])
def get_my_attempts(
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return db.query(models.QuizAttempt).filter(models.QuizAttempt.student_id == student.id).all()

@router.post("/assessments", response_model=schemas.SkillAssessmentResponse)
def submit_skill_assessment(
    assessment: schemas.SkillAssessmentCreate,
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT", "TEACHER"])),
    db: Session = Depends(get_db)
):
    if current_user.role == "STUDENT":
        student = current_user.student_profile
    else:
        # Teacher submitting for a student (needs a student_id in a query parameter or path, but let's assume student submits it, or teacher provides a student_id parameter)
        # For simplicity, we can let the student log in and submit, or add a query parameter student_id for teachers
        student = current_user.student_profile # Default
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    db_assessment = models.SkillAssessment(
        student_id=student.id,
        skill_name=assessment.skill_name,
        score=assessment.score
    )
    db.add(db_assessment)
    db.commit()

    update_student_overall_skill_score(student.id, db)
    db.refresh(db_assessment)
    return db_assessment

@router.get("/assessments/my", response_model=List[schemas.SkillAssessmentResponse])
def get_my_assessments(
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return db.query(models.SkillAssessment).filter(models.SkillAssessment.student_id == student.id).all()
