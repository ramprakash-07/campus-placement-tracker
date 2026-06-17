# 🎓 Campus Placement Tracker

A comprehensive full-stack web application for students and coordinators to track campus placement drives, manage interview rounds, and analyse placement outcomes.

---

## ✨ Features

### For Students
- **Dashboard** — KPI cards (total records, selection rate, avg CTC, total rounds), records-by-year chart, recent activity feed
- **Placement Records** — Create, view, update, delete placement applications with status tracking
- **Interview Rounds** — Log each interview round (aptitude, technical, HR, coding, GD) with questions and outcomes
- **Companies** — Browse companies visiting campus, view details and placement history
- **Bookmarks** — Wishlist companies for quick access
- **Question Bank** — Community-contributed interview questions (anonymized)
- **Analytics** — Package comparison, dropout rates, company frequency, placement trends
- **Profile** — Update name, change password
- **Dark Mode** — System-aware theme toggle

### For Coordinators
- Everything students get, plus:
- **Review Records** — Approve/reject student placement records
- **Platform-wide Analytics** — See all students' data aggregated

### For Admins
- **User Management** — View all users, manage roles
- **Platform Statistics** — Global overview of the platform

### Technical Features
- **JWT Authentication** — Secure token-based auth with password reset (OTP)
- **Role-based Access Control** — Student, Coordinator, Admin roles
- **Rate Limiting** — Slowapi-based rate limiting on sensitive endpoints
- **Request Logging** — Timestamped rotating log files
- **Error Boundaries** — Graceful React error handling with fallback UI
- **Responsive Design** — Mobile-first with bottom nav, card stacks, full-screen modals
- **Global Search** — Search across companies, records, and rounds

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router v6, React Hook Form + Zod |
| **Charts** | Recharts |
| **State** | React Query (TanStack), Context API |
| **Icons** | Lucide React |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy ORM, Alembic |
| **Database** | PostgreSQL |
| **Auth** | JWT (PyJWT), bcrypt |
| **Rate Limiting** | SlowAPI |
| **Testing** | pytest, httpx, TestClient |
| **Deployment** | Vercel (frontend), Render (backend + DB) |

---

## 📁 Project Structure

```
campus-placement-tracker/
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route pages
│   │   ├── services/           # API service functions
│   │   ├── store/              # Context providers (Auth, Theme)
│   │   └── App.jsx             # Root with routing
│   ├── vercel.json             # Vercel SPA rewrite rules
│   └── index.html              # Entry with SEO meta tags
│
├── backend/                    # FastAPI REST API
│   ├── routers/                # API route handlers
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── core/                   # Config, security helpers
│   ├── db/                     # Database engine & session
│   ├── alembic/                # Database migrations
│   ├── tests/                  # pytest test suite (43 tests)
│   ├── main.py                 # FastAPI app entry point
│   ├── init_db.py              # Admin user seed
│   ├── seed_data.py            # Demo data seed
│   ├── alembic_run.py          # Deployment migration runner
│   ├── render.yaml             # Render deployment config
│   └── Procfile                # Alternative deployment
│
├── DEPLOYMENT.md               # Full deployment guide
└── README.md                   # This file
```

---

## 🚀 Local Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **PostgreSQL 14+** (running locally)

### Backend

```bash
cd backend

# Create and configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, SECRET_KEY, etc.

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Seed admin user
python init_db.py

# (Optional) Seed demo data
python seed_data.py

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at **http://localhost:5173** with the API at **http://localhost:8000**.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | — |
| `SECRET_KEY` | JWT signing secret | ✅ | — |
| `ALGORITHM` | JWT algorithm | ❌ | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | ❌ | `30` |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ | `http://localhost:5173` |
| `COORDINATOR_INVITE_CODE` | Code for coordinator registration | ❌ | `""` |
| `ADMIN_EMAIL` | Admin user email for seeding | ❌ | `""` |
| `ADMIN_PASSWORD` | Admin user password for seeding | ❌ | `""` |
| `SMTP_HOST` | SMTP server for password reset | ❌ | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | ❌ | `587` |
| `SMTP_USER` | SMTP username | ❌ | `""` |
| `SMTP_PASSWORD` | SMTP app password | ❌ | `""` |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (for production) |

---

## 📚 API Documentation

Once the backend is running, interactive API docs are available at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

The API is organized into 12 endpoint groups: Auth, Users, Companies, Placement Records, Rounds, Analytics, Coordinator, Admin, Search, Bookmarks, Question Bank, and Activity.

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

**43 test cases** covering:
- Authentication (register, login, token validation)
- Companies (CRUD, 404, unauthorized)
- Placement Records (CRUD, ownership enforcement)
- Analytics (summary shape, packages, records-by-year)

---

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete deployment guide covering:
- Vercel frontend setup
- Render backend + PostgreSQL setup
- Environment variable configuration
- Post-deployment checklist

---

## 📸 Screenshots

> Screenshots will be added here after deployment.

---

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@campus.com` | `Admin@123` |
| **Student** | `alice@campus.com` | `Student@123` |
| **Student** | `bob@campus.com` | `Student@123` |
| **Student** | `charlie@campus.com` | `Student@123` |

*Student accounts are created by running `python seed_data.py`.*

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
