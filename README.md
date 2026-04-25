# 🎓 Campus Placement Tracker

A full-stack web application for tracking and managing campus placement activities — built with a modern monorepo architecture.

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| **Frontend** | React 18, Vite, Tailwind CSS v3                |
| **Backend**  | FastAPI, SQLAlchemy, Alembic, Pydantic          |
| **Database** | PostgreSQL                                      |
| **Auth**     | python-jose (JWT), passlib (bcrypt)             |

---

## 📁 Folder Structure

```
campus-placement-tracker/
├── frontend/          # Vite + React + Tailwind CSS client
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css       # Tailwind directives
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/           # FastAPI Python server
│   ├── main.py             # App entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variable template
│
├── .gitignore         # Python + Node + env ignores
└── README.md          # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **PostgreSQL** (running locally or via Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev          # starts at http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # edit with your DB credentials
uvicorn main:app --reload   # starts at http://localhost:8000
```

---

## 📜 License

MIT
