"""
Main FastAPI application for AI-NGFW
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path

from .config import settings, allowed_origins
from .database import init_db, close_db
from .routers import (
    auth,
    traffic,
    threats,
    incidents,
    ztna,
    federated_learning,
    rules,
    analytics,
    ai_chat,
    health,
    extension,
)
from .services.ws_manager import ConnectionManager

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# WebSocket connection manager
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    logger.info("Initializing AI-NGFW...")
    await init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down AI-NGFW...")
    await close_db()
    logger.info("Database connection closed")


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    debug=settings.debug,
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api/v1 prefix
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(traffic.router, prefix="/api/v1/traffic", tags=["Traffic Analysis"])
app.include_router(threats.router, prefix="/api/v1/threats", tags=["Threat Intelligence"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incident Response"])
app.include_router(ztna.router, prefix="/api/v1/ztna", tags=["Zero Trust"])
app.include_router(
    federated_learning.router,
    prefix="/api/v1/federated",
    tags=["Federated Learning"],
)
app.include_router(rules.router, prefix="/api/v1/rules", tags=["Policy Rules"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(ai_chat.router, prefix="/api/v1/ai", tags=["AI Chat"])
app.include_router(extension.router, prefix="/api/v1/extension", tags=["Extension"])
app.include_router(health.router, tags=["Health"])


@app.websocket("/ws/threats")
async def websocket_threats(websocket: WebSocket):
    """WebSocket endpoint for real-time threat stream"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for testing, replace with actual threat data
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI-NGFW API",
        "version": settings.api_version,
        "docs": "/docs",
    }


# Serve frontend in production
frontend_path = Path(__file__).parent.parent / "frontend" / "dist"


@app.get("/landing")
async def get_landing_page():
    """Serve the landing page"""
    landing_path = Path(__file__).parent.parent / "frontend" / "public" / "landing.html"
    if landing_path.exists():
        return FileResponse(landing_path, media_type="text/html")
    return {"error": "Landing page not found"}, 404


@app.get("/{file_path:path}")
async def serve_frontend(file_path: str):
    """Serve frontend assets"""
    if frontend_path.exists():
        file_location = frontend_path / file_path
        if file_location.is_file():
            return FileResponse(file_location)
        # Serve index.html for client-side routing
        return FileResponse(frontend_path / "index.html")
    return {"message": "Frontend not built"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload,
    )
