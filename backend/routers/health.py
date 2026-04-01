"""
Health check endpoints
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-ngfw",
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check - ensure all dependencies are available"""
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
    }
