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
