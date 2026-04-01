"""
AI/ML service for threat analysis and decision making using Groq
"""
import logging
from typing import Optional
from groq import Groq
from .threat_analyzer import ThreatAnalyzer
from .anomaly_detector import AnomalyDetector
from .behavioral_analyzer import BehavioralAnalyzer

logger = logging.getLogger(__name__)


class AIService:
    """Centralized AI service using Groq API"""

    def __init__(self, api_key: Optional[str] = None, model: str = "mixtral-8x7b-32768"):
        self.groq_client = Groq(api_key=api_key) if api_key else Groq()
        self.model = model
        self.threat_analyzer = ThreatAnalyzer()
        self.anomaly_detector = AnomalyDetector()
        self.behavioral_analyzer = BehavioralAnalyzer()

    async def explain_threat(self, threat_data: dict) -> str:
        """Generate AI-powered threat explanation"""
        try:
            prompt = f"""
You are a cybersecurity expert analyzing a network threat detection.
Provide a concise technical explanation of the following threat:

Threat Name: {threat_data.get('name')}
Threat Type: {threat_data.get('type')}
Severity: {threat_data.get('severity')}
Indicators: {threat_data.get('indicators')}
MITRE Techniques: {threat_data.get('mitre_techniques')}

Explain:
1. What this threat indicates
2. Potential attack chain
3. Recommended immediate actions
4. Long-term mitigation strategies
"""
            message = self.groq_client.messages.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.3,
            )
            return message.content[0].text
        except Exception as e:
            logger.error(f"Error generating threat explanation: {e}")
            return "Unable to generate explanation at this time"

    async def generate_soar_decision(self, incident_data: dict) -> dict:
        """Generate SOAR decision using Groq"""
        try:
            prompt = f"""
You are a Security Orchestration, Automation and Response (SOAR) system.
Based on the incident below, provide a decision on remediation actions:

Incident Title: {incident_data.get('title')}
Description: {incident_data.get('description')}
Severity: {incident_data.get('severity')}
Threats: {incident_data.get('threats')}
Affected Systems: {incident_data.get('affected_systems')}

Respond in JSON format with:
{{
    "action": "block|isolate|alert|monitor",
    "priority": "immediate|high|medium|low",
    "remediation_steps": [list of action steps],
    "escalation_required": true/false,
    "reason": "brief explanation"
}}
"""
            message = self.groq_client.messages.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.2,
            )
            
            response_text = message.content[0].text
            # Parse JSON response
            import json
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                return {"action": "alert", "reason": response_text}
        except Exception as e:
            logger.error(f"Error generating SOAR decision: {e}")
            return {"action": "alert", "reason": "Error generating decision"}

    async def answer_security_question(self, question: str, context: dict = None) -> str:
        """Answer security-related questions using AI"""
        try:
            prompt = f"""
You are a cybersecurity AI assistant for a Next-Generation Firewall.
Answer the following question about network security:

{question}
"""
            if context:
                prompt += f"\n\nContext:\n{context}"

            message = self.groq_client.messages.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.5,
            )
            return message.content[0].text
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return "Unable to answer question at this time"

    def analyze_traffic_for_threats(self, traffic_data: dict) -> dict:
        """Analyze traffic for anomalies and threats"""
        return self.threat_analyzer.analyze(traffic_data)

    def detect_anomalies(self, flow_data: list) -> list:
        """Detect anomalous traffic patterns"""
        return self.anomaly_detector.detect(flow_data)

    def analyze_user_behavior(self, user_activity: list) -> dict:
        """Analyze user behavior for compromised accounts"""
        return self.behavioral_analyzer.analyze(user_activity)


# Global AI service instance
_ai_service: Optional[AIService] = None


def get_ai_service(api_key: Optional[str] = None) -> AIService:
    """Get or create AI service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService(api_key=api_key)
    return _ai_service
