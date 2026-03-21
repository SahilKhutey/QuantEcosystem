import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Callable, Optional
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class AlertEngine:
    def __init__(self):
        # active_alerts: {alert_id: alert_config}
        self.active_alerts = {}
        self.alert_handlers = {
            'price': self._check_price_alert,
            'volume': self._check_volume_alert,
            'news': self._check_news_alert,
            'technical': self._check_technical_alert,
            'portfolio': self._check_portfolio_alert
        }
        
    async def monitor_alerts(self, market_data: Dict,
                           news_data: List[Dict],
                           portfolio_data: Dict):
        """Main loop iteration to evaluate all enabled alerts"""
        triggered_alerts = []
        
        for alert_id, alert in self.active_alerts.items():
            if alert.get('enabled', True):
                handler = self.alert_handlers.get(alert['type'])
                if handler:
                    result = await handler(alert, market_data, news_data, portfolio_data)
                    if result:
                        triggered_alerts.append(result)
                        
        for alert_result in triggered_alerts:
            await self._process_alert(alert_result)
            
        return triggered_alerts
        
    async def _check_price_alert(self, alert: Dict,
                               market_data: Dict,
                               news_data: List[Dict],
                               portfolio_data: Dict) -> Optional[Dict]:
        """Analyze price triggers (crossings and percent changes)"""
        symbol = alert.get('symbol')
        if not symbol or symbol not in market_data: return None
            
        current_price = market_data[symbol].get('price')
        if not current_price: return None
            
        condition = alert.get('condition')
        threshold = alert.get('threshold')
        triggered = False
        reason = ""
        
        if condition == 'above' and current_price > threshold:
            triggered, reason = True, f"Price ${current_price:.2f} crossed above ${threshold:.2f}"
        elif condition == 'below' and current_price < threshold:
            triggered, reason = True, f"Price ${current_price:.2f} crossed below ${threshold:.2f}"
        elif condition == 'percent_change':
            orig = alert.get('original_price', current_price)
            change = (current_price - orig) / orig * 100
            if abs(change) >= threshold:
                triggered = True
                reason = f"Price shifted {'up' if change > 0 else 'down'} {abs(change):.1f}%"
                
        if triggered:
            return {
                'alert_id': alert.get('id'), 'symbol': symbol, 'type': 'price',
                'reason': reason, 'current_price': float(current_price), 'timestamp': datetime.utcnow()
            }
        return None
        
    async def _check_volume_alert(self, alert: Dict,
                                market_data: Dict,
                                news_data: List[Dict],
                                portfolio_data: Dict) -> Optional[Dict]:
        """Detect volume spikes relative to moving averages"""
        symbol = alert.get('symbol')
        if not symbol or symbol not in market_data: return None
        
        vol = market_data[symbol].get('volume')
        avg_vol = market_data[symbol].get('avg_volume')
        if not vol or not avg_vol: return None
            
        ratio = vol / avg_vol
        if ratio >= alert.get('threshold', 2.0):
            return {
                'alert_id': alert.get('id'), 'symbol': symbol, 'type': 'volume',
                'reason': f"Volume spike detected: {ratio:.1f}x normal",
                'ratio': float(ratio), 'timestamp': datetime.utcnow()
            }
        return None
        
    async def _check_news_alert(self, alert: Dict,
                              market_data: Dict,
                              news_data: List[Dict],
                              portfolio_data: Dict) -> Optional[Dict]:
        """Filter news for extreme sentiment on specific symbols"""
        symbol = alert.get('symbol')
        if not symbol or not news_data: return None
            
        threshold = alert.get('sentiment_threshold', 0.8)
        for item in news_data:
            if symbol in item.get('symbols', []):
                score = item.get('sentiment_score', 0)
                if abs(score) >= threshold:
                    return {
                        'alert_id': alert.get('id'), 'symbol': symbol, 'type': 'news',
                        'reason': f"Urgent {'bullish' if score > 0 else 'bearish'} news",
                        'headline': item.get('title'), 'timestamp': datetime.utcnow()
                    }
        return None
        
    async def _check_technical_alert(self, alert: Dict,
                                   market_data: Dict,
                                   news_data: List[Dict],
                                   portfolio_data: Dict) -> Optional[Dict]:
        """Evaluate classic technical signals (RSI extremes, crossovers)"""
        symbol = alert.get('symbol')
        indicator = alert.get('indicator')
        if not symbol or symbol not in market_data: return None
            
        tech = market_data[symbol].get('technical', {})
        val = tech.get(indicator)
        if val is None: return None
            
        triggered = False
        reason = ""
        if indicator == 'rsi':
            if alert.get('condition') == 'overbought' and val >= 70:
                triggered, reason = True, f"RSI Overbought: {val:.1f}"
            elif alert.get('condition') == 'oversold' and val <= 30:
                triggered, reason = True, f"RSI Oversold: {val:.1f}"
        elif indicator == 'macd_crossover':
            macd, sig = tech.get('macd'), tech.get('macd_signal')
            if macd and sig:
                if alert.get('condition') == 'bullish' and macd > sig:
                    triggered, reason = True, "MACD Bullish Cross"
                elif alert.get('condition') == 'bearish' and macd < sig:
                    triggered, reason = True, "MACD Bearish Cross"
                    
        if triggered:
            return {
                'alert_id': alert.get('id'), 'symbol': symbol, 'type': 'technical',
                'reason': reason, 'indicator': indicator, 'timestamp': datetime.utcnow()
            }
        return None

    async def _check_portfolio_alert(self, alert: Dict,
                                   market_data: Dict,
                                   news_data: List[Dict],
                                   portfolio_data: Dict) -> Optional[Dict]:
        """Guardrails for total portfolio PnL or drawdown"""
        pnl = portfolio_data.get('overall_pnl_pct', 0)
        threshold = alert.get('threshold', 0)
        if alert.get('condition') == 'drawdown' and pnl <= -threshold:
            return {
                'alert_id': alert.get('id'), 'type': 'portfolio',
                'reason': f"Portfolio drawdown limit reached: {pnl*100:.1f}%",
                'value': float(pnl), 'timestamp': datetime.utcnow()
            }
        return None
        
    async def _process_alert(self, alert_result: Dict):
        """Finalize alert logic: log, update counters, and notify user"""
        aid = alert_result.get('alert_id')
        if aid in self.active_alerts:
            self.active_alerts[aid]['last_triggered'] = datetime.utcnow()
            self.active_alerts[aid]['trigger_count'] = self.active_alerts[aid].get('trigger_count', 0) + 1
        
        await self._send_notifications(alert_result)
        
    async def _send_notifications(self, alert: Dict):
        """Dispatch notifications across multiple sinks"""
        # WebSocket is the default real-time channel
        await self._send_websocket_alert(alert)
        
        config = self.active_alerts.get(alert.get('alert_id'), {})
        if config.get('notify_email'):
            await self._send_email_alert(alert, config.get('user_email'))
            
    async def _send_email_alert(self, alert: Dict, email: str):
        """Simplified SMTP dispatcher (requires backend configuration)"""
        if not email: return
        print(f"DEBUG: Dispatching email to {email} for {alert.get('symbol')} alert.")
            
    async def _send_websocket_alert(self, alert: Dict):
        """Placeholder for frontend socket-io emission"""
        pass
        
    def create_alert(self, config: Dict) -> str:
        aid = f"ALRT-{datetime.utcnow().strftime('%H%M%S')}"
        config.update({'id': aid, 'created_at': datetime.utcnow(), 'enabled': True})
        self.active_alerts[aid] = config
        return aid

    def delete_alert(self, aid: str):
        if aid in self.active_alerts: del self.active_alerts[aid]
