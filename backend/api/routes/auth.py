from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from core.database import get_db
from core.auth import verify_password, get_password_hash, create_access_token, get_current_user
from core.config import get_settings
from core.logger import log_action
from models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    farm_name: str = ""
    farm_location: str = ""
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    farm_name: str | None
    farm_location: str | None

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserOut, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=req.email,
        full_name=req.full_name,
        farm_name=req.farm_name,
        farm_location=req.farm_location,
        hashed_password=get_password_hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(user.email, "REGISTER", f"New user registered: {user.full_name}")
    return user


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    log_action(user.email, "LOGIN")
    return {"access_token": token, "token_type": "bearer", "user": UserOut.from_orm(user)}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
