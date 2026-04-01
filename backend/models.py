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
    Table,
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


# Association table for incident-threat M2M relationship
# Must be defined BEFORE Threat and Incident models that reference it
incident_threats = Table(
    "incident_threats",
    Base.metadata,
    Column("incident_id", Integer, ForeignKey("incidents.id")),
    Column("threat_id", Integer, ForeignKey("threats.id")),
)


class User(Base):
    """User account - privacy-first design"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    extension_token = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    last_login = Column(DateTime, nullable=True)

    # Relationships
    incidents = relationship("Incident", back_populates="assignee")
    traffic_events = relationship("TrafficEvent", back_populates="user")
    behavioral_signals = relationship("BehavioralSignal", back_populates="user")
    access_logs = relationship("AccessLog", back_populates="user")
    ioc_hits = relationship("IOCHit", back_populates="user")
    firewall_rules = relationship("FirewallRule", back_populates="user")


class TrafficEvent(Base):
    """Traffic events from extension"""
    __tablename__ = "traffic_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    url = Column(String)
    domain = Column(String, index=True)
    threat_score = Column(Float, default=0.0)
    classification = Column(String)  # benign, suspicious, malicious
    source = Column(String)  # chrome_extension, simulator
    blocked = Column(Boolean, default=False)
    tab_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, index=True, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="traffic_events")


class BehavioralSignal(Base):
    """Behavioral analysis signals"""
    __tablename__ = "behavioral_signals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    keystroke_timing_avg = Column(Float, nullable=True)
    mouse_velocity_avg = Column(Float, nullable=True)
    idle_time = Column(Float, nullable=True)
    tab_focused = Column(Boolean, default=True)
    copy_paste_detected = Column(Boolean, default=False)
    risk_score = Column(Float, default=0.0)
    timestamp = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="behavioral_signals")


class AccessLog(Base):
    """Access control logs"""
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    resource = Column(String)
    decision = Column(String)  # ALLOW, DENY, RESTRICT
    risk_score = Column(Float, default=0.0)
    reason = Column(String)
    timestamp = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="access_logs")


class IOCHit(Base):
    """Indicator of Compromise hits"""
    __tablename__ = "ioc_hits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    domain = Column(String, index=True)
    ioc_type = Column(String)
    confidence = Column(Float)
    mitre_ttp = Column(String, nullable=True)
    first_seen = Column(DateTime, server_default=func.now())
    last_seen = Column(DateTime, server_default=func.now(), onupdate=func.now())
    hit_count = Column(Integer, default=1)

    # Relationships
    user = relationship("User", back_populates="ioc_hits")


class FirewallRule(Base):
    """User-defined firewall rules"""
    __tablename__ = "firewall_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    rule_name = Column(String)
    action = Column(String)  # ALLOW, DENY
    condition = Column(String)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    last_triggered = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="firewall_rules")


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
    mitre_techniques = Column(JSON)  # MITRE techniques as JSON array
    detected_at = Column(DateTime, index=True, server_default=func.now())
    confidence_score = Column(Float, default=0.0)
    traffic_flow_id = Column(Integer, ForeignKey("traffic_flows.id"))
    ai_explanation = Column(Text)  # Groq-generated explanation

    # Relationships
    traffic_flow = relationship("TrafficFlow", back_populates="threats")
    # M2M with Incident via association table — no direct FK between threats/incidents
    incidents = relationship("Incident", secondary=incident_threats, back_populates="threats")


class Incident(Base):
    """Security incidents"""
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, index=True)
    description = Column(Text)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.OPEN)
    severity = Column(Enum(ThreatSeverity), default=ThreatSeverity.MEDIUM)
    threat_type = Column(String, nullable=True)
    affected_domain = Column(String, nullable=True)
    playbook_executed = Column(Boolean, default=False)
    groq_narrative = Column(Text, nullable=True)
    mitre_ttp = Column(String, nullable=True)
    created_at = Column(DateTime, index=True, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    remediation_steps = Column(JSON, nullable=True)

    # Relationships
    threats = relationship("Threat", secondary=incident_threats, back_populates="incidents")
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
