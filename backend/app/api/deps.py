"""
Dependency injection functions for FastAPI routes.
Provides database sessions, current user extraction, etc.
"""
from typing import Generator

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.core.exceptions import AuthenticationError
from app.database import get_db
from app.models.user import User

# HTTP Bearer token security scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract and validate JWT token, return current authenticated user.

    This dependency is used to protect admin endpoints that require authentication.

    Args:
        credentials: HTTP Bearer token from Authorization header
        db: Database session

    Returns:
        User object of authenticated user

    Raises:
        AuthenticationError: If token is invalid, expired, or user not found
    """
    try:
        token = credentials.credentials
        payload = decode_token(token)

        # Validate token type
        token_type = payload.get("type")
        if token_type != "access":
            raise AuthenticationError(detail="Invalid token type")

        # Extract user ID from token
        user_id: int = payload.get("sub")
        if user_id is None:
            raise AuthenticationError(detail="Invalid token payload")

    except JWTError as e:
        raise AuthenticationError(detail=f"Could not validate credentials: {str(e)}")

    # Fetch user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise AuthenticationError(detail="User not found")

    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User | None:
    """
    Extract current user if token is provided, otherwise return None.

    Use this for endpoints that work both authenticated and unauthenticated.

    Args:
        credentials: Optional HTTP Bearer token
        db: Database session

    Returns:
        User object if authenticated, None otherwise
    """
    try:
        return get_current_user(credentials, db)
    except AuthenticationError:
        return None
