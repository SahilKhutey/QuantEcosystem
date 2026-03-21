import pandas as pd
import numpy as np
from scipy.stats import pearsonr
import networkx as nx
from typing import Dict, List, Any

class CrossAssetCorrelationEngine:
    def __init__(self):
        self.correlation_graph = nx.Graph()
        
    def calculate_rolling_correlations(self, assets_data: Dict[str, List[float]], window: int = 30) -> Dict[str, Dict[str, float]]:
        """Calculate rolling correlations between assets"""
        df = pd.DataFrame(assets_data)
        correlations = {}
        
        for asset1 in df.columns:
            correlations[asset1] = {}
            for asset2 in df.columns:
                if asset1 != asset2:
                    # Calculate rolling correlation and get the last valid value
                    corr_series = df[asset1].rolling(window=window).corr(df[asset2])
                    correlations[asset1][asset2] = float(corr_series.iloc[-1]) if not np.isnan(corr_series.iloc[-1]) else 0.0
                    
        return correlations
    
    def build_correlation_network(self, correlations: Dict[str, Dict[str, float]]):
        """Build network graph of asset relationships"""
        self.correlation_graph.clear()
        
        for asset1, related_assets in correlations.items():
            for asset2, correlation in related_assets.items():
                if abs(correlation) > 0.3:  # Only significant correlations
                    self.correlation_graph.add_edge(asset1, asset2, weight=correlation)
                    
    def find_impact_paths(self, source_asset: str, target_assets: List[str]) -> Dict[str, Dict[str, Any]]:
        """Find shortest paths of influence between assets"""
        impact_paths = {}
        for target in target_assets:
            try:
                # Use absolute weight for shortest path to find strongest connection
                path = nx.shortest_path(self.correlation_graph, source_asset, target, weight=lambda u, v, d: 1.0 / (abs(d['weight']) + 1e-6))
                impact_paths[target] = {
                    'path': path,
                    'strength': self._calculate_path_strength(path)
                }
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                impact_paths[target] = {'path': None, 'strength': 0.0}
                
        return impact_paths

    def _calculate_path_strength(self, path: List[str]) -> float:
        """Calculate the overall strength of a path based on edge weights"""
        if not path or len(path) < 2:
            return 0.0
            
        strength = 1.0
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            if self.correlation_graph.has_edge(u, v):
                strength *= abs(self.correlation_graph[u][v]['weight'])
            else:
                return 0.0
        return float(strength)
