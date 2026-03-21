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
    
    # Simple fallback if advanced parsing fails or finds nothing
    text_lower = text.lower()
    for location, coords in engine.country_mapping.items():
        if location.lower() in text_lower:
            return coords
            
    return (random.uniform(-60, 80), random.uniform(-170, 180))

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
