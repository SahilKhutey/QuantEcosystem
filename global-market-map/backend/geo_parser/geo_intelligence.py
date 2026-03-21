import re
import spacy
import asyncio
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import aiohttp
import json

# Load NLP model for entity recognition
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class GeoEntityType(Enum):
    COUNTRY = "country"
    CITY = "city"
    REGION = "region"
    COMPANY = "company"
    PERSON = "person"

@dataclass
class GeoEntity:
    text: str
    type: GeoEntityType
    confidence: float
    geo_coordinates: Optional[Tuple[float, float]] = None
    importance_score: float = 0.0

class GeoIntelligenceEngine:
    def __init__(self):
        self.country_mapping = self._load_country_mapping()
        self.company_locations = self._load_company_locations()
        self.entity_cache = {}
        
    def _load_country_mapping(self) -> Dict[str, Tuple[float, float]]:
        """Load country coordinates"""
        return {
            "United States": (37.0902, -95.7129),
            "India": (20.5937, 78.9629),
            "China": (35.8617, 104.1954),
            "United Kingdom": (55.3781, -3.4360),
            "Germany": (51.1657, 10.4515),
            "Japan": (36.2048, 138.2529),
            "Australia": (-25.2744, 133.7751),
            "Canada": (56.1304, -106.3468),
            "Brazil": (-14.2350, -51.9253),
            "Russia": (61.5240, 105.3188)
        }
    
    def _load_company_locations(self) -> Dict[str, str]:
        """Load company headquarters locations"""
        return {
            "Apple": "United States",
            "Microsoft": "United States",
            "Google": "United States",
            "Amazon": "United States",
            "Tesla": "United States",
            "Reliance": "India",
            "TSMC": "Taiwan",
            "Samsung": "South Korea",
            "Toyota": "Japan",
            "Shell": "Netherlands"
        }
    
    async def extract_geo_entities(self, text: str) -> List[GeoEntity]:
        """Extract geographical entities from text"""
        doc = nlp(text)
        entities = []
        
        # Named Entity Recognition
        for ent in doc.ents:
            if ent.label_ in ["GPE", "LOC", "ORG"]:
                entity_type = self._map_entity_type(ent.label_)
                confidence = min(ent.end - ent.start, 10) / 10  # Simple confidence
                
                geo_entity = GeoEntity(
                    text=ent.text,
                    type=entity_type,
                    confidence=confidence
                )
                
                # Get coordinates
                coordinates = await self._get_entity_coordinates(ent.text, entity_type)
                if coordinates:
                    geo_entity.geo_coordinates = coordinates
                
                entities.append(geo_entity)
        
        # Additional pattern matching for financial contexts
        financial_entities = self._extract_financial_entities(text)
        entities.extend(financial_entities)
        
        return entities
    
    def _map_entity_type(self, spacy_label: str) -> GeoEntityType:
        """Map SpaCy labels to our entity types"""
        mapping = {
            "GPE": GeoEntityType.COUNTRY,
            "LOC": GeoEntityType.REGION,
            "ORG": GeoEntityType.COMPANY
        }
        return mapping.get(spacy_label, GeoEntityType.COUNTRY)
    
    async def _get_entity_coordinates(self, entity: str, entity_type: GeoEntityType) -> Optional[Tuple[float, float]]:
        """Get coordinates for an entity"""
        if entity_type == GeoEntityType.COUNTRY:
            return self.country_mapping.get(entity)
        elif entity_type == GeoEntityType.COMPANY:
            country = self.company_locations.get(entity)
            return self.country_mapping.get(country) if country else None
        
        # Fallback: Use geocoding API
        return await self._geocode_entity(entity)
    
    async def _geocode_entity(self, entity: str) -> Optional[Tuple[float, float]]:
        """Geocode entity using external API"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://api.opencagedata.com/geocode/v1/json"
                params = {
                    'q': entity,
                    'key': 'YOUR_API_KEY',
                    'limit': 1
                }
                async with session.get(url, params=params) as response:
                    data = await response.json()
                    if data['results']:
                        result = data['results'][0]
                        return (result['geometry']['lat'], result['geometry']['lng'])
        except Exception:
            return None
    
    def _extract_financial_entities(self, text: str) -> List[GeoEntity]:
        """Extract financial entities using pattern matching"""
        entities = []
        
        # Stock indices pattern
        index_patterns = {
            r"\bS&P 500\b": "United States",
            r"\bNASDAQ\b": "United States",
            r"\bDow Jones\b": "United States",
            r"\bNIFTY\b": "India",
            r"\bSensex\b": "India",
            r"\bFTSE\b": "United Kingdom",
            r"\bDAX\b": "Germany",
            r"\bNikkei\b": "Japan",
            r"\bHang Seng\b": "Hong Kong"
        }
        
        for pattern, country in index_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                coordinates = self.country_mapping.get(country)
                if coordinates:
                    entities.append(GeoEntity(
                        text=pattern.strip(),
                        type=GeoEntityType.REGION,
                        confidence=0.8,
                        geo_coordinates=coordinates,
                        importance_score=0.7
                    ))
        
        # Central banks pattern
        central_banks = {
            r"\bFederal Reserve\b": "United States",
            r"\bFed\b": "United States",
            r"\bECB\b": "Germany",  # European Central Bank
            r"\bBank of England\b": "United Kingdom",
            r"\bPBOC\b": "China",   # People's Bank of China
            r"\bRBI\b": "India"     # Reserve Bank of India
        }
        
        for pattern, country in central_banks.items():
            if re.search(pattern, text, re.IGNORECASE):
                coordinates = self.country_mapping.get(country)
                if coordinates:
                    entities.append(GeoEntity(
                        text=pattern.strip(),
                        type=GeoEntityType.REGION,
                        confidence=0.9,
                        geo_coordinates=coordinates,
                        importance_score=0.8
                    ))
        
        return entities
    
    async def analyze_news_impact(self, news_item: Dict) -> Dict:
        """Analyze geographical impact of news"""
        text = f"{news_item.get('title', '')} {news_item.get('description', '')}"
        entities = await self.extract_geo_entities(text)
        
        # Calculate impact scores
        impact_scores = {}
        for entity in entities:
            if entity.geo_coordinates:
                country = self._get_country_from_coords(entity.geo_coordinates)
                if country:
                    impact_scores[country] = impact_scores.get(country, 0) + \
                                            entity.confidence * entity.importance_score
        
        return {
            'news_id': news_item.get('id'),
            'entities': [e.__dict__ for e in entities if hasattr(e, '__dict__')] if entities else [],
            'impact_scores': impact_scores,
            'primary_country': max(impact_scores.items(), key=lambda x: x[1])[0] if impact_scores else None,
            'analysis_timestamp': asyncio.get_event_loop().time()
        }
    
    def _get_country_from_coords(self, coords: Tuple[float, float]) -> Optional[str]:
        """Get country name from coordinates (simplified)"""
        # In production, use reverse geocoding
        for country, country_coords in self.country_mapping.items():
            if self._calculate_distance(coords, country_coords) < 10:  # Within 10 degrees
                return country
        return None
    
    def _calculate_distance(self, coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
        """Calculate simple distance between coordinates"""
        return abs(coord1[0] - coord2[0]) + abs(coord1[1] - coord2[1])
