"""
Authentication service for FastAPI endpoints.

Provides dependency functions to verify JWT tokens and authenticate users
for protected API endpoints.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from db.connection import get_supabase_client

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    FastAPI dependency that verifies JWT token and returns authenticated user.
    
    This function:
    1. Extracts the JWT token from the Authorization header
    2. Verifies the token with Supabase
    3. Returns the user object if valid
    4. Raises 401 error if invalid or missing
    
    Usage in endpoints:
        @app.post("/api/py/lists")
        async def create_list(list_data: ListCreate, user = Depends(get_current_user)):
            # user.id contains the authenticated user's UUID
            # user.email contains the user's email
            ...
    """
    supabase: Client = get_supabase_client()
    
    try:
        # Verify the JWT token with Supabase
        # get_user() validates the token signature and expiration
        response = supabase.auth.get_user(credentials.credentials)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        return response.user
    except Exception as e:
        # Handle any errors during token verification
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Convenience dependency that returns just the user ID (UUID string).
    
    Use this when you only need the user ID, not the full user object.
    More efficient than get_current_user if you only need the ID.
    
    Usage:
        @app.delete("/api/py/lists/{list_id}")
        async def delete_list(list_id: str, user_id: str = Depends(get_current_user_id)):
            # user_id is the UUID string
            ...
    """
    user = get_current_user(credentials)
    return user.id

