import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import json
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class AlgorithmicSignal(Enum):
    STRONG_BUY = "STRONG_BUY"
    BUY = "BUY"
    HOLD = "HOLD"
    SELL = "SELL"
    STRONG_SELL = "STRONG_SELL"

@dataclass
class AlgorithmicConfig:
    symbol: str
    strategy_type: str = "ml"  # ml, rules, hybrid
    timeframe: str = "1h"
    model_path: Optional[str] = None
    feature_columns: List[str] = field(default_factory=lambda: [
        'rsi', 'macd', 'bb_position', 'volume_ratio', 'price_change_1h',
        'price_change_4h', 'atr_ratio', 'vwap_deviation'
    ])
    prediction_threshold: float = 0.6
    retrain_frequency: int = 7  # days
    max_positions: int = 10

class AlgorithmicStrategy:
    def __init__(self, config: AlgorithmicConfig):
        self.config = config
        self.model = None
        self.scaler = StandardScaler()
        self.positions = {}
        self.trade_history = []
        self.feature_data = pd.DataFrame()
        self.last_retrain = None
        
        # Load or initialize model
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load ML model"""
        if self.config.model_path and self.config.strategy_type == "ml":
            try:
                with open(self.config.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"Loaded model from {self.config.model_path}")
            except:
                print("Could not load model, initializing new one")
                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
        elif self.config.strategy_type == "ml":
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
    
    async def train_model(self, training_data: pd.DataFrame, 
                         labels: pd.Series):
        """Train the ML model"""
        if self.config.strategy_type != "ml":
            return
        
        # Prepare features
        X = training_data[self.config.feature_columns].fillna(0)
        y = labels
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        
        # Save model
        if self.config.model_path:
            with open(self.config.model_path, 'wb') as f:
                pickle.dump(self.model, f)
        
        self.last_retrain = datetime.utcnow()
        print(f"Model trained with {len(X)} samples")
    
    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract features for ML model"""
        features = pd.DataFrame(index=df.index)
        
        # Price-based features
        features['returns_1h'] = df['close'].pct_change(periods=1)
        features['returns_4h'] = df['close'].pct_change(periods=4)
        features['returns_24h'] = df['close'].pct_change(periods=24)
        
        # Volatility features
        features['volatility_1h'] = df['close'].pct_change().rolling(window=6).std()
        features['volatility_4h'] = df['close'].pct_change().rolling(window=24).std()
        
        # Volume features
        features['volume_ratio'] = df['volume'] / df['volume'].rolling(window=24).mean()
        features['volume_change'] = df['volume'].pct_change()
        
        # Technical indicators
        features['rsi'] = self._calculate_rsi(df['close'])
        features['macd'], features['macd_signal'] = self._calculate_macd(df['close'])
        features['bb_upper'], features['bb_middle'], features['bb_lower'] = self._calculate_bollinger(df['close'])
        features['bb_position'] = (df['close'] - features['bb_lower']) / (features['bb_upper'] - features['bb_lower'])
        
        # VWAP deviation
        features['vwap'] = self._calculate_vwap(df)
        features['vwap_deviation'] = (df['close'] - features['vwap']) / features['vwap']
        
        # ATR ratio
        features['atr'] = self._calculate_atr(df)
        features['atr_ratio'] = features['atr'] / df['close']
        
        # Momentum features
        features['momentum_4h'] = df['close'] - df['close'].shift(4)
        features['momentum_24h'] = df['close'] - df['close'].shift(24)
        
        # Price position features
        features['high_low_ratio'] = (df['close'] - df['low'].rolling(window=24).min()) / \
                                    (df['high'].rolling(window=24).max() - df['low'].rolling(window=24).min())
        
        return features
    
    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _calculate_macd(self, prices: pd.Series) -> Tuple[pd.Series, pd.Series]:
        """Calculate MACD"""
        exp1 = prices.ewm(span=12, adjust=False).mean()
        exp2 = prices.ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        return macd, signal
    
    def _calculate_bollinger(self, prices: pd.Series, 
                           period: int = 20, 
                           std_dev: float = 2) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate Bollinger Bands"""
        sma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        upper = sma + (std * std_dev)
        lower = sma - (std * std_dev)
        return upper, sma, lower
    
    def _calculate_vwap(self, df: pd.DataFrame) -> pd.Series:
        """Calculate VWAP"""
        typical_price = (df['high'] + df['low'] + df['close']) / 3
        vwap = (typical_price * df['volume']).cumsum() / df['volume'].cumsum()
        return vwap
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate ATR"""
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = ranges.max(axis=1)
        atr = true_range.rolling(window=period).mean()
        return atr
    
    def generate_labels(self, df: pd.DataFrame, 
                       forward_periods: int = 4) -> pd.Series:
        """Generate labels for supervised learning"""
        # Calculate future returns
        future_returns = df['close'].pct_change(periods=forward_periods).shift(-forward_periods)
        
        # Create labels: 1 for buy, 0 for sell, 0.5 for hold
        labels = pd.Series(0.5, index=df.index)  # Default: hold
        
        # Buy if future return > 2%
        labels[future_returns > 0.02] = 1
        
        # Sell if future return < -2%
        labels[future_returns < -0.02] = 0
        
        return labels
    
    async def predict(self, current_features: pd.DataFrame) -> Tuple[AlgorithmicSignal, float]:
        """Make prediction using ML model"""
        if self.config.strategy_type != "ml" or self.model is None:
            return AlgorithmicSignal.HOLD, 0
        
        # Prepare features
        X = current_features[self.config.feature_columns].fillna(0).values.reshape(1, -1)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        try:
            prediction = self.model.predict_proba(X_scaled)[0]
            
            # Get probability for buy class (assuming class 1 is buy)
            buy_probability = prediction[1] if len(prediction) > 1 else prediction[0]
            
            # Generate signal based on probability
            if buy_probability > self.config.prediction_threshold:
                signal = AlgorithmicSignal.BUY
                confidence = buy_probability
            elif buy_probability < (1 - self.config.prediction_threshold):
                signal = AlgorithmicSignal.SELL
                confidence = 1 - buy_probability
            else:
                signal = AlgorithmicSignal.HOLD
                confidence = 0.5
            
            return signal, confidence
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return AlgorithmicSignal.HOLD, 0
    
    def rule_based_signal(self, features: pd.DataFrame) -> Tuple[AlgorithmicSignal, float]:
        """Generate signal using rule-based system"""
        if self.config.strategy_type != "rules":
            return AlgorithmicSignal.HOLD, 0
        
        current = features.iloc[-1] if len(features) > 0 else None
        
        if current is None:
            return AlgorithmicSignal.HOLD, 0
        
        score = 0
        max_score = 0
        
        # Rule 1: RSI
        if 'rsi' in current:
            if current['rsi'] < 30:
                score += 2
                max_score += 2
            elif current['rsi'] > 70:
                score -= 2
                max_score += 2
        
        # Rule 2: MACD
        if 'macd' in current and 'macd_signal' in current:
            if current['macd'] > current['macd_signal']:
                score += 1.5
                max_score += 1.5
            else:
                score -= 1.5
                max_score += 1.5
        
        # Rule 3: Bollinger Bands position
        if 'bb_position' in current:
            if current['bb_position'] < 0.2:
                score += 1
                max_score += 1
            elif current['bb_position'] > 0.8:
                score -= 1
                max_score += 1
        
        # Rule 4: Volume ratio
        if 'volume_ratio' in current:
            if current['volume_ratio'] > 1.5:
                # Volume confirms price movement
                if 'returns_1h' in current:
                    if current['returns_1h'] > 0:
                        score += 1
                        max_score += 1
                    elif current['returns_1h'] < 0:
                        score -= 1
                        max_score += 1
        
        # Rule 5: VWAP deviation
        if 'vwap_deviation' in current:
            if current['vwap_deviation'] < -0.01:  # 1% below VWAP
                score += 1
                max_score += 1
            elif current['vwap_deviation'] > 0.01:  # 1% above VWAP
                score -= 1
                max_score += 1
        
        # Calculate confidence
        if max_score > 0:
            confidence = abs(score) / max_score
        else:
            confidence = 0
        
        # Generate signal
        if score > 1:
            signal = AlgorithmicSignal.BUY
        elif score < -1:
            signal = AlgorithmicSignal.SELL
        else:
            signal = AlgorithmicSignal.HOLD
            confidence = 0.5
        
        return signal, confidence
    
    def hybrid_signal(self, ml_signal: AlgorithmicSignal,
                     ml_confidence: float,
                     rule_signal: AlgorithmicSignal,
                     rule_confidence: float) -> Tuple[AlgorithmicSignal, float]:
        """Combine ML and rule-based signals"""
        if self.config.strategy_type != "hybrid":
            return ml_signal, ml_confidence
        
        # Weighted combination
        ml_weight = 0.6
        rule_weight = 0.4
        
        # Convert signals to scores
        signal_scores = {
            AlgorithmicSignal.STRONG_SELL: -2,
            AlgorithmicSignal.SELL: -1,
            AlgorithmicSignal.HOLD: 0,
            AlgorithmicSignal.BUY: 1,
            AlgorithmicSignal.STRONG_BUY: 2
        }
        
        ml_score = signal_scores.get(ml_signal, 0) * ml_confidence * ml_weight
        rule_score = signal_scores.get(rule_signal, 0) * rule_confidence * rule_weight
        
        total_score = ml_score + rule_score
        
        # Convert back to signal
        if total_score > 1:
            signal = AlgorithmicSignal.BUY
            if total_score > 1.5:
                signal = AlgorithmicSignal.STRONG_BUY
        elif total_score < -1:
            signal = AlgorithmicSignal.SELL
            if total_score < -1.5:
                signal = AlgorithmicSignal.STRONG_SELL
        else:
            signal = AlgorithmicSignal.HOLD
        
        # Calculate combined confidence
        confidence = (ml_confidence * ml_weight + rule_confidence * rule_weight)
        
        return signal, confidence
    
    async def analyze(self, df: pd.DataFrame) -> Dict:
        """Analyze data using algorithmic strategy"""
        if len(df) < 50:
            return {'signal': AlgorithmicSignal.HOLD, 'confidence': 0}
        
        # Extract features
        features = self.extract_features(df)
        
        # Check if retraining is needed
        if self.config.strategy_type == "ml" and self.last_retrain:
            days_since_retrain = (datetime.utcnow() - self.last_retrain).days
            if days_since_retrain >= self.config.retrain_frequency:
                # Generate labels and retrain
                labels = self.generate_labels(df)
                await self.train_model(features.iloc[:-100], labels.iloc[:-100])
        
        # Get current features
        current_features = features.iloc[-1:] if len(features) > 0 else pd.DataFrame()
        
        signal = AlgorithmicSignal.HOLD
        confidence = 0
        
        if self.config.strategy_type == "ml":
            signal, confidence = await self.predict(current_features)
            
        elif self.config.strategy_type == "rules":
            signal, confidence = self.rule_based_signal(features)
            
        elif self.config.strategy_type == "hybrid":
            ml_signal, ml_confidence = await self.predict(current_features)
            rule_signal, rule_confidence = self.rule_based_signal(features)
            signal, confidence = self.hybrid_signal(
                ml_signal, ml_confidence, rule_signal, rule_confidence
            )
        
        # Calculate entry levels
        entry_levels = self._calculate_algorithmic_entry_levels(df, features, signal)
        
        return {
            'signal': signal,
            'confidence': confidence,
            'strategy_type': self.config.strategy_type,
            'entry_levels': entry_levels,
            'features': current_features.to_dict('records')[0] if len(current_features) > 0 else {},
            'timestamp': datetime.utcnow()
        }
    
    def _calculate_algorithmic_entry_levels(self, df: pd.DataFrame,
                                          features: pd.DataFrame,
                                          signal: AlgorithmicSignal) -> Dict:
        """Calculate entry levels for algorithmic trading"""
        current_price = df['close'].iloc[-1]
        
        # Use ATR for stop loss and target
        atr = features['atr'].iloc[-1] if 'atr' in features.columns and len(features) > 0 else 0
        
        if signal in [AlgorithmicSignal.BUY, AlgorithmicSignal.STRONG_BUY]:
            entry = current_price
            stop_loss = current_price - (atr * 2)
            target = current_price + (atr * 4)  # 1:2 risk-reward
            
        elif signal in [AlgorithmicSignal.SELL, AlgorithmicSignal.STRONG_SELL]:
            entry = current_price
            stop_loss = current_price + (atr * 2)
            target = current_price - (atr * 4)
            
        else:
            entry = current_price
            stop_loss = None
            target = None
        
        return {
            'entry': entry,
            'stop_loss': stop_loss,
            'target': target,
            'risk_reward_ratio': abs(target - entry) / abs(entry - stop_loss) 
                               if stop_loss and target else None,
            'atr_multiple': 2
        }
    
    def create_algorithmic_trade(self, analysis: Dict, capital: float) -> Optional[Dict]:
        """Create an algorithmic trading plan"""
        if analysis['signal'] == AlgorithmicSignal.HOLD:
            return None
        
        entry_levels = analysis['entry_levels']
        
        if not entry_levels['stop_loss'] or not entry_levels['target']:
            return None
        
        # Calculate position size using Kelly Criterion or fixed fraction
        stop_loss_distance = abs(entry_levels['entry'] - entry_levels['stop_loss'])
        
        # Use confidence-based position sizing
        confidence = analysis['confidence']
        base_risk = 0.02  # 2% base risk
        adjusted_risk = base_risk * confidence
        
        risk_per_trade = capital * adjusted_risk
        position_size = risk_per_trade / stop_loss_distance
        
        trade = {
            'trade_id': f"algo_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'symbol': self.config.symbol,
            'signal': analysis['signal'].value,
            'confidence': analysis['confidence'],
            'strategy_type': analysis['strategy_type'],
            'entry_price': entry_levels['entry'],
            'position_size': position_size,
            'stop_loss': entry_levels['stop_loss'],
            'target': entry_levels['target'],
            'risk_reward_ratio': entry_levels['risk_reward_ratio'],
            'risk_percentage': adjusted_risk * 100,
            'timestamp': datetime.utcnow(),
            'features': analysis['features']
        }
        
        self.trade_history.append(trade)
        return trade
