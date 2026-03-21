import asyncio
import random
from typing import Tuple, Dict, Any
from .geo_intelligence import GeoIntelligenceEngine, GeoEntityType

# Initialize the engine
engine = GeoIntelligenceEngine()

async def extract_geocoordinates_async(text: str) -> Tuple[float, float]:
    """
    Extract geocoordinates using the advanced GeoIntelligenceEngine.
    This is an async function because the engine may use external APIs.
    """
    try:
        entities = await engine.extract_geo_entities(text)
        for entity in entities:
            if entity.geo_coordinates:
                return entity.geo_coordinates
    except Exception as e:
        print(f"Error in advanced geo-parsing: {e}")
    
    # Simple fallback mapping for massive geopolitical banking nodes
    text_lower = text.lower()
    
    # Internal Fail-safe Array if external API is rate limited
    major_nodes = {
        'new york': (40.7128, -74.0060),
        'london': (51.5074, -0.1278),
        'tokyo': (35.6762, 139.6503),
        'frankfurt': (50.1109, 8.6821),
        'hong kong': (22.3193, 114.1694),
        'usa': (37.0902, -95.7129),
        'china': (35.8617, 104.1954),
        'europe': (54.5260, 15.2551)
    }
    
    for location, coords in major_nodes.items():
        if location in text_lower:
            return coords
            
    for location, coords in engine.country_mapping.items():
        if location.lower() in text_lower:
            return coords
            
    # Default to generic central Atlantic if utterly unparseable
    return (0.0, 0.0)

def extract_geocoordinates(text: str) -> Tuple[float, float]:
    """
    Synchronous wrapper for extract_geocoordinates_async.
    Note: In a production environment, you should use the async version.
    """
    try:
        # This is a bit hacky but works for a demo
        return asyncio.run(extract_geocoordinates_async(text))
    except:
        return (random.uniform(-60, 80), random.uniform(-170, 180))
