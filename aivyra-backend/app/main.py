from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import auth, users, courses, quizzes, ai
from . import models, auth as auth_utils

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Aivyra-Tutor API",
    description="AI-powered educational platform for rural students and skill-gap bridging.",
    version="1.0.0"
)

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(quizzes.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Aivyra-Tutor REST API. Access /docs for swagger specifications."}

@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        # ── STEP 1: Seed Courses/Lessons/Quizzes FIRST ──────────────
        courses_count = db.query(models.Course).count()
        if courses_count == 0:
            maths   = models.Course(id=1, title="Basic Mathematics & Algebra",
                                    description="Learn fractions, equations, and algebraic variables.",
                                    category="Mathematics", level="Basic")
            science = models.Course(id=2, title="General Science & Physics",
                                    description="Introductory mechanics, electricity, optics and environmental biology.",
                                    category="Science", level="Basic")
            english = models.Course(id=3, title="English Grammar & Vocab",
                                    description="Boost spoken English with grammar and vocabulary builder.",
                                    category="English Grammar", level="Intermediate")
            db.add_all([maths, science, english])
            db.commit()

            lesson1 = models.Lesson(id=1, course_id=1,
                title="Introduction to Algebraic Variables",
                content="An algebraic expression combines variables, constants, and operations. Let x represent unknown apples...")
            lesson2 = models.Lesson(id=2, course_id=1,
                title="Working with Fractions & Percentages",
                content="A fraction represents part of a whole. Percentages help in rural crop trade calculations...")
            lesson3 = models.Lesson(id=3, course_id=2,
                title="Introduction to Light & Reflection",
                content="Light is energy enabling sight. Reflection bounces light off polished surfaces...")
            db.add_all([lesson1, lesson2, lesson3])
            db.commit()

            quiz1 = models.Quiz(id=1, lesson_id=1, title="Algebraic Variables Quiz")
            quiz2 = models.Quiz(id=2, lesson_id=2, title="Fractions & Percentages Quiz")
            db.add_all([quiz1, quiz2])
            db.commit()

            q1 = models.Question(quiz_id=1, question="If 2x + 5 = 15, what is x?",
                option_a="3", option_b="5", option_c="7", option_d="10", correct_answer="B")
            q2 = models.Question(quiz_id=1, question="What is a letter representing an unknown number?",
                option_a="Constant", option_b="Variable", option_c="Coefficient", option_d="Operator", correct_answer="B")
            q3 = models.Question(quiz_id=2, question="What is 25% as a fraction?",
                option_a="1/2", option_b="1/3", option_c="1/4", option_d="2/5", correct_answer="C")
            db.add_all([q1, q2, q3])
            db.commit()
            print("Seeded: Courses, Lessons, Quizzes, Questions")

        # ── STEP 2: Seed Admin ───────────────────────────────────────
        if not db.query(models.User).filter(models.User.email == "admin@aivyra.com").first():
            admin = models.User(name="System Administrator", email="admin@aivyra.com",
                                password_hash=auth_utils.get_password_hash("admin123"), role="ADMIN")
            db.add(admin)
            db.commit()
            print("Seeded: admin@aivyra.com / admin123")

        # ── STEP 3: Seed Teacher ─────────────────────────────────────
        if not db.query(models.User).filter(models.User.email == "teacher@aivyra.com").first():
            t_user = models.User(name="Saraswati Devi", email="teacher@aivyra.com",
                                 password_hash=auth_utils.get_password_hash("teacher123"), role="TEACHER")
            db.add(t_user)
            db.commit()
            db.add(models.Teacher(user_id=t_user.id, specialization="Mathematics & General Science"))
            db.commit()
            print("Seeded: teacher@aivyra.com / teacher123")

        # ── STEP 4: Seed Student (quiz attempts AFTER courses exist) ─
        student_profile_id = None
        if not db.query(models.User).filter(models.User.email == "student@aivyra.com").first():
            s_user = models.User(name="Ramesh Kumar", email="student@aivyra.com",
                                 password_hash=auth_utils.get_password_hash("student123"), role="STUDENT")
            db.add(s_user)
            db.commit()
            s_profile = models.Student(user_id=s_user.id, class_level="Class 8",
                                       language="English", village="Rampur", skill_score=65.0)
            db.add(s_profile)
            db.commit()
            student_profile_id = s_profile.id
            # quiz_id=1,2 and course_id=1 now guaranteed to exist
            db.add(models.QuizAttempt(student_id=student_profile_id, quiz_id=1, score=50.0))
            db.add(models.QuizAttempt(student_id=student_profile_id, quiz_id=2, score=75.0))
            db.add(models.SkillAssessment(student_id=student_profile_id, skill_name="Mathematics", score=55.0))
            db.add(models.SkillAssessment(student_id=student_profile_id, skill_name="English Grammar", score=72.0))
            db.add(models.ProgressTracking(student_id=student_profile_id, course_id=1, completion_percentage=45.0))
            db.commit()
            print("Seeded: student@aivyra.com / student123")
        else:
            stud = db.query(models.User).filter(models.User.email == "student@aivyra.com").first()
            if stud and stud.student_profile:
                student_profile_id = stud.student_profile.id

        # ── STEP 5: Seed Parent ──────────────────────────────────────
        if student_profile_id and not db.query(models.User).filter(models.User.email == "parent@aivyra.com").first():
            p_user = models.User(name="Vijay Kumar", email="parent@aivyra.com",
                                 password_hash=auth_utils.get_password_hash("parent123"), role="PARENT")
            db.add(p_user)
            db.commit()
            db.add(models.Parent(user_id=p_user.id, student_id=student_profile_id))
            db.commit()
            print("Seeded: parent@aivyra.com / parent123")

    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

