from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str
    role: str
    user_id: int
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Student profile
class StudentBase(BaseModel):
    class_level: str
    language: str
    village: str

class StudentCreate(StudentBase):
    user_id: int

class StudentResponse(StudentBase):
    id: int
    user_id: int
    skill_score: float
    user: Optional[UserBase] = None

    class Config:
        from_attributes = True

# Teacher profile
class TeacherBase(BaseModel):
    specialization: str

class TeacherCreate(TeacherBase):
    user_id: int

class TeacherResponse(TeacherBase):
    id: int
    user_id: int
    user: Optional[UserBase] = None

    class Config:
        from_attributes = True

# Parent profile
class ParentBase(BaseModel):
    student_id: int

class ParentCreate(ParentBase):
    user_id: int

class ParentResponse(ParentBase):
    id: int
    user_id: int
    student_id: int
    user: Optional[UserBase] = None
    student: Optional[StudentResponse] = None

    class Config:
        from_attributes = True

# Unified Registration
class RegistrationRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    # Fields for specific profiles
    class_level: Optional[str] = None
    language: Optional[str] = None
    village: Optional[str] = None
    specialization: Optional[str] = None
    student_email: Optional[EmailStr] = None # For parent registration reference

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: str
    category: str
    level: str

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int

    class Config:
        from_attributes = True

# Lesson Schemas
class LessonBase(BaseModel):
    title: str
    content: str
    course_id: int

class LessonCreate(LessonBase):
    pass

class LessonResponse(LessonBase):
    id: int

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str

class QuestionCreate(QuestionBase):
    quiz_id: int

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    lesson_id: int

class QuizCreate(QuizBase):
    pass

class QuizResponse(QuizBase):
    id: int
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

class QuizAttemptCreate(BaseModel):
    quiz_id: int
    score: float

class QuizAttemptResponse(BaseModel):
    id: int
    student_id: int
    quiz_id: int
    score: float
    attempted_at: datetime
    quiz: Optional[QuizBase] = None

    class Config:
        from_attributes = True

# Skill Assessment Schemas
class SkillAssessmentCreate(BaseModel):
    skill_name: str
    score: float

class SkillAssessmentResponse(SkillAssessmentCreate):
    id: int
    student_id: int
    assessed_at: datetime

    class Config:
        from_attributes = True

# Recommendations
class RecommendationResponse(BaseModel):
    id: int
    student_id: int
    recommendation_text: str
    created_at: datetime

    class Config:
        from_attributes = True

# Progress tracking
class ProgressUpdate(BaseModel):
    completion_percentage: float

class ProgressResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    completion_percentage: float
    updated_at: datetime
    course: Optional[CourseResponse] = None

    class Config:
        from_attributes = True

# Certificates
class CertificateResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    issued_date: datetime
    course: Optional[CourseResponse] = None

    class Config:
        from_attributes = True

# AI input/output schemas
class SkillGapAnalysisInput(BaseModel):
    student_id: int

class SkillGapAnalysisOutput(BaseModel):
    weak_subjects: List[str]
    strong_subjects: List[str]
    skill_gap_percentage: float

class RecommendationInput(BaseModel):
    student_id: int

class RecommendationOutput(BaseModel):
    recommended_courses: List[CourseResponse]
    recommended_lessons: List[LessonResponse]
    improvement_plan: str

class PerformancePredictionInput(BaseModel):
    student_id: int

class PerformancePredictionOutput(BaseModel):
    predicted_future_score: float
    risk_level: str  # Low, Medium, High
    suggested_actions: List[str]
