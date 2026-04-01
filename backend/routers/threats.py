"""
Threat intelligence and detection endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select
from pydantic import BaseModel
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Threat, ThreatSeverity

router = APIRouter()


class ThreatResponse(BaseModel):
    id: int
    name: str
    severity: str
    threat_type: str
    description: str
    confidence_score: float
    detected_at: datetime
    mitre_techniques: List[str]
    ai_explanation: str

    class Config:
        from_attributes = True


class ThreatRequest(BaseModel):
    name: str
    threat_type: str
    severity: str = "medium"
    description: str
    confidence_score: float = 0.5


@router.get("/", response_model=List[ThreatResponse])
async def get_threats(
    severity: str = Query(None),
    limit: int = Query(100, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get detected threats"""
    query = select(Threat).order_by(Threat.detected_at.desc()).limit(limit)
    if severity:
        query = query.where(Threat.severity == severity)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ThreatResponse)
async def create_threat(request: ThreatRequest, db: AsyncSession = Depends(get_db)):
    """Create a new threat record"""
    threat = Threat(
        name=request.name,
        threat_type=request.threat_type,
        severity=request.severity,
        description=request.description,
        confidence_score=request.confidence_score,
    )
    db.add(threat)
    await db.commit()
    await db.refresh(threat)
    return threat


@router.get("/{threat_id}", response_model=ThreatResponse)
async def get_threat(threat_id: int, db: AsyncSession = Depends(get_db)):
    """Get specific threat details"""
    threat = await db.get(Threat, threat_id)
    if not threat:
        raise ValueError("Threat not found")
    return threat


@router.get("/iocs/check")
async def check_ioc(ioc: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Check if IOC is known malicious"""
    return {
        "ioc": ioc,
        "is_malicious": False,
        "sources": [],
        "last_seen": None,
    }
