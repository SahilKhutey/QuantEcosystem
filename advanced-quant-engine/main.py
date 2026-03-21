import numpy as np
import pandas as pd
from regime_detection.regime_classifier import UnifiedRegimeClassifier
from ml_advanced.feature_engineering import AdvancedFeatureEngineer
from ml_advanced.ensemble_models import EnsembleTradingModel
from optimization.portfolio_allocator import PortfolioAllocator
from real_time.performance_attribution import PerformanceAttribution
from real_time.live_monitoring import LiveMonitoring

def run_advanced_quant_engine():
    print("🚀 Initializing Advanced Adaptive Multi-Model Trading Engine...")
    
    # 1. Generate Synthetic Data
    np.random.seed(42)
    assets = ['AAPL', 'MSFT', 'GOOG', 'BTC']
    data = pd.DataFrame(np.random.normal(100, 1, (1000, 4)), columns=assets)
    for col in assets:
        data[col] = data[col].cumsum()
        
    prices = data['AAPL']
    returns = prices.pct_change().dropna()
    
    # 2. Regime Detection
    print("\n🔍 Step 1: Regime Detection")
    classifier = UnifiedRegimeClassifier()
    regimes = classifier.classify(prices)
    print(f"Detected {regimes.iloc[-1]} regime at latest timestamp.")
    
    # 3. Feature Engineering & ML Prediction
    print("\n📈 Step 2: Feature Engineering & ML Prediction")
    engineer = AdvancedFeatureEngineer()
    features = engineer.build_features(prices)
    
    # Target: Next day return
    y = returns.shift(-1).loc[features.index].dropna()
    X = features.loc[y.index]
    
    model = EnsembleTradingModel()
    model.train(X, y)
    prediction = model.predict(X.tail(1))
    print(f"Ensemble Prediction for next return: {prediction[0]:.4f}")
    
    # 4. Portfolio Optimization
    print("\n⚖️ Step 3: Portfolio Optimization")
    asset_returns = data.pct_change().dropna()
    allocator = PortfolioAllocator(strategy='MVO')
    weights = allocator.allocate(asset_returns)
    print("Optimal Weights:")
    print(weights)
    
    # 5. Real-Time Monitoring & Attribution
    print("\n🖥️ Step 4: Monitoring & Performance Attribution")
    monitor = LiveMonitoring()
    monitor.update(10000) # Initial Equity
    
    pa = PerformanceAttribution()
    metrics = pa.calculate_metrics(returns)
    print("Performance Summary:")
    for k, v in metrics.items():
        print(f" - {k}: {v:.4f}")
        
    print("\n✨ Engine execution complete.")

if __name__ == "__main__":
    run_advanced_quant_engine()
