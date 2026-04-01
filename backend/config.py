"""
Configuration management for AI-NGFW backend
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


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
    
    # CORS
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


def get_settings() -> Settings:
    """Get settings instance"""
    return Settings()


settings = get_settings()
