from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.schemas import UserLogin, Token, UserOut, UserRegister
from app.services.auth import create_access_token, get_current_user, verify_password, get_password_hash, set_session_cookie, clear_session_cookie
from app.services.database import get_db
from app.services.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

def normalize_email(email: str) -> str:
    return email.strip().lower()

@router.post("/login", response_model=Token)
def login_for_access_token(response: Response, data: UserLogin, db: Session = Depends(get_db)):
    email = normalize_email(data.email)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email address not registered")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled. Contact your Super Admin.")
    access_token = create_access_token(data={"sub": user.email})
    set_session_cookie(response, access_token)
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "full_name": user.full_name, "title": user.title, "email": user.email}

@router.post("/refresh", response_model=Token)
def refresh_token(response: Response, current_user: User = Depends(get_current_user)):
    access_token = create_access_token(data={"sub": current_user.email})
    set_session_cookie(response, access_token)
    return {"access_token": access_token, "token_type": "bearer", "role": current_user.role, "full_name": current_user.full_name, "title": current_user.title, "email": current_user.email}

@router.post("/logout")
def logout(response: Response):
    clear_session_cookie(response)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "full_name": current_user.full_name, "title": current_user.title, "role": current_user.role, "email": current_user.email, "assigned_admin_id": current_user.assigned_admin_id, "created_at": current_user.created_at.isoformat() if current_user.created_at else None}

@router.get("/session")
def session(current_user: User = Depends(get_current_user)):
    return {"authenticated": True, "user": read_users_me(current_user)}
