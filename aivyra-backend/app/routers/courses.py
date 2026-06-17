from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[schemas.CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return db.query(models.Course).all()

@router.post("", response_model=schemas.CourseResponse)
def create_course(
    course: schemas.CourseCreate,
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN", "TEACHER"])),
    db: Session = Depends(get_db)
):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/{id}")
def get_course_details(id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    lessons = db.query(models.Lesson).filter(models.Lesson.course_id == id).all()
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "category": course.category,
        "level": course.level,
        "lessons": lessons
    }

@router.post("/{id}/lessons", response_model=schemas.LessonResponse)
def create_lesson(
    id: int,
    lesson: schemas.LessonCreate,
    current_user: models.User = Depends(auth.RoleChecker(["ADMIN", "TEACHER"])),
    db: Session = Depends(get_db)
):
    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db_lesson = models.Lesson(**lesson.dict())
    db_lesson.course_id = id
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/lessons/{id}", response_model=schemas.LessonResponse)
def get_lesson(id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/{id}/progress", response_model=schemas.ProgressResponse)
def update_progress(
    id: int,
    progress: schemas.ProgressUpdate,
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db_progress = db.query(models.ProgressTracking).filter(
        models.ProgressTracking.student_id == student.id,
        models.ProgressTracking.course_id == id
    ).first()

    if not db_progress:
        db_progress = models.ProgressTracking(
            student_id=student.id,
            course_id=id,
            completion_percentage=progress.completion_percentage
        )
        db.add(db_progress)
    else:
        db_progress.completion_percentage = progress.completion_percentage

    # Issue Certificate if completed (100%)
    if progress.completion_percentage >= 100.0:
        existing_cert = db.query(models.Certificate).filter(
            models.Certificate.student_id == student.id,
            models.Certificate.course_id == id
        ).first()
        if not existing_cert:
            new_cert = models.Certificate(
                student_id=student.id,
                course_id=id,
                issued_date=datetime.datetime.utcnow()
            )
            db.add(new_cert)

    db.commit()
    db.refresh(db_progress)
    return db_progress

@router.get("/{id}/progress", response_model=schemas.ProgressResponse)
def get_progress(
    id: int,
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    progress = db.query(models.ProgressTracking).filter(
        models.ProgressTracking.student_id == student.id,
        models.ProgressTracking.course_id == id
    ).first()

    if not progress:
        return {
            "id": 0,
            "student_id": student.id,
            "course_id": id,
            "completion_percentage": 0.0,
            "updated_at": datetime.datetime.utcnow(),
            "course": db.query(models.Course).filter(models.Course.id == id).first()
        }
    return progress

@router.get("/progress/all", response_model=List[schemas.ProgressResponse])
def get_all_student_progress(
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return db.query(models.ProgressTracking).filter(models.ProgressTracking.student_id == student.id).all()

@router.get("/certificates/my", response_model=List[schemas.CertificateResponse])
def get_my_certificates(
    current_user: models.User = Depends(auth.RoleChecker(["STUDENT"])),
    db: Session = Depends(get_db)
):
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return db.query(models.Certificate).filter(models.Certificate.student_id == student.id).all()
