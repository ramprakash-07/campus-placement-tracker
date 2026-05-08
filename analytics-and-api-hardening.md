# Analytics Endpoints & API Hardening

## Analytics — Round-Wise Dropout Rates

### `GET /analytics/dropout-rates`

Returns **global** round-wise dropout / failure statistics across all users in the system.

For each `round_type` (aptitude, technical, hr, group_discussion, coding), the response includes:

| Field                 | Description                                           |
|-----------------------|-------------------------------------------------------|
| `round_type`          | The type of interview round                           |
| `total`               | Total number of times this round type appears         |
| `failed`              | How many of those rounds had outcome = `failed`       |
| `dropout_rate_percent`| `(failed / total) * 100`, rounded to 2 decimal places |

**Implementation**: Uses a SQLAlchemy `group_by(Round.round_type)` query with `func.count` and `func.nullif` to conditionally count failed outcomes in a single pass.

---

### `GET /analytics/my-round-performance`

Identical response shape to `/dropout-rates`, but **scoped to the authenticated user's records only**. Joins `Round → PlacementRecord` and filters by `PlacementRecord.user_id == current_user.id`.

Both endpoints share a private helper `_build_dropout_stats(db, user_id=None)` to avoid code duplication.

---

## API Hardening — CORS, Error Handling, Response Envelope

### CORS Middleware

- The allowed origin is now read from the `FRONTEND_URL` environment variable (defaults to `http://localhost:5173`).
- Credentials, all methods, and all headers are allowed.
- `.env` and `.env.example` updated with the new variable.

### Global Exception Handlers

| Exception                | Status | Response Body                                         |
|--------------------------|--------|-------------------------------------------------------|
| `RequestValidationError` | 422    | `{"error": "Validation failed", "details": [...]}`   |
| Unhandled `Exception`    | 500    | `{"error": "Internal server error"}`                  |

These are registered as FastAPI exception handlers in `main.py`, ensuring every error returns a predictable JSON structure.

### Standardized Response Envelope

A new helper module `core/responses.py` exposes `success_response(data, message, status_code)` that wraps any payload in:

```json
{
  "data": "...",
  "message": "success"
}
```

Root (`/`) and health-check (`/health`) endpoints already use this envelope format.

---

## Files Changed

| File                          | Change                                              |
|-------------------------------|-----------------------------------------------------|
| `routers/analytics.py`       | Added `/dropout-rates` and `/my-round-performance`  |
| `main.py`                    | CORS from env, exception handlers, envelope format  |
| `core/responses.py`          | **New** — `success_response()` helper               |
| `.env` / `.env.example`      | Added `FRONTEND_URL`                                |
