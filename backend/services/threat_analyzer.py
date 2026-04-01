"""
Threat analysis using machine learning models
"""
import logging
from typing import Dict, List
import numpy as np

logger = logging.getLogger(__name__)


class ThreatAnalyzer:
    """Analyze network traffic for potential threats"""

    # Known threat signatures and patterns
    MALICIOUS_PORTS = {22, 23, 3389, 445, 139, 25}  # SSH, Telnet, RDP, SMB, SMTP
    KNOWN_C2_DOMAINS = ["malware.com", "c2.evil", "botnet.net"]
    
    def __init__(self):
        self.threat_signatures = self._load_threat_signatures()

    def _load_threat_signatures(self) -> Dict:
        """Load known threat signatures"""
        return {
            "port_scan": {"pattern": "multiple_ports", "severity": "medium"},
            "syn_flood": {"pattern": "high_syn_rate", "severity": "critical"},
            "dns_exfil": {"pattern": "dns_tunneling", "severity": "high"},
            "c2_communication": {"pattern": "known_c2", "severity": "critical"},
        }

    def analyze(self, traffic_data: Dict) -> Dict:
        """Analyze traffic for threats"""
        threats = []
        indicators = {
            "suspicious_ports": False,
            "high_volume": False,
            "protocol_anomaly": False,
            "geographic_anomaly": False,
        }

        # Check for suspicious destination ports
        if traffic_data.get("dst_port") in self.MALICIOUS_PORTS:
            indicators["suspicious_ports"] = True
            threats.append({
                "type": "suspicious_port_access",
                "severity": "medium",
                "port": traffic_data.get("dst_port"),
            })

        # Check for high data volume
        if traffic_data.get("byte_count", 0) > 1_000_000:  # > 1GB
            indicators["high_volume"] = True
            threats.append({
                "type": "data_exfiltration",
                "severity": "high",
                "volume": traffic_data.get("byte_count"),
            })

        # Check for protocol anomalies
        if self._is_protocol_anomaly(traffic_data):
            indicators["protocol_anomaly"] = True
            threats.append({
                "type": "protocol_anomaly",
                "severity": "medium",
                "details": traffic_data.get("protocol"),
            })

        return {
            "threats": threats,
            "indicators": indicators,
            "confidence_score": self._calculate_threat_score(threats),
        }

    def _is_protocol_anomaly(self, traffic_data: Dict) -> bool:
        """Check if traffic protocol is anomalous"""
        # Simple heuristic: HTTP on unusual ports
        if traffic_data.get("protocol") == "http" and traffic_data.get("dst_port") not in [80, 443, 8080]:
            return True
        return False

    def _calculate_threat_score(self, threats: List[Dict]) -> float:
        """Calculate overall threat confidence score"""
        if not threats:
            return 0.0
        
        severity_scores = {"critical": 1.0, "high": 0.8, "medium": 0.5, "low": 0.2}
        scores = [severity_scores.get(t.get("severity", "medium"), 0.5) for t in threats]
        return min(sum(scores) / len(threats), 1.0)
