"""
Configuration management for AI-NGFW backend
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    database_url: str = "sqlite:///./ai_ngfw.db"
    database_echo: bool = False
    
    # FastAPI
    api_title: str = "AI-NGFW API"
    api_version: str = "0.1.0"
    debug: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Groq API
    groq_api_key: Optional[str] = None
    groq_model: str = "mixtral-8x7b-32768"
    
    # HuggingFace
    huggingface_api_token: Optional[str] = None
    
    # Server
    host: str = "0.0.0.0"
    port: int = 7860
    reload: bool = False
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env


def get_settings() -> Settings:
    """Get settings instance"""
    return Settings()


def get_allowed_origins() -> list:
    """Parse CORS allowed origins from environment"""
    origins_str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,chrome-extension://*"
    )
    return [origin.strip() for origin in origins_str.split(",")]


# Initialize settings
settings = get_settings()
allowed_origins = get_allowed_origins()

# Override with environment variables if provided
if os.getenv("DEBUG"):
    settings.debug = os.getenv("DEBUG", "false").lower() == "true"
if os.getenv("PORT"):
    settings.port = int(os.getenv("PORT"))
if os.getenv("ENVIRONMENT"):
    settings.environment = os.getenv("ENVIRONMENT")
if os.getenv("SECRET_KEY"):
    settings.secret_key = os.getenv("SECRET_KEY")
if os.getenv("FRONTEND_URL"):
    settings.frontend_url = os.getenv("FRONTEND_URL")
