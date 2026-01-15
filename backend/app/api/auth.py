"""
Authentication endpoints for user registration, login, and token refresh.
Admin-only authentication system (students don't need accounts).
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import AuthenticationError, ConflictError, BadRequestError
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshTokenRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new admin user.

    Creates a new user account and returns JWT tokens for immediate authentication.

    Args:
        request: Registration details (name, email, password)
        db: Database session

    Returns:
        TokenResponse with access and refresh tokens

    Raises:
        ConflictError: If email is already registered
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise ConflictError(detail="Email already registered")

    # Create new user with hashed password
    user = User(
        name=request.name,
        email=request.email,
        password_hash=get_password_hash(request.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate JWT tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT tokens.

    Validates email and password, then returns access and refresh tokens.

    Args:
        request: Login credentials (email, password)
        db: Database session

    Returns:
        TokenResponse with access and refresh tokens

    Raises:
        AuthenticationError: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Verify user exists and password is correct
    if not user or not verify_password(request.password, user.password_hash):
        raise AuthenticationError(detail="Incorrect email or password")

    # Generate JWT tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using a valid refresh token.

    Validates the refresh token and issues a new access token.
    Does NOT issue a new refresh token (client keeps the existing one).

    Args:
        request: Refresh token
        db: Database session

    Returns:
        TokenResponse with new access token and same refresh token

    Raises:
        AuthenticationError: If refresh token is invalid or user not found
    """
    try:
        payload = decode_token(request.refresh_token)

        # Validate token type
        token_type = payload.get("type")
        if token_type != "refresh":
            raise AuthenticationError(detail="Invalid token type")

        # Extract user ID
        user_id: int = payload.get("sub")
        if user_id is None:
            raise AuthenticationError(detail="Invalid token payload")

    except Exception as e:
        raise AuthenticationError(detail=f"Could not validate refresh token: {str(e)}")

    # Verify user still exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AuthenticationError(detail="User not found")

    # Issue new access token
    new_access_token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=request.refresh_token,  # Return same refresh token
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(db: Session = Depends(get_db)):
    """
    Get current authenticated user's information.

    This endpoint requires a valid access token in the Authorization header.

    Args:
        db: Database session

    Returns:
        UserResponse with user details

    Note:
        Currently returns minimal user info. Expand as needed.
    """
    # TODO: Implement get_current_user dependency once we have it
    # For now, this is a placeholder
    raise BadRequestError(detail="Not yet implemented")
