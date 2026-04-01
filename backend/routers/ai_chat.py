"""
AI-powered chat and analysis endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
import json
import logging
from ..database import get_db
from ..services.ai_service import get_ai_service

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    context: dict = {}


class ThreatExplanationRequest(BaseModel):
    threat_id: int
    threat_name: str
    threat_type: str
    severity: str
    indicators: list


class SOARDecisionRequest(BaseModel):
    incident_id: int
    title: str
    description: str
    severity: str
    threats: list
    affected_systems: list


@router.post("/chat/stream")
async def chat_stream(
    request: ChatMessage,
    db: AsyncSession = Depends(get_db),
):
    """Stream AI chat response"""
    ai_service = get_ai_service()
    
    try:
        response = await ai_service.answer_security_question(
            request.message,
            request.context
        )
        
        # Return as streaming response
        def generate():
            yield json.dumps({"type": "content", "content": response})
            yield "\n"
            yield json.dumps({"type": "end"})
        
        return StreamingResponse(generate(), media_type="application/x-ndjson")
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat processing error")


@router.post("/explain-threat")
async def explain_threat(
    request: ThreatExplanationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Get AI explanation for a threat"""
    ai_service = get_ai_service()
    
    try:
        explanation = await ai_service.explain_threat({
            "name": request.threat_name,
            "type": request.threat_type,
            "severity": request.severity,
            "indicators": request.indicators,
            "mitre_techniques": [],
        })
        
        return {
            "threat_id": request.threat_id,
            "explanation": explanation,
        }
    except Exception as e:
        logger.error(f"Explanation error: {e}")
        raise HTTPException(status_code=500, detail="Explanation generation failed")


@router.post("/soar-decision")
async def get_soar_decision(
    request: SOARDecisionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Get SOAR-powered incident response decision"""
    ai_service = get_ai_service()
    
    try:
        decision = await ai_service.generate_soar_decision({
            "title": request.title,
            "description": request.description,
            "severity": request.severity,
            "threats": request.threats,
            "affected_systems": request.affected_systems,
        })
        
        return {
            "incident_id": request.incident_id,
            "decision": decision,
        }
    except Exception as e:
        logger.error(f"SOAR decision error: {e}")
        raise HTTPException(status_code=500, detail="SOAR decision generation failed")


@router.get("/suggestions")
async def get_ai_suggestions(
    topic: str = None,
    db: AsyncSession = Depends(get_db),
):
    """Get AI suggestions for security improvements"""
    return {
        "suggestions": [
            "Enable Zero Trust policies for critical assets",
            "Implement behavioral analytics for user accounts",
            "Deploy federated learning model",
        ]
    }
