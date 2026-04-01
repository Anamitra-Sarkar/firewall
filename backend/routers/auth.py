"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from ..database import get_db
from ..models import User

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login endpoint - returns JWT token"""
    # Placeholder implementation
    return {"access_token": "test-token-12345", "token_type": "bearer"}


@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user():
    """Get current user info"""
    return {"id": 1, "username": "admin", "email": "admin@ngfw.local"}
