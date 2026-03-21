from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import pandas as pd
import numpy as np

class AgentType(Enum):
    MARKET_ANALYST = "market_analyst"
    NEWS_INTELLIGENCE = "news_intelligence"
    MACRO_ANALYST = "macro_analyst"
    QUANT_ANALYST = "quant_analyst"
    SIGNAL_FUSION = "signal_fusion"
    REASONING_ENGINE = "reasoning_engine"

@dataclass
class AgentOutput:
    agent_type: AgentType
    confidence: float
    signal: int  # Added signal to the output for easier fusion
    reason: str  # Added reason to the output
    analysis: Dict[str, Any]
    timestamp: pd.Timestamp
    raw_data: Optional[Dict] = None

class BaseTradingAgent(ABC):
    def __init__(self, agent_type: AgentType, confidence_threshold: float = 0.6):
        self.agent_type = agent_type
        self.confidence_threshold = confidence_threshold
        self.performance_history = []
        self.learning_rate = 0.1
        
    @abstractmethod
    async def analyze(self, data: Any) -> AgentOutput:
        """Core analysis method to be implemented by each agent"""
        pass
    
    def update_confidence(self, actual_outcome: bool, predicted_confidence: float) -> float:
        """Update agent confidence based on performance"""
        # Simple learning: increase confidence if correct, decrease if wrong
        if actual_outcome:
            new_confidence = predicted_confidence + self.learning_rate * (1 - predicted_confidence)
        else:
            new_confidence = predicted_confidence - self.learning_rate * predicted_confidence
        
        self.performance_history.append({
            'outcome': actual_outcome,
            'predicted_confidence': predicted_confidence,
            'new_confidence': new_confidence
        })
        
        return max(0.1, min(0.99, new_confidence))  # Keep within bounds
    
    def calculate_performance_metrics(self) -> Dict:
        """Calculate agent performance metrics"""
        if not self.performance_history:
            return {}
        
        correct_predictions = sum(1 for entry in self.performance_history if entry['outcome'])
        total_predictions = len(self.performance_history)
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        
        # Confidence calibration
        avg_confidence = np.mean([entry['predicted_confidence'] for entry in self.performance_history])
        calibration_error = abs(avg_confidence - accuracy)
        
        return {
            'accuracy': accuracy,
            'total_predictions': total_predictions,
            'avg_confidence': avg_confidence,
            'calibration_error': calibration_error,
            'recent_performance': self.performance_history[-10:] if len(self.performance_history) >= 10 else self.performance_history
        }
