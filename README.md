# Aivyra-Tutor – AI-Powered Rural Education Platform

**Aivyra-Tutor** is a production-ready, full-stack educational platform built specifically to identify and bridge student skill gaps in rural communities. By utilizing personalized learning algorithms, local dialect configurations, and local voice assistants (Text-To-Speech and Speech-To-Text), Aivyra-Tutor brings quality education tracking to students, teachers, parents, and admins alike.

---

## Folder Structure

```bash
aivyraskill/
│
├── aivyra-backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── ai/                  # Scikit-learn AI trainer and inference files
│   │   │   ├── artifacts/       # Serialized .joblib model files
│   │   │   ├── inference.py     # AI predictors (Skill gaps, predictions, recs)
│   │   │   └── models_trainer.py# Mock student dataset training script
│   │   │
│   │   ├── routers/             # FastAPI routing modules
│   │   │   ├── ai.py            # AI endpoints
│   │   │   ├── auth.py          # Register, Login, Refresh tokens
│   │   │   ├── courses.py       # Lesson, Course, progress controls
│   │   │   └── users.py         # Student lists, Stats dashboards
│   │   │
│   │   ├── database.py          # SQLAlchemy connection sessions
│   │   ├── models.py            # Database tables schema (Postgres / SQLite)
│   │   └── schemas.py           # Pydantic validation rules
│   │
│   ├── Dockerfile               # Backend docker config
│   ├── requirements.txt         # Pip dependency list
│   └── run.py                   # Dev server auto-ML-training starter script
│
├── aivyra-frontend/             # Next.js React 19 Frontend app
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Layouts & Pages)
│   │   │   ├── admin/           # Admin Dashboard panel
│   │   │   ├── student/         # Student Dashboard (including courses & voice logs)
│   │   │   ├── teacher/         # Teacher Student Roster analytics
│   │   │   ├── parent/          # Parent panel (with local voice readouts)
│   │   │   ├── login/           # Authentication login
│   │   │   ├── register/        # Registration signup
│   │   │   ├── globals.css      # Custom styling sheets
│   │   │   ├── layout.tsx       # Standard SEO layout shell
│   │   │   └── page.tsx         # Modern custom Landing Page
│   │   │
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       └── Sidebar.tsx  # Dynamic multi-role navigation sidebar
│   │   │
│   │   ├── services/
│   │   │   └── api.ts           # Axios backend API client
│   │   └── store/
│   │       └── authStore.ts     # Zustand global session store
│   │
│   ├── Dockerfile               # Frontend docker config
│   ├── package.json             # NPM package scripts
│   ├── next.config.js           # Next compiler overrides
│   ├── tsconfig.json            # Typescript parameters
│   └── tailwind.config.ts       # Styles theme config
│
├── docker-compose.yml           # Global database/backend/frontend orchestrator
└── README.md                    # Platform documentation guide
```

---

## Default Demo Credentials

The database is automatically pre-seeded on startup with the following credentials for immediate test logins:

| Role | Email Address | Password | Features |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@aivyra.com` | `admin123` | Platform-wide user stats & container health logs |
| **TEACHER** | `teacher@aivyra.com` | `teacher123` | Class student rosters, AI diagnostic charts, specialization controls |
| **STUDENT** | `student@aivyra.com` | `student123` | Course content, voice helper dashboard, custom chart improvements |
| **PARENT** | `parent@aivyra.com` | `parent123` | Attendance indicators, text-to-speech audio grade reader |

---

## Local Setup Instructions

Ensure you have **Python 3.8+** and **Node.js 18+** installed on your system.

### 1. Run Backend

1. Navigate to the backend directory:
   ```bash
   cd aivyra-backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server (this will automatically train the Scikit-learn AI models, create the database, and seed mock data):
   ```bash
   python run.py
   ```
4. Verify the server is running by opening the Swagger API Docs in your browser at `http://127.0.0.1:8000/docs`.

### 2. Run Frontend

1. Navigate to the frontend directory:
   ```bash
   cd aivyra-frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web portal in your browser at `http://localhost:3000`.

---

## Docker Compose Quick-Start

If you have Docker and Docker Compose installed, you can start the complete database, backend, and frontend stack with a single command from the workspace root directory:

```bash
docker-compose up --build
```

* **Web Application**: `http://localhost:3000`
* **Swagger API Endpoint Docs**: `http://localhost:8000/docs`
* **Database Port**: `5432`

---

## Environment Variables

### Backend (`aivyra-backend/`)
Create a `.env` file inside `aivyra-backend/` if you want to override defaults:
* `DATABASE_URL`: Set connection string (e.g. `postgresql://user:pass@localhost:5432/dbname`). If left empty, it defaults to a local SQLite file (`aivyra.db`).
* `SECRET_KEY`: Override default JWT key.

### Frontend (`aivyra-frontend/`)
Create a `.env.local` file inside `aivyra-frontend/` if you want to override defaults:
* `NEXT_PUBLIC_API_URL`: Backend server address. Defaults to `http://127.0.0.1:8000` for local testing.
