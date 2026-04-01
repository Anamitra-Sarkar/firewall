"""
Authentication endpoints - privacy-first design
"""
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field
import jwt
import bcrypt
import os

from ..database import get_db
from ..models import User

router = APIRouter()

# Security config
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


# Request/Response models
class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime
    extension_token: str | None = None

    class Config:
        from_attributes = True


def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(user_id: int, username: str, expires_delta: timedelta | None = None) -> str:
    """Create JWT access token"""
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": str(user_id), "username": username, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: int) -> str:
    """Create refresh token"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": str(user_id), "type": "refresh", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str, db: AsyncSession = Depends(get_db)) -> User:
    """Verify JWT token and return user"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        result = await db.execute(select(User).filter(User.id == int(user_id)))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Register new user - minimal privacy-first data collection"""
    # Check username exists
    result = await db.execute(select(User).filter(User.username == request.username))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    user = User(
        username=request.username,
        hashed_password=hash_password(request.password),
        extension_token=f"ngfw_{uuid.uuid4().hex[:20]}",
        created_at=datetime.utcnow(),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(user.id, user.username)
    refresh_token = create_refresh_token(user.id)
    
    # Set refresh token in httpOnly cookie
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=True,  # In prod, set True for HTTPS only
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
    }


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Login with username/password"""
    # Find user
    result = await db.execute(select(User).filter(User.username == request.username))
    user = result.scalars().first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        # Generic error to prevent enumeration
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Create tokens
    access_token = create_access_token(user.id, user.username)
    refresh_token = create_refresh_token(user.id)
    
    # Set refresh token in httpOnly cookie
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=True,  # In prod, set True for HTTPS only
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: "RefreshTokenRequest", db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_id = int(payload.get("sub"))
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(user.id, user.username)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "username": user.username,
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/logout")
async def logout(response: Response):
    """Logout - clear refresh token"""
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user: User = Depends(get_current_user)):
    """Get current user info"""
    return user


@router.post("/verify-extension-token")
async def verify_extension_token(token: str, db: AsyncSession = Depends(get_db)):
    """Verify extension token"""
    result = await db.execute(select(User).filter(User.extension_token == token))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid extension token")
    
    return {"valid": True, "username": user.username}


@router.get("/extension-token", response_model=dict)
async def get_extension_token(user: User = Depends(get_current_user)):
    """Get masked extension token"""
    if not user.extension_token:
        return {"token": None, "masked": None}
    
    token = user.extension_token
    # Mask token: show first 6 and last 3 chars
    masked = token[:6] + "..." + token[-3:] if len(token) > 9 else "***"
    
    return {"token": token, "masked": masked}


@router.post("/extension-token/regenerate", response_model=dict)
async def regenerate_extension_token(
    password: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Regenerate extension token (requires password confirmation)"""
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Generate new token
    user.extension_token = f"ngfw_{uuid.uuid4().hex[:20]}"
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": "Token regenerated",
        "token": user.extension_token,
        "masked": user.extension_token[:6] + "..." + user.extension_token[-3:]
    }


# Add RefreshTokenRequest model after other models
class RefreshTokenRequest(BaseModel):
    refresh_token: str
