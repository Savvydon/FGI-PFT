import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from ..schemas import TokenData

# SECRET & JWT CONFIG
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set")

ALGORITHM = "HS256"
# CHANGED: 24 hours (1440 min). Frontend handles 30-min idle timeout.
# Short-lived access token. The frontend refreshes this token while the user is
# active, so an active user can remain signed in indefinitely. If there is no
# activity, the token expires shortly after the 30-minute idle policy.
ACCESS_TOKEN_EXPIRE_MINUTES = 31

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Cookie name for session
SESSION_COOKIE_NAME = "pft_session"

# PASSWORD HELPERS
def _truncate_password(password: str) -> str:
    """
    bcrypt only supports passwords up to 72 bytes.
    This safely truncates the password to avoid bcrypt errors.
    """
    return password.encode("utf-8")[:72].decode("utf-8", "ignore")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hashed value.
    """
    safe_password = _truncate_password(plain_password)
    return pwd_context.verify(safe_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash password safely with bcrypt.
    """
    safe_password = _truncate_password(password)
    return pwd_context.hash(safe_password)

# JWT TOKEN CREATION
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# SET SESSION COOKIE
def set_session_cookie(response: Response, token: str):
    """
    Set the session cookie with the JWT token.
    """
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,  # Set to True for HTTPS (production)
        samesite="none",  # Changed to "none" for cross-site cookies with HTTPS
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

# CLEAR SESSION COOKIE
def clear_session_cookie(response: Response):
    """
    Clear the session cookie (logout).
    """
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        samesite="none",
        secure=True
    )

# GET CURRENT USER FROM COOKIE OR HEADER (supports both)
async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = None
    
    # Try to get token from cookie first
    token = request.cookies.get(SESSION_COOKIE_NAME)
    
    # If no cookie, try Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
 
    user = db.query(User).filter(User.email == token_data.email).first()

    if user is None:
        raise credentials_exception

    # NEW: Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been disabled. Contact your Super Admin."
        )

    return user

# ROLE PROTECTION - ALL AUTHENTICATED USERS CAN EVALUATE
async def require_evaluator(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    ALL authenticated users can perform evaluations.
    This includes evaluators, admins, and super_admins.
    """
    # Any valid role can evaluate
    if current_user.role not in ["evaluator", "admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Valid user account required for evaluation"
        )
    return current_user

# ADMIN ACCESS (admin or super_admin only)
async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Requires admin or super_admin role.
    Evaluators cannot access admin endpoints.
    """
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user

# SUPER ADMIN ONLY
async def require_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Requires super_admin role only.
    """
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Super admin access required"
        )
    return current_user
