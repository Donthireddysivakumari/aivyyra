from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth
from ..ai import inference

router = APIRouter(prefix="/ai", tags=["AI Modules"])

@router.post("/skill-gap-analysis", response_model=schemas.SkillGapAnalysisOutput)
def get_skill_gap_analysis_api(
    payload: schemas.SkillGapAnalysisInput,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Authorization checks: ADMIN/TEACHER can see all, STUDENTS/PARENTS can see their own
    if current_user.role == "STUDENT":
        if current_user.student_profile and current_user.student_profile.id != payload.student_id:
            raise HTTPException(status_code=403, detail="Not authorized to access other students' skill gap analysis.")
    elif current_user.role == "PARENT":
        if current_user.parent_profile and current_user.parent_profile.student_id != payload.student_id:
            raise HTTPException(status_code=403, detail="Not authorized to access other students' skill gap analysis.")

    analysis = inference.analyze_skill_gap(payload.student_id, db)
    return analysis

@router.post("/recommendations", response_model=schemas.RecommendationOutput)
def get_recommendations_api(
    payload: schemas.RecommendationInput,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "STUDENT":
        if current_user.student_profile and current_user.student_profile.id != payload.student_id:
            raise HTTPException(status_code=403, detail="Not authorized to access other students' recommendations.")
    elif current_user.role == "PARENT":
        if current_user.parent_profile and current_user.parent_profile.student_id != payload.student_id:
            raise HTTPException(status_code=403, detail="Not authorized to access other students' recommendations.")

    recs = inference.get_learning_recommendations(payload.student_id, db)
    return recs

@router.post("/performance-prediction", response_model=schemas.PerformancePredictionOutput)
def predict_performance_api(
    payload: schemas.PerformancePredictionInput,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "STUDENT":
        if current_user.student_profile and current_user.student_profile.id != payload.student_id:
            raise HTTPException(status_code=403, detail="Not authorized to access other students' prediction.")
    elif current_user.role == "PARENT":
        if current_user.parent_profile and current_user.parent_profile.student_id != payload.student_id:
            raise HTTPException(status_code=403, detail="Not authorized to access other students' prediction.")

    prediction = inference.get_performance_prediction(payload.student_id, db)
    return prediction
