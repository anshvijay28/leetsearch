from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

# Import routers
from .routes.search import router as search_router
from .routes.lists import router as lists_router
from .routes.problems import router as problems_router

# Import rate limiter
from .middleware.rate_limit import limiter, rate_limit_exceeded_handler

# Request body size limit (0.5MB)
MAX_BODY_SIZE = 512 * 1024  # 512KB = 0.5MB


class LimitRequestBodyMiddleware(BaseHTTPMiddleware):
    """Middleware to limit request body size and prevent DoS attacks."""
    
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        
        if content_length and int(content_length) > MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large. Maximum size is 0.5MB."}
            )
        
        return await call_next(request)


# Create FastAPI instance with custom docs
app = FastAPI(docs_url="/api/py/docs")

# Register rate limiter with app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Add request body size limit middleware
app.add_middleware(LimitRequestBodyMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(search_router)
app.include_router(lists_router)
app.include_router(problems_router)
