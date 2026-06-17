from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def get_current_user_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    profile_data = {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

    if current_user.role == "STUDENT" and current_user.student_profile:
        profile_data["profile"] = {
            "id": current_user.student_profile.id,
            "class_level": current_user.student_profile.class_level,
            "language": current_user.student_profile.language,
            "village": current_user.student_profile.village,
            "skill_score": current_user.student_profile.skill_score
        }
    elif current_user.role == "TEACHER" and current_user.teacher_profile:
        profile_data["profile"] = {
            "id": current_user.teacher_profile.id,
            "specialization": current_user.teacher_profile.specialization
        }
    elif current_user.role == "PARENT" and current_user.parent_profile:
        profile_data["profile"] = {
            "id": current_user.parent_profile.id,
            "student_id": current_user.parent_profile.student_id,
            "student_name": current_user.parent_profile.student.user.name if current_user.parent_profile.student else None
        }

    return profile_data

@router.get("/students", response_model=List[schemas.StudentResponse])
def get_all_students(
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN", "TEACHER"])),
    db: Session = Depends(get_db)
):
    return db.query(models.Student).all()

@router.get("/students/{id}", response_model=schemas.StudentResponse)
def get_student_by_id(
    id: int,
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN", "TEACHER", "PARENT"])),
    db: Session = Depends(get_db)
):
    student = db.query(models.Student).filter(models.Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # If the user is a parent, verify they are linked to this student
    if current_user.role == "PARENT":
        parent_profile = current_user.parent_profile
        if not parent_profile or parent_profile.student_id != id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Parent is not registered for this student."
            )
            
    return student

@router.get("/stats")
def get_platform_stats(
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(models.User).count()
    students = db.query(models.Student).count()
    teachers = db.query(models.Teacher).count()
    parents = db.query(models.Parent).count()
    courses = db.query(models.Course).count()

    # User growth mock analytical data
    growth = [
        {"month": "Jan", "users": 12},
        {"month": "Feb", "users": 24},
        {"month": "Mar", "users": 45},
        {"month": "Apr", "users": 80},
        {"month": "May", "users": 150},
        {"month": "Jun", "users": total_users}
    ]

    return {
        "total_users": total_users,
        "total_students": students,
        "total_teachers": teachers,
        "total_parents": parents,
        "total_courses": courses,
        "user_growth": growth
    }

@router.get("/student-dashboard-stats")
def get_student_dashboard_stats(
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    total_courses = db.query(models.Course).count()
    
    # Calculate average progress
    progress_records = db.query(models.ProgressTracking).filter(models.ProgressTracking.student_id == student.id).all()
    avg_progress = (sum([pr.completion_percentage for pr in progress_records]) / len(progress_records)) if progress_records else 0.0

    # Streak - mock calculation for streak (usually calculated from login records/activities)
    # Let's count completed quiz attempts in the last week
    streak = 5 # default mockup streak

    # Quiz Attempts
    attempts_count = db.query(models.QuizAttempt).filter(models.QuizAttempt.student_id == student.id).count()

    # Certificates
    certificates_count = db.query(models.Certificate).filter(models.Certificate.student_id == student.id).count()

    return {
        "total_courses": total_courses,
        "progress_percentage": round(avg_progress, 1),
        "skill_score": round(student.skill_score, 1),
        "learning_streak": streak,
        "quiz_attempts": attempts_count,
        "certificates": certificates_count
    }
