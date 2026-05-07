"""
Campus Placement Tracker — FastAPI application entry-point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings  # validates env vars on import
from routers.auth import router as auth_router
from routers.analytics import router as analytics_router
from routers.companies import router as companies_router
from routers.placement_records import router as placement_records_router
from routers.rounds import router as rounds_router
from routers.users import router as users_router


# ---------------------------------------------------------------------------
# Lifespan: runs once on startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load configuration and perform startup checks."""
    # Config is already validated by the module-level import above.
    # Any additional startup work (e.g. DB migrations, cache warm-up) goes here.
    print(f"🚀  Starting {settings.ALGORITHM} | DB → {settings.DATABASE_URL[:30]}…")
    yield
    # Shutdown cleanup (if any) goes here.
    print("🛑  Shutting down…")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Campus Placement Tracker API",
    description="Backend API for the Campus Placement Tracker application",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(companies_router)
app.include_router(placement_records_router)
app.include_router(rounds_router)
app.include_router(analytics_router)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    """Root sanity-check endpoint."""
    return {"message": "Campus Placement Tracker API is running"}


@app.get("/health")
def health_check():
    """Health-check endpoint for uptime monitors."""
    return {"status": "ok"}
