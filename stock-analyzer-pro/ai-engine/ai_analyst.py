import openai
from typing import Dict, List, Optional
from datetime import datetime
import json
import pandas as pd
import re

class AIAnalyst:
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.context_window = []
        
    async def analyze_stock(self, symbol: str, 
                          market_data: Dict,
                          news_data: List[Dict],
                          technical_data: Dict) -> Dict:
        """Perform a comprehensive AI-driven stock analysis"""
        
        # Prepare context for the LLM
        context = self._prepare_context(symbol, market_data, news_data, technical_data)
        
        # Generate multi-perspective analysis
        analysis = await self._generate_analysis(context)
        
        # Generate specific trading recommendations
        recommendations = await self._generate_recommendations(context)
        
        # Calculate algorithmic risk assessment
        risk_assessment = self._assess_risk(market_data, technical_data)
        
        return {
            'symbol': symbol,
            'analysis': analysis,
            'recommendations': recommendations,
            'risk_assessment': risk_assessment,
            'timestamp': datetime.utcnow()
        }
        
    def _prepare_context(self, symbol: str,
                        market_data: Dict,
                        news_data: List[Dict],
                        technical_data: Dict) -> str:
        """Format raw market data into a structured context string for GPT"""
        context_parts = []
        
        context_parts.append(f"Stock: {symbol}")
        context_parts.append(f"Current Price: ${market_data.get('price', 0):.2f}")
        context_parts.append(f"Change: {market_data.get('change_percent', '0%')}")
        context_parts.append(f"Volume: {market_data.get('volume', 0):,}")
        
        if technical_data:
            context_parts.append("\nTechnical Indicators:")
            for key, value in technical_data.items():
                if isinstance(value, (int, float)):
                    context_parts.append(f"  {key}: {value:.2f}")
                    
        if news_data:
            context_parts.append("\nRecent News Headlines:")
            for i, news in enumerate(news_data[:3]):
                context_parts.append(f"  {i+1}. {news.get('title', '')}")
                if news.get('sentiment'):
                    context_parts.append(f"     Sentiment: {news['sentiment']}")
                    
        return "\n".join(context_parts)
        
    async def _generate_analysis(self, context: str) -> str:
        """Generate executive-level analysis using GPT-4"""
        prompt = f"""
        As a senior financial analyst, analyze this stock based on the following data:
        
        {context}
        
        Provide a comprehensive analysis covering:
        1. Current market position
        2. Technical outlook
        3. News impact
        4. Risk factors
        5. Short-term outlook (1-2 weeks)
        6. Medium-term outlook (1-3 months)
        
        Be objective, precise, and data-driven.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a senior financial analyst at a major investment bank."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Detailed analysis temporarily unavailable: {str(e)}"
            
    async def _generate_recommendations(self, context: str) -> Dict:
        """Generate structured trading recommendations using GPT-3.5"""
        prompt = f"""
        Based on this stock data:
        
        {context}
        
        Provide specific trading recommendations including:
        1. Entry price range
        2. Stop-loss levels
        3. Target prices
        4. Position sizing suggestions
        5. Time horizon
        
        Strictly format your response as JSON with these keys: action, confidence, reasoning, entry_range, stop_loss, targets, time_horizon.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a pragmatic trading strategist."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=350,
                temperature=0.5
            )
            
            content = response.choices[0].message.content
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except Exception:
            pass
            
        return {
            'action': 'HOLD',
            'confidence': 0.5,
            'reasoning': 'Neutral outlook based on available data',
            'entry_range': 'N/A',
            'stop_loss': 'N/A',
            'targets': 'N/A',
            'time_horizon': 'short-term'
        }
        
    def _assess_risk(self, market_data: Dict, technical_data: Dict) -> Dict:
        """Algorithmic risk assessment based on volatility and extremes"""
        risk_score = 5.0
        factors = []
        
        volatility = technical_data.get('volatility', 0)
        if volatility > 0.3:
            risk_score += 2.5
            factors.append(f"High historical volatility ({volatility:.1%})")
                
        rsi = technical_data.get('rsi', 50)
        if rsi > 75 or rsi < 25:
            risk_score += 1.5
            factors.append(f"Extreme momentum detection (RSI: {rsi:.1f})")
                
        vol_ratio = market_data.get('volume_ratio', 1.0)
        if vol_ratio > 3.0:
            risk_score += 1.0
            factors.append("Significant volume anomaly detected")
                
        if technical_data.get('trend') == 'bearish':
            risk_score += 1.0
            factors.append("Prevailing bearish price trend")
                
        return {
            'risk_score': float(min(10.0, max(1.0, risk_score))),
            'risk_level': self._score_to_risk_level(risk_score),
            'factors': factors
        }
        
    def _score_to_risk_level(self, score: float) -> str:
        if score >= 8: return "Very High"
        if score >= 6: return "High"
        if score >= 4: return "Medium"
        if score >= 2: return "Low"
        return "Very Low"
            
    async def answer_question(self, question: str, 
                            context: Dict = None) -> str:
        """Answer free-form user queries using financial domain knowledge"""
        system_prompt = "You are an expert AI financial advisor. Provide concise, data-backed answers."
        user_context = f"\nRelevant Data: {json.dumps(context, indent=2)}" if context else ""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Question: {question}{user_context}"}
                ],
                max_tokens=300,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Unable to process question at this time ({str(e)})."
            
    async def simulate_scenario(self, scenario: str,
                              portfolio: Dict) -> Dict:
        """Simulate the impact of complex macro scenarios on a specific portfolio"""
        prompt = f"""
        Analyze the impact of this market scenario: '{scenario}'
        
        On the following portfolio: {json.dumps(portfolio, indent=2)}
        
        Provide:
        1. Exposure Analysis
        2. Expected Portfolio Drawdown/Growth
        3. Suggested Hedge Strategies
        4. Emerging Opportunities
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a catastrophic risk modeling expert."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.6
            )
            return {
                'analysis': response.choices[0].message.content,
                'scenario': scenario,
                'timestamp': datetime.utcnow()
            }
        except Exception as e:
            return {'analysis': f"Simulation failed: {str(e)}", 'scenario': scenario}
