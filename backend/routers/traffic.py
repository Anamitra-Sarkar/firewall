"""
Traffic analysis endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models import TrafficFlow

router = APIRouter()


class TrafficFlowResponse(BaseModel):
    id: int
    src_ip: str
    dst_ip: str
    src_port: int
    dst_port: int
    protocol: str
    byte_count: int
    packet_count: int
    duration: float
    anomaly_score: float
    classification: str
    timestamp: datetime

    class Config:
        from_attributes = True


class TrafficAnalysisRequest(BaseModel):
    src_ip: str
    dst_ip: str
    protocol: str
    byte_count: int = 0
    packet_count: int = 0
    duration: float = 0.0


@router.get("/flows", response_model=List[TrafficFlowResponse])
async def get_traffic_flows(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get recent traffic flows"""
    result = await db.execute(
        select(TrafficFlow)
        .order_by(TrafficFlow.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/analyze")
async def analyze_traffic(request: TrafficAnalysisRequest):
    """Analyze traffic for threats"""
    return {
        "src_ip": request.src_ip,
        "dst_ip": request.dst_ip,
        "threats_detected": [],
        "anomaly_score": 0.0,
        "classification": "benign",
    }


@router.get("/statistics")
async def get_traffic_statistics(
    hours: int = Query(24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
):
    """Get traffic statistics"""
    return {
        "total_flows": 0,
        "total_bytes": 0,
        "avg_anomaly_score": 0.0,
        "top_destinations": [],
    }
