import pandas as pd
import numpy as np
from typing import Dict, Any
from loguru import logger
from agents.base_agent import BaseTradingAgent, AgentType, AgentOutput

class QuantAnalyst(BaseTradingAgent):
    def __init__(self, confidence_threshold: float = 0.6):
        super().__init__(AgentType.QUANT_ANALYST, confidence_threshold)

    async def analyze(self, df: pd.DataFrame) -> AgentOutput:
        """Calculate statistical and quantitative metrics."""
        if df.empty:
            return AgentOutput(
                agent_type=self.agent_type,
                confidence=0.0,
                signal=0,
                reason="No data",
                analysis={},
                timestamp=pd.Timestamp.now()
            )

        # Volatility Analysis
        returns = df['close'].pct_change()
        volatility = returns.std() * np.sqrt(252) 
        
        # Z-Score (Mean Reversion)
        ma_20 = df['close'].rolling(window=20).mean()
        std_20 = df['close'].rolling(window=20).std()
        z_score = (df['close'] - ma_20) / std_20
        current_z = z_score.iloc[-1]
        
        signal = 0
        reason = "Neutral"
        if current_z < -2:
            signal = 1
            reason = f"Mean Reversion Buy (Z-Score: {current_z:.2f})"
        elif current_z > 2:
            signal = -1
            reason = f"Mean Reversion Sell (Z-Score: {current_z:.2f})"

        return AgentOutput(
            agent_type=self.agent_type,
            confidence=0.5,
            signal=signal,
            reason=reason,
            analysis={"volatility": volatility, "z_score": current_z},
            timestamp=pd.Timestamp.now()
        )
