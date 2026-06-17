"""Quick database inspection and repair script for Aivyra-Tutor."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "aivyra.db")

if not os.path.exists(DB_PATH):
    print("ERROR: aivyra.db not found - server has not been run yet.")
    sys.exit(1)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# List tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r["name"] for r in cur.fetchall()]
print(f"Tables found: {tables}")

# Check users
cur.execute("SELECT id, email, role FROM users")
users = cur.fetchall()
print(f"\nUsers ({len(users)}):")
for u in users:
    print(f"  id={u['id']} email={u['email']} role={u['role']}")

# Check courses
cur.execute("SELECT id, title FROM courses")
courses = cur.fetchall()
print(f"\nCourses ({len(courses)}):")
for c in courses:
    print(f"  id={c['id']} title={c['title']}")

# Check quiz_attempts
cur.execute("SELECT id, student_id, quiz_id, score FROM quiz_attempts")
attempts = cur.fetchall()
print(f"\nQuiz Attempts ({len(attempts)}):")
for a in attempts:
    print(f"  id={a['id']} student_id={a['student_id']} quiz_id={a['quiz_id']} score={a['score']}")

conn.close()
print("\nDiagnostics complete.")
