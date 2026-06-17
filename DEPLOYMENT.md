# Deployment Guide — Campus Placement Tracker

## Architecture Overview

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend (React + Vite) | **Vercel** | `https://your-app.vercel.app` |
| Backend (FastAPI) | **Render** | `https://your-api.onrender.com` |
| Database (PostgreSQL) | **Render** | Managed by Render |

---

## 1. Backend Deployment (Render)

### 1.1 Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New → PostgreSQL**
3. Configure:
   - **Name**: `campus-placement-db`
   - **Database**: `campus_placement_tracker`
   - **User**: `campus_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **Create Database**
5. Copy the **Internal Database URL** (starts with `postgresql://...`)

### 1.2 Create Web Service

1. Click **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `campus-placement-tracker-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python alembic_run.py && uvicorn main:app --host 0.0.0.0 --port $PORT`

### 1.3 Environment Variables

Set these in Render's **Environment** tab:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection string from step 1.1 | ✅ |
| `SECRET_KEY` | Random 64-char string (use `openssl rand -hex 32`) | ✅ |
| `ALGORITHM` | `HS256` | ❌ (default) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | ❌ (default) |
| `FRONTEND_URL` | `https://your-app.vercel.app` | ✅ |
| `COORDINATOR_INVITE_CODE` | Your secret code for coordinator registration | ✅ |
| `ADMIN_EMAIL` | `admin@campus.com` | ✅ |
| `ADMIN_PASSWORD` | Strong password for admin account | ✅ |
| `SMTP_HOST` | `smtp.gmail.com` | ❌ |
| `SMTP_PORT` | `587` | ❌ |
| `SMTP_USER` | Your email for sending OTPs | ❌ |
| `SMTP_PASSWORD` | App password for SMTP | ❌ |

### 1.4 First Deploy

On first deploy, the `alembic_run.py` script will:
1. Run all Alembic migrations (`alembic upgrade head`)
2. Seed the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### 1.5 Seed Demo Data (Optional)

To populate demo data, run in Render's Shell:
```bash
python seed_data.py
```

---

## 2. Frontend Deployment (Vercel)

### 2.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### 2.2 Environment Variables

Set in Vercel's **Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.onrender.com` |

### 2.3 SPA Routing

The `vercel.json` file is already configured with rewrite rules:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This ensures all client-side routes (e.g., `/dashboard`, `/records/1`) are handled by React Router.

### 2.4 Deploy

Click **Deploy**. Vercel will:
1. Install dependencies (`npm install`)
2. Build the production bundle (`npm run build`)
3. Serve the `dist/` directory with the rewrite rules

---

## 3. Post-Deployment Checklist

- [ ] Verify backend health: `GET https://your-api.onrender.com/health`
- [ ] Verify Swagger docs: `https://your-api.onrender.com/docs`
- [ ] Login with admin credentials at the frontend
- [ ] Test registration flow (student + coordinator with invite code)
- [ ] Create a test company and placement record
- [ ] Verify analytics dashboard populates
- [ ] Test password reset flow (requires SMTP config)

---

## 4. Alternative: Procfile Deployment

For platforms that use Procfile (Heroku, Railway):

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Run migrations manually before first deploy:
```bash
python alembic_run.py
```

---

## 5. Local Development Quick Start

```bash
# Backend
cd backend
cp .env.example .env  # Edit with your values
pip install -r requirements.txt
python -m alembic upgrade head
python init_db.py
python seed_data.py  # Optional demo data
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```
