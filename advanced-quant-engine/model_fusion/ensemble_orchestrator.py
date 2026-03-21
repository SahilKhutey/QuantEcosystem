import numpy as np
import pandas as pd
from .bayesian_fusion import BayesianFusion
from .adaptive_weighting import AdaptiveWeighting

class EnsembleOrchestrator:
    """
    Main orchestrator for fusing multiple quantitative models.
    Collects predictions from Regime, ML, and Stochastic models and combines them.
    """
    def __init__(self, models=None):
        self.models = models or []
        self.bayesian = BayesianFusion()
        self.adaptive = AdaptiveWeighting()

    def add_model(self, model):
        self.models.append(model)

    def generate_unified_signal(self, data: pd.DataFrame):
        """
        Collects signals from all models and fuses them.
        """
        model_predictions = {}
        for i, model in enumerate(self.models):
            # This is an abstraction; each model would have a predict method
            # For demonstration, we simulate predictions
            model_predictions[f'model_{i}'] = np.random.normal(0, 0.01, len(data))
            
        preds_df = pd.DataFrame(model_predictions, index=data.index)
        
        # Fuse using Bayesian averaging
        bayesian_signal = self.bayesian.fuse(preds_df)
        
        # Fuse using Adaptive weights
        adaptive_signal = self.adaptive.fuse(preds_df)
        
        # Final Signal: Average of methods
        final_signal = (bayesian_signal + adaptive_signal) / 2
        return final_signal

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    data = pd.DataFrame(np.random.normal(0, 1, (100, 5)))
    orchestrator = EnsembleOrchestrator()
    signal = orchestrator.generate_unified_signal(data)
    print("Unified Signal Preview:\n", signal.head())
