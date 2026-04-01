"""
Incident response and management endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Incident, IncidentStatus

router = APIRouter()


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    severity: str
    created_at: datetime
    updated_at: datetime
    remediation_steps: List[str]

    class Config:
        from_attributes = True


class IncidentRequest(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    threat_ids: List[int] = []


class IncidentUpdateRequest(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    remediation_steps: Optional[List[str]] = None


class RequestAnalysisRequest(BaseModel):
    url: str
    domain: str
    protocol: str
    method: str = "GET"
    timestamp: Optional[str] = None
    tabId: Optional[int] = None
    source: Optional[str] = None


class RequestAnalysisResponse(BaseModel):
    threat_score: float
    threat_type: Optional[str] = None
    is_threat: bool
    reason: str
    cached: bool = False


@router.get("/", response_model=List[IncidentResponse])
async def get_incidents(
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get incidents"""
    query = select(Incident).order_by(Incident.created_at.desc()).limit(limit)
    if status:
        query = query.where(Incident.status == status)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=IncidentResponse)
async def create_incident(
    request: IncidentRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create new incident"""
    incident = Incident(
        title=request.title,
        description=request.description,
        severity=request.severity,
    )
    db.add(incident)
    await db.commit()
    await db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: int, db: AsyncSession = Depends(get_db)):
    """Get incident details"""
    incident = await db.get(Incident, incident_id)
    if not incident:
        raise ValueError("Incident not found")
    return incident


@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: int,
    request: IncidentUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update incident"""
    incident = await db.get(Incident, incident_id)
    if not incident:
        raise ValueError("Incident not found")
    
    if request.status:
        incident.status = request.status
    if request.description:
        incident.description = request.description
    if request.remediation_steps:
        incident.remediation_steps = request.remediation_steps
    
    await db.commit()
    await db.refresh(incident)
    return incident


@router.post("/{incident_id}/resolve")
async def resolve_incident(
    incident_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Resolve incident"""
    incident = await db.get(Incident, incident_id)
    if incident:
        incident.status = IncidentStatus.RESOLVED
        await db.commit()
    
    return {"status": "resolved"}


@router.post("/analyze", response_model=RequestAnalysisResponse)
async def analyze_request(
    request: RequestAnalysisRequest,
):
    """
    Analyze a request for threats (used by browser extension)
    
    This endpoint receives requests from the AI-NGFW browser extension
    and returns a threat score and classification.
    """
    import random  # Placeholder for real threat analysis
    
    # Extract domain for analysis
    domain = request.domain.lower()
    
    # Simple placeholder threat analysis logic
    # In production, this would use:
    # - ML models for threat scoring
    # - IoC (Indicator of Compromise) databases
    # - Behavioral signal analysis
    # - Real-time threat intelligence feeds
    
    threat_indicators = {
        'phishing': 0.0,
        'malware': 0.0,
        'suspicious': 0.0,
    }
    
    # Check for common phishing patterns
    phishing_keywords = ['login', 'verify', 'confirm', 'update', 'payment', 'urgent']
    if any(keyword in domain for keyword in phishing_keywords):
        threat_indicators['phishing'] += 0.2
    
    # Check protocol
    if request.protocol != 'https:':
        threat_indicators['suspicious'] += 0.15
    
    # Calculate overall threat score
    threat_score = min(sum(threat_indicators.values()) / 3.0, 1.0)
    
    # Determine threat type
    threat_type = None
    if threat_score > 0.7:
        threat_type = max(threat_indicators, key=threat_indicators.get)
    
    return RequestAnalysisResponse(
        threat_score=threat_score,
        threat_type=threat_type,
        is_threat=threat_score > 0.7,
        reason="Request analyzed" if threat_score <= 0.7 else f"Potential {threat_type}",
        cached=False,
    )
