"""
Campus Placement Tracker — FastAPI application entry-point.
"""

import os
import time
import logging
from logging.handlers import TimedRotatingFileHandler
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from core.config import settings  # validates env vars on import
from routers.auth import router as auth_router
from routers.analytics import router as analytics_router
from routers.companies import router as companies_router
from routers.placement_records import router as placement_records_router
from routers.rounds import router as rounds_router
from routers.users import router as users_router
from routers.coordinator import router as coordinator_router
from routers.admin import router as admin_router
from routers.search import router as search_router
from routers.bookmarks import router as bookmarks_router
from routers.question_bank import router as question_bank_router
from routers.activity import router as activity_router


# ---------------------------------------------------------------------------
# Request logging setup
# ---------------------------------------------------------------------------
_log_dir = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(_log_dir, exist_ok=True)

_request_logger = logging.getLogger("request_logger")
_request_logger.setLevel(logging.INFO)
_handler = TimedRotatingFileHandler(
    os.path.join(_log_dir, "app.log"),
    when="midnight",
    interval=1,
    backupCount=7,
    encoding="utf-8",
)
_handler.setFormatter(
    logging.Formatter("%(asctime)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
)
_request_logger.addHandler(_handler)


# ---------------------------------------------------------------------------
# Rate limiter (slowapi)
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


# ---------------------------------------------------------------------------
# Lifespan: runs once on startup / shutdown
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load configuration and perform startup checks."""
    print(f"[START] {settings.ALGORITHM} | DB -> {settings.DATABASE_URL[:30]}...")
    yield
    print("[STOP] Shutting down...")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Campus Placement Tracker API",
    description="Backend API for the Campus Placement Tracker application",
    version="0.1.0",
    lifespan=lifespan,
)

# Attach limiter state and custom 429 handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


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
# Request logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request: method, path, status, response time."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    _request_logger.info(
        "%s %s → %d (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


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
app.include_router(coordinator_router)
app.include_router(admin_router)
app.include_router(search_router)
app.include_router(bookmarks_router)
app.include_router(question_bank_router)
app.include_router(activity_router)


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
