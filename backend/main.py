"""
Campus Placement Tracker — FastAPI application entry-point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings  # validates env vars on import
from routers.auth import router as auth_router
from routers.companies import router as companies_router


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
app.include_router(companies_router)


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
