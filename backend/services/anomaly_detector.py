"""
Anomaly detection using statistical methods and ML
"""
import logging
from typing import List, Dict
import numpy as np
from statistics import mean, stdev

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Detect anomalous network behavior"""

    def __init__(self, threshold_sigma: float = 2.5):
        """
        Initialize anomaly detector
        
        Args:
            threshold_sigma: Standard deviation threshold for anomaly detection
        """
        self.threshold_sigma = threshold_sigma
        self.baseline_stats = {}

    def detect(self, flow_data: List[Dict]) -> List[Dict]:
        """
        Detect anomalies in flow data
        
        Args:
            flow_data: List of traffic flow records
            
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        if len(flow_data) < 10:
            return anomalies
        
        # Calculate baseline statistics
        byte_counts = [f.get("byte_count", 0) for f in flow_data]
        durations = [f.get("duration", 0) for f in flow_data if f.get("duration", 0) > 0]
        packet_counts = [f.get("packet_count", 0) for f in flow_data]
        
        # Detect byte count anomalies
        if len(byte_counts) > 2:
            byte_anomalies = self._detect_statistical_anomalies(
                byte_counts, "byte_count"
            )
            anomalies.extend(byte_anomalies)
        
        # Detect duration anomalies
        if len(durations) > 2:
            duration_anomalies = self._detect_statistical_anomalies(
                durations, "duration"
            )
            anomalies.extend(duration_anomalies)
        
        # Detect behavioral patterns
        behavioral = self._detect_behavioral_anomalies(flow_data)
        anomalies.extend(behavioral)
        
        return anomalies

    def _detect_statistical_anomalies(
        self, values: List[float], metric_name: str
    ) -> List[Dict]:
        """
        Detect statistical anomalies using Z-score
        """
        if len(values) < 3:
            return []
        
        anomalies = []
        try:
            avg = mean(values)
            std = stdev(values)
            
            if std == 0:
                return []
            
            for i, value in enumerate(values):
                z_score = abs((value - avg) / std)
                if z_score > self.threshold_sigma:
                    anomalies.append({
                        "type": "statistical_anomaly",
                        "metric": metric_name,
                        "value": value,
                        "z_score": z_score,
                        "severity": "medium" if z_score < 4 else "high",
                    })
        except Exception as e:
            logger.warning(f"Error in statistical analysis: {e}")
        
        return anomalies

    def _detect_behavioral_anomalies(self, flow_data: List[Dict]) -> List[Dict]:
        """
        Detect anomalous behavioral patterns
        """
        anomalies = []
        
        # Check for unusual port scanning patterns
        if self._is_port_scan(flow_data):
            anomalies.append({
                "type": "port_scan",
                "severity": "high",
                "description": "Potential port scanning activity detected",
            })
        
        # Check for botnet-like communication patterns
        if self._is_c2_pattern(flow_data):
            anomalies.append({
                "type": "c2_communication",
                "severity": "critical",
                "description": "Suspected C2 communication pattern",
            })
        
        # Check for data exfiltration patterns
        if self._is_data_exfil(flow_data):
            anomalies.append({
                "type": "data_exfiltration",
                "severity": "high",
                "description": "Potential data exfiltration detected",
            })
        
        return anomalies

    def _is_port_scan(self, flow_data: List[Dict]) -> bool:
        """Check if traffic indicates port scanning"""
        if len(flow_data) < 5:
            return False
        
        # Port scan: many flows to different ports in short time
        dst_ports = set(f.get("dst_port") for f in flow_data)
        src_ips = set(f.get("src_ip") for f in flow_data)
        
        # Single source with many destination ports = port scan
        if len(src_ips) == 1 and len(dst_ports) > 20:
            return True
        
        return False

    def _is_c2_pattern(self, flow_data: List[Dict]) -> bool:
        """Check for C2 communication patterns"""
        if len(flow_data) < 3:
            return False
        
        # C2 pattern: regular outbound connections to same destination
        dst_ips = {}
        for flow in flow_data:
            dst = flow.get("dst_ip")
            if dst:
                dst_ips[dst] = dst_ips.get(dst, 0) + 1
        
        # Multiple connections to same external IP = potential C2
        for ip, count in dst_ips.items():
            if count > 10 and not self._is_private_ip(ip):
                return True
        
        return False

    def _is_data_exfil(self, flow_data: List[Dict]) -> bool:
        """Check for data exfiltration patterns"""
        # High outbound data volume over short time
        total_outbound = sum(f.get("byte_count", 0) for f in flow_data)
        
        return total_outbound > 100_000_000  # > 100MB

    def _is_private_ip(self, ip: str) -> bool:
        """Check if IP is private"""
        private_ranges = [
            "10.",
            "192.168.",
            "172.16.",
            "172.17.",
            "172.18.",
            "172.19.",
            "172.20.",
            "172.21.",
            "172.22.",
            "172.23.",
            "172.24.",
            "172.25.",
            "172.26.",
            "172.27.",
            "172.28.",
            "172.29.",
            "172.30.",
            "172.31.",
        ]
        return any(ip.startswith(r) for r in private_ranges)
