"""
Behavioral analysis for user and device behavior profiling
"""
import logging
from typing import List, Dict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class BehavioralAnalyzer:
    """Analyze user and device behavior for anomalies"""

    def __init__(self):
        self.user_profiles = {}
        self.device_profiles = {}

    def analyze(self, user_activity: List[Dict]) -> Dict:
        """
        Analyze user activity for behavioral anomalies
        
        Args:
            user_activity: List of user activity events
            
        Returns:
            Analysis results with risk assessment
        """
        if not user_activity:
            return {"risk_level": "low", "anomalies": []}
        
        anomalies = []
        
        # Analyze login patterns
        login_anomalies = self._analyze_login_patterns(user_activity)
        anomalies.extend(login_anomalies)
        
        # Analyze access patterns
        access_anomalies = self._analyze_access_patterns(user_activity)
        anomalies.extend(access_anomalies)
        
        # Analyze data access patterns
        data_anomalies = self._analyze_data_access(user_activity)
        anomalies.extend(data_anomalies)
        
        # Determine overall risk level
        risk_level = self._calculate_risk_level(anomalies)
        
        return {
            "risk_level": risk_level,
            "anomalies": anomalies,
            "trust_score": self._calculate_trust_score(anomalies),
        }

    def _analyze_login_patterns(self, activity: List[Dict]) -> List[Dict]:
        """Detect anomalous login patterns"""
        anomalies = []
        login_events = [a for a in activity if a.get("type") == "login"]
        
        if len(login_events) < 2:
            return anomalies
        
        # Check for impossible travel
        if self._detect_impossible_travel(login_events):
            anomalies.append({
                "type": "impossible_travel",
                "severity": "critical",
                "description": "User logged in from geographically distant locations in short time",
            })
        
        # Check for off-hours login
        for event in login_events:
            hour = datetime.fromisoformat(event.get("timestamp")).hour
            if hour < 6 or hour > 22:
                anomalies.append({
                    "type": "off_hours_login",
                    "severity": "medium",
                    "description": "Login outside normal business hours",
                })
        
        # Check for multiple failed attempts
        failed_attempts = sum(1 for e in login_events if not e.get("success", True))
        if failed_attempts > 3:
            anomalies.append({
                "type": "multiple_failed_logins",
                "severity": "high",
                "description": f"{failed_attempts} failed login attempts detected",
            })
        
        return anomalies

    def _detect_impossible_travel(self, login_events: List[Dict]) -> bool:
        """Detect impossible travel between login locations"""
        if len(login_events) < 2:
            return False
        
        locations = []
        for event in sorted(login_events, key=lambda x: x.get("timestamp")):
            loc = event.get("location", {})
            if loc:
                locations.append({
                    "city": loc.get("city"),
                    "country": loc.get("country"),
                    "timestamp": event.get("timestamp"),
                })
        
        # Simple check: different countries within 2 hours
        if len(locations) >= 2:
            last = locations[-2]
            current = locations[-1]
            if last.get("country") != current.get("country"):
                try:
                    time_diff = (
                        datetime.fromisoformat(current.get("timestamp")) -
                        datetime.fromisoformat(last.get("timestamp"))
                    )
                    if time_diff < timedelta(hours=2):
                        return True
                except:
                    pass
        
        return False

    def _analyze_access_patterns(self, activity: List[Dict]) -> List[Dict]:
        """Detect anomalous resource access patterns"""
        anomalies = []
        access_events = [a for a in activity if a.get("type") == "resource_access"]
        
        if not access_events:
            return anomalies
        
        # Check for access to sensitive resources
        sensitive_resources = ["admin", "private", "confidential", "secret"]
        for event in access_events:
            resource = event.get("resource", "").lower()
            if any(s in resource for s in sensitive_resources):
                if not event.get("authorized", False):
                    anomalies.append({
                        "type": "unauthorized_sensitive_access",
                        "severity": "critical",
                        "resource": event.get("resource"),
                    })
        
        # Check for bulk downloads
        for event in access_events:
            if event.get("data_size", 0) > 100_000_000:  # > 100MB
                anomalies.append({
                    "type": "bulk_data_access",
                    "severity": "high",
                    "size": event.get("data_size"),
                })
        
        return anomalies

    def _analyze_data_access(self, activity: List[Dict]) -> List[Dict]:
        """Analyze data access patterns"""
        anomalies = []
        data_events = [a for a in activity if a.get("type") == "data_access"]
        
        if not data_events:
            return anomalies
        
        # Check for unusual data access patterns
        access_types = {}
        for event in data_events:
            access_type = event.get("access_type", "unknown")
            access_types[access_type] = access_types.get(access_type, 0) + 1
        
        # Sudden spike in read operations might indicate exfiltration
        if access_types.get("read", 0) > 100:
            anomalies.append({
                "type": "excessive_read_operations",
                "severity": "medium",
                "count": access_types.get("read"),
            })
        
        return anomalies

    def _calculate_risk_level(self, anomalies: List[Dict]) -> str:
        """Calculate overall risk level based on anomalies"""
        if not anomalies:
            return "low"
        
        critical_count = sum(1 for a in anomalies if a.get("severity") == "critical")
        high_count = sum(1 for a in anomalies if a.get("severity") == "high")
        
        if critical_count > 0:
            return "critical"
        elif high_count > 2:
            return "high"
        elif high_count > 0:
            return "medium"
        else:
            return "low"

    def _calculate_trust_score(self, anomalies: List[Dict]) -> float:
        """
        Calculate trust score for user/device (0.0 to 1.0)
        """
        if not anomalies:
            return 1.0
        
        severity_penalties = {"critical": 0.4, "high": 0.2, "medium": 0.1, "low": 0.05}
        penalty = sum(severity_penalties.get(a.get("severity"), 0.05) for a in anomalies)
        
        return max(0.0, min(1.0, 1.0 - penalty))
