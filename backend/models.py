"""
SQLAlchemy ORM models for AI-NGFW
"""
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    Enum,
    ForeignKey,
    JSON,
    ARRAY,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from .database import Base


class ThreatSeverity(str, enum.Enum):
    """Threat severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, enum.Enum):
    """Incident status"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class User(Base):
    """User account"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    incidents = relationship("Incident", back_populates="assignee")


class TrafficFlow(Base):
    """Network traffic flow records"""
    __tablename__ = "traffic_flows"

    id = Column(Integer, primary_key=True, index=True)
    src_ip = Column(String, index=True)
    dst_ip = Column(String, index=True)
    src_port = Column(Integer)
    dst_port = Column(Integer)
    protocol = Column(String)
    byte_count = Column(Integer)
    packet_count = Column(Integer)
    duration = Column(Float)
    anomaly_score = Column(Float, default=0.0)
    classification = Column(String)  # benign, suspicious, malicious
    timestamp = Column(DateTime, index=True, server_default=func.now())

    # Relationships
    threats = relationship("Threat", back_populates="traffic_flow")


class Threat(Base):
    """Detected threats"""
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    severity = Column(Enum(ThreatSeverity), default=ThreatSeverity.MEDIUM)
    threat_type = Column(String)  # malware, botnet, ddos, etc.
    description = Column(Text)
    indicators = Column(JSON)  # IOCs
    mitre_techniques = Column(ARRAY(String))
    detected_at = Column(DateTime, index=True, server_default=func.now())
    confidence_score = Column(Float, default=0.0)
    traffic_flow_id = Column(Integer, ForeignKey("traffic_flows.id"))
    ai_explanation = Column(Text)  # Groq-generated explanation

    # Relationships
    traffic_flow = relationship("TrafficFlow", back_populates="threats")
    incidents = relationship("Incident", back_populates="threats")


class Incident(Base):
    """Security incidents"""
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.OPEN)
    severity = Column(Enum(ThreatSeverity), default=ThreatSeverity.MEDIUM)
    created_at = Column(DateTime, index=True, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    assigned_to = Column(Integer, ForeignKey("users.id"))
    remediation_steps = Column(ARRAY(String))
    soar_decision = Column(Text)  # Groq-powered SOAR decision

    # Relationships
    threats = relationship("Threat", secondary="incident_threats")
    assignee = relationship("User", back_populates="incidents")


class ThreatIntelligence(Base):
    """External threat intelligence feeds"""
    __tablename__ = "threat_intelligence"

    id = Column(Integer, primary_key=True, index=True)
    ioc_type = Column(String)  # ip, domain, hash, url
    ioc_value = Column(String, index=True)
    source = Column(String)
    confidence = Column(Float)
    last_seen = Column(DateTime, server_default=func.now(), onupdate=func.now())
    added_at = Column(DateTime, server_default=func.now())


class ZeroTrustPolicy(Base):
    """Zero Trust Network Access policies"""
    __tablename__ = "ztna_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    enabled = Column(Boolean, default=True)
    device_trust_score_threshold = Column(Float, default=0.8)
    user_behavior_analysis = Column(Boolean, default=True)
    behavioral_biometrics = Column(Boolean, default=True)
    policy_rules = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class FederatedLearningModel(Base):
    """Federated learning model versions"""
    __tablename__ = "federated_models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True)
    version = Column(Integer)
    accuracy = Column(Float)
    parameters = Column(JSON)
    global_round = Column(Integer)
    training_data_samples = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())


class SecurityRule(Base):
    """Security policies and rules"""
    __tablename__ = "security_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    rule_type = Column(String)  # firewall, dpi, behavioral
    conditions = Column(JSON)
    actions = Column(JSON)
    enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AnalyticsEvent(Base):
    """Event logging for analytics"""
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True)
    event_data = Column(JSON)
    timestamp = Column(DateTime, index=True, server_default=func.now())


# Association table for incident-threat relationship
from sqlalchemy import Table

incident_threats = Table(
    "incident_threats",
    Base.metadata,
    Column("incident_id", Integer, ForeignKey("incidents.id")),
    Column("threat_id", Integer, ForeignKey("threats.id")),
)
