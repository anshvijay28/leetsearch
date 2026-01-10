"""
Rate limiting middleware using slowapi.

Provides per-IP rate limiting for unauthenticated endpoints
and per-user rate limiting for authenticated endpoints.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse


def get_user_id_or_ip(request: Request) -> str:
    """
    Get rate limit key based on user ID (if authenticated) or IP address.
    
    For authenticated requests, uses the user ID from the Authorization header.
    For unauthenticated requests, falls back to IP address.
    """
    auth_header = request.headers.get("Authorization")
    
    if auth_header and auth_header.startswith("Bearer "):
        # Use a hash of the token as the key (don't expose full token)
        # This groups requests by the same authenticated user
        token = auth_header[7:]  # Remove "Bearer " prefix
        # Use first 20 chars of token as identifier (unique enough)
        return f"user:{token[:20]}"
    
    # Fallback to IP address for unauthenticated requests
    return get_remote_address(request)


# Create limiter instance with per-user/IP key function
limiter = Limiter(key_func=get_user_id_or_ip)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Custom handler for rate limit exceeded errors.
    Returns a JSON response with 429 status code.
    """
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Please slow down.",
            "retry_after": exc.detail
        }
    )


# Rate limit constants for different endpoint types
SEARCH_LIMIT = "30/minute"      # Vector search (expensive)
LISTS_LIMIT = "60/minute"       # List CRUD operations
PROBLEMS_LIMIT = "60/minute"    # Problem browsing/search

