import asyncio
from typing import Dict, List, Any
from loguru import logger

class AutoLearningSystem:
    def __init__(self):
        self.performance_history = []
        
    async def optimize_agent_weights(self, recent_performance: Dict[str, Any]):
        """Automatically optimize agent weights based on performance"""
        logger.info("Starting agent weight optimization...")
        
        # Calculate new weights based on recent performance
        performance_scores = {}
        for agent, metrics in recent_performance.items():
            # Scoring factors: Accuracy (40%), Profitability (40%), Consistency (20%)
            score = (metrics.get('accuracy', 0.5) * 0.4 + 
                    metrics.get('profitability', 0.5) * 0.4 + 
                    metrics.get('consistency', 0.5) * 0.2)
            performance_scores[agent] = score
            
        # Normalize to get new weights
        total_score = sum(performance_scores.values())
        if total_score <= 0:
            logger.warning("Total performance score is zero or negative. Keeping old weights.")
            return None

        new_weights = {agent: score/total_score for agent, score in performance_scores.items()}
        logger.info(f"Optimization complete. New weights: {new_weights}")
        return new_weights
