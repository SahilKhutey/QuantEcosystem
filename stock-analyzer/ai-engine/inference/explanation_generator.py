from typing import Dict, List, Any
import openai

class MarketExplanationGenerator:
    def __init__(self, api_key: str):
        openai.api_key = api_key
        
    def generate_explanation(self, price_movement: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Generate human-readable explanation for price movements"""
        
        prompt = f"""
        Explain why {price_movement['symbol']} moved {price_movement['direction']} 
        by {price_movement['percentage']} at {price_movement['timestamp']}.
        
        Context:
        - Recent news sentiment: {context.get('news_sentiment', 'neutral')}
        - Technical indicators: {context.get('technical_signals', {})}
        - Related asset movements: {context.get('related_assets', {})}
        - Economic indicators: {context.get('economic_factors', {})}
        
        Provide a concise, professional explanation suitable for traders.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating explanation: {str(e)}"

class TradingSignalGenerator:
    def __init__(self, openai_api_key: str = "your-api-key"):
        self.explanation_gen = MarketExplanationGenerator(openai_api_key)
        
    def generate_signal(self, symbol: str, market_data: Dict[str, Any], news_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive trading signal with explanation"""
        
        # Combine quantitative and qualitative factors
        technical_score = self._calculate_technical_score(market_data)
        sentiment_score = self._calculate_sentiment_score(news_data)
        fundamental_score = self._calculate_fundamental_score(symbol)
        
        # Weighted average
        overall_score = (technical_score * 0.4 + 
                        sentiment_score * 0.3 + 
                        fundamental_score * 0.3)
        
        signal_type = "BUY" if overall_score > 0.6 else "SELL" if overall_score < 0.4 else "HOLD"
        
        explanation = self.explanation_gen.generate_explanation({
            'symbol': symbol,
            'direction': signal_type,
            'percentage': f"{overall_score * 100:.1f}%",
            'timestamp': market_data.get('timestamp')
        }, {
            'news_sentiment': sentiment_score,
            'technical_signals': technical_score,
            'related_assets': self._get_related_assets(symbol),
            'economic_factors': self._get_economic_context()
        })
        
        return {
            'symbol': symbol,
            'signal': signal_type,
            'confidence': float(overall_score),
            'explanation': explanation,
            'timestamp': market_data.get('timestamp')
        }

    def _calculate_technical_score(self, market_data: Dict) -> float:
        """Placeholder for technical analysis scoring logic"""
        return 0.5

    def _calculate_sentiment_score(self, news_data: Dict) -> float:
        """Placeholder for sentiment analysis scoring logic"""
        return 0.5

    def _calculate_fundamental_score(self, symbol: str) -> float:
        """Placeholder for fundamental analysis scoring logic"""
        return 0.5

    def _get_related_assets(self, symbol: str) -> List[str]:
        """Placeholder for fetching related asset movements"""
        return []

    def _get_economic_context(self) -> Dict:
        """Placeholder for fetching broader economic context"""
        return {}
