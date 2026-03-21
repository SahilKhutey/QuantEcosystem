import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from .base_agent import BaseTradingAgent, AgentType, AgentOutput
import aiohttp
import asyncio
from loguru import logger

class MacroAnalystAgent(BaseTradingAgent):
    def __init__(self):
        super().__init__(AgentType.MACRO_ANALYST, confidence_threshold=0.75)
        self.region_data = {}
        self.sector_correlations = self._load_sector_correlations()
        
    async def analyze(self, data: Dict) -> AgentOutput:
        """Analyze macroeconomic conditions and regional impacts"""
        global_data = data.get('global_data', {})
        region_data = data.get('region_data', {})
        market_context = data.get('market_context', {})
        
        # Analyze global macroeconomic trends
        global_analysis = await self._analyze_global_conditions(global_data)
        
        # Regional analysis
        regional_analysis = await self._analyze_regional_conditions(region_data)
        
        # Sector impact analysis
        sector_analysis = self._analyze_sector_impacts(global_analysis, regional_analysis)
        
        # Risk assessment
        risk_analysis = self._assess_macro_risks(global_analysis, regional_analysis)
        
        confidence = self._calculate_macro_confidence(global_analysis, regional_analysis)
        
        # Determine signal based on outlook score
        signal = 0
        outlook_score = global_analysis['overall_outlook']['score']
        if outlook_score > 0.6: signal = 1
        elif outlook_score < 0.4: signal = -1

        analysis = {
            'global_outlook': global_analysis['overall_outlook'],
            'regional_analysis': regional_analysis,
            'sector_impacts': sector_analysis,
            'risk_assessment': risk_analysis,
            'key_drivers': self._identify_key_drivers(global_analysis, regional_analysis),
            'investment_implications': self._derive_investment_implications(sector_analysis)
        }
        
        return AgentOutput(
            agent_type=self.agent_type,
            confidence=confidence,
            signal=signal,
            reason=f"Outlook: {global_analysis['overall_outlook']['sentiment']} ({outlook_score:.2f}) | Risks: {risk_analysis['vulnerability']}",
            analysis=analysis,
            timestamp=pd.Timestamp.now(),
            raw_data=global_analysis
        )
    
    async def _analyze_global_conditions(self, global_data: Dict) -> Dict:
        """Analyze global macroeconomic conditions"""
        conditions = {
            'growth_outlook': self._assess_growth_outlook(global_data),
            'inflation_trend': self._assess_inflation_trend(global_data),
            'monetary_policy': self._assess_monetary_policy(global_data),
            'geopolitical_risk': self._assess_geopolitical_risk(global_data),
            'commodity_trends': self._analyze_commodity_trends(global_data)
        }
        
        # Overall outlook
        outlook_score = np.mean([
            conditions['growth_outlook']['score'],
            1 - conditions['inflation_trend']['score'],  # Lower inflation is better
            conditions['monetary_policy']['score'],
            1 - conditions['geopolitical_risk']['score']  # Lower risk is better
        ])
        
        conditions['overall_outlook'] = {
            'score': outlook_score,
            'sentiment': 'positive' if outlook_score > 0.6 else 'negative' if outlook_score < 0.4 else 'neutral',
            'confidence': min(abs(outlook_score - 0.5) * 2, 1.0)
        }
        
        return conditions
    
    def _assess_growth_outlook(self, global_data: Dict) -> Dict:
        """Assess global growth outlook"""
        growth_indicators = global_data.get('growth_indicators', {})
        
        gdp_growth = growth_indicators.get('gdp_growth', 0.03)
        pmi = growth_indicators.get('pmi', 50)
        consumer_confidence = growth_indicators.get('consumer_confidence', 100)
        
        # Normalize scores
        gdp_score = min(max((gdp_growth - 0.01) / 0.04, 0), 1)  # 1% to 5% range
        pmi_score = min(max((pmi - 45) / 10, 0), 1)  # 45 to 55 range
        confidence_score = min(max((consumer_confidence - 80) / 40, 0), 1)  # 80 to 120 range
        
        composite_score = (gdp_score * 0.4 + pmi_score * 0.3 + confidence_score * 0.3)
        
        return {
            'score': composite_score,
            'outlook': 'strong' if composite_score > 0.7 else 'weak' if composite_score < 0.3 else 'moderate',
            'key_metrics': {
                'gdp_growth': gdp_growth,
                'pmi': pmi,
                'consumer_confidence': consumer_confidence
            }
        }

    def _assess_inflation_trend(self, global_data: Dict) -> Dict:
        return {'score': 0.4, 'trend': 'stable'} # Placeholder

    def _assess_monetary_policy(self, global_data: Dict) -> Dict:
        return {'score': 0.6, 'stance': 'hawkish'} # Placeholder

    def _assess_geopolitical_risk(self, global_data: Dict) -> Dict:
        return {'score': 0.2, 'level': 'low'} # Placeholder

    def _analyze_commodity_trends(self, global_data: Dict) -> Dict:
        return {'score': 0.5, 'trend': 'sideways'} # Placeholder
    
    def _analyze_sector_impacts(self, global_analysis: Dict, regional_analysis: Dict) -> Dict:
        """Analyze sector impacts based on macroeconomic conditions"""
        sector_impacts = {}
        
        sector_sensitivities = {
            'technology': {'growth': 1.2, 'inflation': -0.8, 'rates': -1.0},
            'financials': {'growth': 1.0, 'inflation': 0.5, 'rates': 1.2},
            'energy': {'growth': 1.1, 'inflation': 1.0, 'rates': 0.3},
            'healthcare': {'growth': 0.8, 'inflation': 0.2, 'rates': -0.5},
            'consumer_staples': {'growth': 0.5, 'inflation': 0.8, 'rates': -0.3}
        }
        
        macro_scores = {
            'growth': global_analysis['growth_outlook']['score'],
            'inflation': global_analysis['inflation_trend']['score'],
            'rates': global_analysis['monetary_policy']['score']
        }
        
        for sector, sensitivities in sector_sensitivities.items():
            sector_score = 0
            for factor, sensitivity in sensitivities.items():
                sector_score += sensitivity * macro_scores[factor]
            
            normalized_score = (sector_score + 3) / 6 
            
            sector_impacts[sector] = {
                'impact_score': normalized_score,
                'outlook': 'positive' if normalized_score > 0.6 else 'negative' if normalized_score < 0.4 else 'neutral',
                'key_drivers': [f for f in sensitivities if abs(sensitivities[f] * macro_scores[f]) > 0.2]
            }
        
        return sector_impacts

    def _load_sector_correlations(self) -> Dict:
        return {} # Placeholder

    async def _analyze_regional_conditions(self, region_data: Dict) -> Dict:
        return {"US": "stable", "EU": "weak", "ASIA": "strong"} # Placeholder

    def _assess_macro_risks(self, global_analysis, regional_analysis) -> Dict:
        return {"vulnerability": "low", "shocks": []} # Placeholder

    def _calculate_macro_confidence(self, global_analysis, regional_analysis) -> float:
        return 0.8 # Placeholder

    def _identify_key_drivers(self, global_analysis, regional_analysis) -> List[str]:
        return ["Fed Rates", "Oil Prices"]

    def _derive_investment_implications(self, sector_analysis) -> List[str]:
        return ["Overweight Tech", "Underweight Financials"]
