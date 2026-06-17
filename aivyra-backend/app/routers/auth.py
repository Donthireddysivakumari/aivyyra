from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse)
def register(request: schemas.RegistrationRequest, db: Session = Depends(get_db)):
    # Check email
    existing_user = db.query(models.User).filter(models.User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_pwd = auth.get_password_hash(request.password)

    # Base User
    user = models.User(
        name=request.name,
        email=request.email,
        password_hash=hashed_pwd,
        role=request.role.upper()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Handle Profiles based on role
    role = request.role.upper()
    if role == "STUDENT":
        if not request.class_level or not request.language or not request.village:
            raise HTTPException(
                status_code=400,
                detail="Student registration requires class_level, language, and village"
            )
        student = models.Student(
            user_id=user.id,
            class_level=request.class_level,
            language=request.language,
            village=request.village,
            skill_score=0.0
        )
        db.add(student)
    
    elif role == "TEACHER":
        if not request.specialization:
            raise HTTPException(
                status_code=400,
                detail="Teacher registration requires specialization"
            )
        teacher = models.Teacher(
            user_id=user.id,
            specialization=request.specialization
        )
        db.add(teacher)
    
    elif role == "PARENT":
        if not request.student_email:
            raise HTTPException(
                status_code=400,
                detail="Parent registration requires student_email"
            )
        # Find student user
        student_user = db.query(models.User).filter(models.User.email == request.student_email).first()
        if not student_user or not student_user.student_profile:
            raise HTTPException(
                status_code=404,
                detail=f"No student found with email: {request.student_email}"
            )
        parent = models.Parent(
            user_id=user.id,
            student_id=student_user.student_profile.id
        )
        db.add(parent)

    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Standard OAuth2 form submission uses 'username' for the email field
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate tokens
    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = auth.create_refresh_token(data={"sub": user.email, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "role": user.role,
        "user_id": user.id,
        "name": user.name
    }

from pydantic import BaseModel

# Plain JSON login endpoint for frontend convenience
class JSONLoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login-json", response_model=schemas.Token)
def login_json(request: JSONLoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    refresh_token = auth.create_refresh_token(data={"sub": user.email, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "role": user.role,
        "user_id": user.id,
        "name": user.name
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    payload = auth.decode_token(refresh_token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    new_refresh_token = auth.create_refresh_token(data={"sub": user.email, "role": user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
        "role": user.role,
        "user_id": user.id,
        "name": user.name
    }
