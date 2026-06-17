"""
Standalone seed script for Aivyra-Tutor.
Run once to populate demo data: python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models
from app.auth import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    print("=" * 50)
    print("Refreshing Database & Seeding Fresh Data...")
    print("=" * 50)

    # Clean existing data to avoid PK conflicts
    db.query(models.Certificate).delete()
    db.query(models.ProgressTracking).delete()
    db.query(models.Recommendation).delete()
    db.query(models.SkillAssessment).delete()
    db.query(models.QuizAttempt).delete()
    db.query(models.Question).delete()
    db.query(models.Quiz).delete()
    db.query(models.Lesson).delete()
    db.query(models.Course).delete()
    db.query(models.Parent).delete()
    db.query(models.Teacher).delete()
    db.query(models.Student).delete()
    db.query(models.User).delete()
    db.commit()

    # 1. Seed Courses
    maths = models.Course(id=1, title="Basic Mathematics & Algebra",
                          description="Learn numbers, algebra, linear equations, geometry, and complete practice work.",
                          category="Mathematics", level="Basic")
    science = models.Course(id=2, title="General Science & Physics",
                            description="Introduction to forces, energy, ecosystems, and human physiology.",
                            category="Science", level="Basic")
    english = models.Course(id=3, title="English Grammar & Vocabulary",
                            description="Master parts of speech, active/passive voice, tenses, and reading comprehension.",
                            category="English Grammar", level="Intermediate")
    db.add_all([maths, science, english])
    db.commit()
    print("[OK] Seeded 3 Enrolled Courses.")

    # 2. Seed Modules / Lessons
    # Course 1: Mathematics
    m1 = models.Lesson(id=1, course_id=1, title="Numbers & Operations", content="Introduction to basic arithmetic, integers, decimals, fractions, and percentage operations.")
    m2 = models.Lesson(id=2, course_id=1, title="Algebra Basics", content="Introduction to algebraic expressions, variables, coefficients, and operations.")
    m3 = models.Lesson(id=3, course_id=1, title="Linear Equations", content="Learn to solve single variable linear equations (e.g. ax + b = c) and real-life word problems.")
    m4 = models.Lesson(id=4, course_id=1, title="Geometry Fundamentals", content="Basics of lines, angles, triangles, perimeter, and area formulas for common shapes.")
    m5 = models.Lesson(id=5, course_id=1, title="Practice Exercises", content="Interactive practice worksheets and formulas compilation for mathematical mastery.")
    m_assess = models.Lesson(id=6, course_id=1, title="Final Course Assessment", content="Review modules 1-5 and test your skills with a 10-question final quiz.")

    # Course 2: Science
    s1 = models.Lesson(id=7, course_id=2, title="Introduction to Science", content="What is science? Understanding observations, hypothesis testing, and the scientific method.")
    s2 = models.Lesson(id=8, course_id=2, title="Matter and Energy", content="Explore states of matter (solid, liquid, gas) and conservation of kinetic & potential energy.")
    s3 = models.Lesson(id=9, course_id=2, title="Force and Motion", content="Learn Newton's Laws of Motion, gravity, friction, and standard calculation units.")
    s4 = models.Lesson(id=10, course_id=2, title="Human Body Basics", content="Brief introduction to organs, digestion, respiratory, and circulatory systems.")
    s5 = models.Lesson(id=11, course_id=2, title="Environment and Ecosystem", content="Understand habitats, food chains, ecosystems, and renewable vs non-renewable energy.")
    s_assess = models.Lesson(id=12, course_id=2, title="Final Course Assessment", content="Review modules 1-5 and test your physics and biology knowledge with a 10-question quiz.")

    # Course 3: English
    e1 = models.Lesson(id=13, course_id=3, title="Parts of Speech", content="Learn parts of speech: nouns, pronouns, verbs, adjectives, adverbs, prepositions, and conjunctions.")
    e2 = models.Lesson(id=14, course_id=3, title="Tenses", content="Understanding timelines: present, past, and future tense conjugations with examples.")
    e3 = models.Lesson(id=15, course_id=3, title="Sentence Formation", content="Construct proper simple, compound, and complex sentences. Master active and passive voices.")
    e4 = models.Lesson(id=16, course_id=3, title="Vocabulary Building", content="Expand word list with definitions, synonyms, antonyms, and context usage guides.")
    e5 = models.Lesson(id=17, course_id=3, title="Reading Comprehension", content="Reading short passages and extracting critical points to boost comprehension.")
    e_assess = models.Lesson(id=18, course_id=3, title="Final Course Assessment", content="Review modules 1-5 and test your grammar and vocabulary proficiency.")

    db.add_all([m1, m2, m3, m4, m5, m_assess, s1, s2, s3, s4, s5, s_assess, e1, e2, e3, e4, e5, e_assess])
    db.commit()
    print("[OK] Seeded 18 Lessons/Modules.")

    # 3. Seed Assessments / Quizzes
    quiz_math = models.Quiz(id=1, lesson_id=6, title="Mathematics Assessment Quiz")
    quiz_science = models.Quiz(id=2, lesson_id=12, title="Science Assessment Quiz")
    quiz_english = models.Quiz(id=3, lesson_id=18, title="English Assessment Quiz")
    db.add_all([quiz_math, quiz_science, quiz_english])
    db.commit()
    print("[OK] Seeded 3 Course Quizzes.")

    # 4. Questions (10 per Quiz)
    # Quiz 1: Mathematics
    q_m = [
        models.Question(quiz_id=1, question="If 3x - 7 = 14, what is x?", option_a="5", option_b="7", option_c="6", option_d="8", correct_answer="B"),
        models.Question(quiz_id=1, question="What is the area of a rectangle with length 8 cm and width 5 cm?", option_a="35 sq cm", option_b="40 sq cm", option_c="45 sq cm", option_d="30 sq cm", correct_answer="B"),
        models.Question(quiz_id=1, question="Solve: 25% of 200 is?", option_a="40", option_b="50", option_c="60", option_d="80", correct_answer="B"),
        models.Question(quiz_id=1, question="What is the sum of the angles in a triangle?", option_a="90 degrees", option_b="180 degrees", option_c="270 degrees", option_d="360 degrees", correct_answer="B"),
        models.Question(quiz_id=1, question="If a car travels at 60 km/h, how far does it travel in 2.5 hours?", option_a="120 km", option_b="150 km", option_c="180 km", option_d="200 km", correct_answer="B"),
        models.Question(quiz_id=1, question="Which of the following is a prime number?", option_a="9", option_b="15", option_c="17", option_d="21", correct_answer="C"),
        models.Question(quiz_id=1, question="What is the value of 5^3?", option_a="15", option_b="75", option_c="125", option_d="225", correct_answer="C"),
        models.Question(quiz_id=1, question="Solve for y: 4y + 12 = 36.", option_a="5", option_b="6", option_c="7", option_d="8", correct_answer="B"),
        models.Question(quiz_id=1, question="What is the perimeter of a square with side length 6 cm?", option_a="12 cm", option_b="18 cm", option_c="24 cm", option_d="36 cm", correct_answer="C"),
        models.Question(quiz_id=1, question="What is 1/2 + 1/4?", option_a="2/4", option_b="3/4", option_c="2/3", option_d="1/3", correct_answer="B")
    ]
    # Quiz 2: Science
    q_s = [
        models.Question(quiz_id=2, question="What is the standard unit of force?", option_a="Joule", option_b="Newton", option_c="Watt", option_d="Pascal", correct_answer="B"),
        models.Question(quiz_id=2, question="Which gas do plants absorb during photosynthesis?", option_a="Oxygen", option_b="Nitrogen", option_c="Carbon Dioxide", option_d="Hydrogen", correct_answer="C"),
        models.Question(quiz_id=2, question="What is the state of matter with a definite volume but no definite shape?", option_a="Solid", option_b="Liquid", option_c="Gas", option_d="Plasma", correct_answer="B"),
        models.Question(quiz_id=2, question="Which organ system is responsible for pumping blood throughout the body?", option_a="Respiratory", option_b="Digestive", option_c="Circulatory", option_d="Nervous", correct_answer="C"),
        models.Question(quiz_id=2, question="What type of energy is stored in a stretched rubber band?", option_a="Kinetic", option_b="Potential", option_c="Thermal", option_d="Chemical", correct_answer="B"),
        models.Question(quiz_id=2, question="Water boils at what temperature in Celsius?", option_a="50C", option_b="100C", option_c="150C", option_d="200C", correct_answer="B"),
        models.Question(quiz_id=2, question="What is the primary source of energy for Earth's ecosystem?", option_a="Wind", option_b="Moon", option_c="Sun", option_d="Geothermal", correct_answer="C"),
        models.Question(quiz_id=2, question="Which force pulls objects toward the center of the Earth?", option_a="Friction", option_b="Magnetism", option_c="Gravity", option_d="Tension", correct_answer="C"),
        models.Question(quiz_id=2, question="What is the main function of red blood cells?", option_a="Fight infections", option_b="Clot blood", option_c="Carry oxygen", option_d="Digest food", correct_answer="C"),
        models.Question(quiz_id=2, question="Which of the following is a renewable energy source?", option_a="Coal", option_b="Petroleum", option_c="Solar", option_d="Natural Gas", correct_answer="C")
    ]
    # Quiz 3: English
    q_e = [
        models.Question(quiz_id=3, question="Identify the noun in the sentence: 'The teacher praised Ramesh.'", option_a="praised", option_b="teacher", option_c="the", option_d="and", correct_answer="B"),
        models.Question(quiz_id=3, question="Choose the correct past tense: 'She ___ to the market yesterday.'", option_a="go", option_b="goes", option_c="went", option_d="going", correct_answer="C"),
        models.Question(quiz_id=3, question="What is the antonym of 'Beautiful'?", option_a="Pretty", option_b="Ugly", option_c="Nice", option_d="Clean", correct_answer="B"),
        models.Question(quiz_id=3, question="Which word is a conjunction in: 'Ramesh and Vijay are friends.'", option_a="are", option_b="and", option_c="friends", option_d="work", correct_answer="B"),
        models.Question(quiz_id=3, question="Fill in the blank: 'This is ___ apple.'", option_a="a", option_b="an", option_c="the", option_d="some", correct_answer="B"),
        models.Question(quiz_id=3, question="Identify the adjective: 'The smart student solved the puzzle.'", option_a="student", option_b="solved", option_c="smart", option_d="puzzle", correct_answer="C"),
        models.Question(quiz_id=3, question="Choose the correct form: 'They ___ playing cricket now.'", option_a="is", option_b="am", option_c="are", option_d="was", correct_answer="C"),
        models.Question(quiz_id=3, question="What is the plural form of 'Child'?", option_a="Childs", option_b="Children", option_c="Childrens", option_d="Childes", correct_answer="B"),
        models.Question(quiz_id=3, question="Find the adverb in: 'She ran quickly to the class.'", option_a="ran", option_b="quickly", option_c="class", option_d="to", correct_answer="B"),
        models.Question(quiz_id=3, question="Choose the correct preposition: 'The book is ___ the table.'", option_a="in", option_b="on", option_c="at", option_d="under", correct_answer="B")
    ]

    db.add_all(q_m + q_s + q_e)
    db.commit()
    print("[OK] Seeded 30 Quiz Questions.")

    # 5. Seed Admin User
    admin = models.User(id=1, name="System Administrator", email="admin@aivyra.com",
                        password_hash=get_password_hash("admin123"), role="ADMIN")
    db.add(admin)
    db.commit()
    print("[OK] Seeded admin@aivyra.com / admin123")

    # 6. Seed Teacher User
    teacher_user = models.User(id=2, name="Saraswati Devi", email="teacher@aivyra.com",
                               password_hash=get_password_hash("teacher123"), role="TEACHER")
    db.add(teacher_user)
    db.commit()
    teacher_profile = models.Teacher(id=1, user_id=teacher_user.id, specialization="Mathematics & General Science")
    db.add(teacher_profile)
    db.commit()
    print("[OK] Seeded teacher@aivyra.com / teacher123")

    # 7. Seed Student User
    student_user = models.User(id=3, name="Ramesh Kumar", email="student@aivyra.com",
                               password_hash=get_password_hash("student123"), role="STUDENT")
    db.add(student_user)
    db.commit()
    student_profile = models.Student(id=1, user_id=student_user.id, class_level="Class 8",
                                     language="English", village="Rampur", skill_score=60.0)
    db.add(student_profile)
    db.commit()

    # Seed initial tracking progress for Course 1, Course 2, Course 3 at 0%
    db.add(models.ProgressTracking(student_id=student_profile.id, course_id=1, completion_percentage=0.0))
    db.add(models.ProgressTracking(student_id=student_profile.id, course_id=2, completion_percentage=0.0))
    db.add(models.ProgressTracking(student_id=student_profile.id, course_id=3, completion_percentage=0.0))
    db.commit()
    print("[OK] Seeded student@aivyra.com / student123 (linked to 3 courses)")

    # 8. Seed Parent User
    parent_user = models.User(id=4, name="Vijay Kumar", email="parent@aivyra.com",
                              password_hash=get_password_hash("parent123"), role="PARENT")
    db.add(parent_user)
    db.commit()
    parent_profile = models.Parent(id=1, user_id=parent_user.id, student_id=student_profile.id)
    db.add(parent_profile)
    db.commit()
    print("[OK] Seeded parent@aivyra.com / parent123")

    print("=" * 50)
    print("Database seeding completed successfully!")
    print(f"Users count: {db.query(models.User).count()}")
    print(f"Courses count: {db.query(models.Course).count()}")
    print(f"Lessons count: {db.query(models.Lesson).count()}")
    print(f"Questions count: {db.query(models.Question).count()}")
    print("=" * 50)

except Exception as e:
    db.rollback()
    print(f"[ERROR] Seeding failed: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
