"""
Standardized API response helpers.

Every successful response is wrapped in a consistent envelope:

    {"data": ..., "message": "success"}
"""

from typing import Any

from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    message: str = "success",
    status_code: int = 200,
) -> JSONResponse:
    """Return a JSON response wrapped in the standard envelope."""
    return JSONResponse(
        status_code=status_code,
        content={"data": data, "message": message},
    )
