import asyncio
import random
from .market_impact import MarketImpactEngine, ImpactLevel

# Initialize the engine
engine = MarketImpactEngine()

async def calculate_impact_async(news_item: dict, sentiment: dict, geo_entities: list) -> float:
    """
    Calculate impact score using the advanced MarketImpactEngine.
    """
    try:
        result = await engine.calculate_impact(news_item, sentiment, geo_entities)
        # Convert impact level to a numeric score
        mapping = {
            ImpactLevel.LOW: 2.0,
            ImpactLevel.MEDIUM: 5.0,
            ImpactLevel.HIGH: 8.0,
            ImpactLevel.VERY_HIGH: 10.0
        }
        return float(mapping.get(result.level, 5.0))
    except Exception as e:
        print(f"Error in advanced impact calculation: {e}")
        return float(random.uniform(1, 10))

def calculate_impact(news_item: dict, sentiment: dict, geo_entities: list) -> float:
    """
    Synchronous wrapper for calculate_impact_async.
    """
    try:
        return asyncio.run(calculate_impact_async(news_item, sentiment, geo_entities))
    except:
        return float(random.uniform(1, 10))
