"""
Campus Placement Tracker — FastAPI application entry-point.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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


# ---------------------------------------------------------------------------
# CORS middleware — origins driven by FRONTEND_URL env var
# ---------------------------------------------------------------------------
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[_frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    """Return a clean 422 response for request-validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation failed",
            "details": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all for any unhandled server errors — returns a safe 500."""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
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
    return {"data": {"message": "Campus Placement Tracker API is running"}, "message": "success"}


@app.get("/health")
def health_check():
    """Health-check endpoint for uptime monitors."""
    return {"data": {"status": "ok"}, "message": "success"}
