import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any
from .base_agent import BaseTradingAgent, AgentType, AgentOutput
from scipy import stats

class SignalFusionAgent(BaseTradingAgent):
    def __init__(self):
        super().__init__(AgentType.SIGNAL_FUSION, confidence_threshold=0.75)
        self.agent_weights = {
            AgentType.MARKET_ANALYST.value: 0.35,
            AgentType.NEWS_INTELLIGENCE.value: 0.25,
            AgentType.MACRO_ANALYST.value: 0.20,
            AgentType.QUANT_ANALYST.value: 0.20
        }
        self.performance_tracker = {}
        
    async def analyze(self, data: Dict) -> AgentOutput:
        """Fuse signals from all agents and make final decision"""
        agent_outputs: Dict[str, AgentOutput] = data.get('agent_outputs', {})
        
        if not agent_outputs:
            return AgentOutput(
                agent_type=self.agent_type,
                confidence=0.1,
                signal=0, # Neutral
                reason='No agent outputs',
                analysis={'error': 'No agent outputs'},
                timestamp=pd.Timestamp.now()
            )
        
        # Fuse individual agent signals
        fused_signals = await self._fuse_agent_signals(agent_outputs)
        
        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence(agent_outputs, fused_signals)
        
        # Generate final recommendation (pick the most relevant or a summary)
        final_recommendation = self._generate_final_recommendation(fused_signals)
        
        # Risk assessment
        risk_assessment = self._assess_overall_risk(agent_outputs, fused_signals)
        
        analysis = {
            'final_recommendation': final_recommendation,
            'fused_signals': fused_signals,
            'agent_contributions': self._get_agent_contributions(agent_outputs),
            'risk_assessment': risk_assessment,
            'confidence_breakdown': self._get_confidence_breakdown(agent_outputs),
            'consistency_score': self._calculate_consistency(agent_outputs)
        }

        # Select a primary signal for the return (usually there's only one asset in this setup)
        main_signal = 0
        main_reason = "Neutral"
        if fused_signals:
            # Pick first asset as primary for now
            asset = next(iter(fused_signals))
            fused_data = fused_signals[asset]
            sig_str = fused_data['signal']
            sig_map = {"STRONG_BUY": 1, "BUY": 1, "HOLD": 0, "SELL": -1, "STRONG_SELL": -1}
            main_signal = sig_map.get(sig_str, 0)
            main_reason = f"{asset}: {sig_str} (Confidence: {overall_confidence:.2f})"

        return AgentOutput(
            agent_type=self.agent_type,
            confidence=overall_confidence,
            signal=main_signal,
            reason=main_reason,
            analysis=analysis,
            timestamp=pd.Timestamp.now(),
            raw_data=agent_outputs
        )
    
    async def _fuse_agent_signals(self, agent_outputs: Dict[str, AgentOutput]) -> Dict:
        """Fuse signals from different agents"""
        fused_results = {}
        
        common_assets = self._get_common_assets(agent_outputs)
        for asset in common_assets:
            asset_signals = []
            total_weight = 0
            
            for agent_name, output in agent_outputs.items():
                if agent_name not in self.agent_weights:
                    continue
                    
                agent_weight = self.agent_weights[agent_name]
                agent_analysis = output.analysis
                
                # Check for signals specifically mapped to an asset
                signals_dict = agent_analysis.get('signals', {})
                if asset in signals_dict:
                    signal_data = signals_dict[asset]
                    signal_strength = self._signal_to_strength(signal_data.get('signal', 'HOLD'))
                else:
                    # Fallback: if the agent outputs a global signal, assume it's for the current asset
                    signal_strength = float(output.signal) # Using numeric signal -1 to 1
                
                # Weight by agent confidence and weight
                weighted_signal = signal_strength * agent_weight * output.confidence
                asset_signals.append(weighted_signal)
                total_weight += agent_weight * output.confidence
            
            if asset_signals and total_weight > 0:
                fused_strength = sum(asset_signals) / total_weight
                fused_results[asset] = {
                    'fused_strength': fused_strength,
                    'signal': self._strength_to_signal(fused_strength),
                    'agent_count': len(asset_signals),
                    'agreement_level': self._calculate_agreement(asset_signals)
                }
        
        return fused_results
    
    def _get_common_assets(self, agent_outputs: Dict) -> List[str]:
        """Identify assets being analyzed across agents."""
        assets = set()
        for output in agent_outputs.values():
            sig_dict = output.analysis.get('signals', {})
            assets.update(sig_dict.keys())
        # Default to a generic asset if none found
        if not assets:
            return ["PRIMARY"]
        return list(assets)

    def _calculate_agreement(self, signals: List[float]) -> float:
        """Calculate alignment between agent signals (0 to 1)."""
        if len(signals) < 2: return 1.0
        return 1.0 - np.std(signals)

    def _signal_to_strength(self, signal: Any) -> float:
        """Convert signal to numerical strength"""
        if isinstance(signal, (int, float)): return float(signal)
        signal_map = {
            'STRONG_BUY': 1.0,
            'BUY': 0.7,
            'HOLD': 0.0,
            'SELL': -0.7,
            'STRONG_SELL': -1.0
        }
        return signal_map.get(str(signal).upper(), 0.0)
    
    def _strength_to_signal(self, strength: float) -> str:
        """Convert numerical strength back to signal"""
        if strength > 0.8:
            return "STRONG_BUY"
        elif strength > 0.3:
            return "BUY"
        elif strength < -0.8:
            return "STRONG_SELL"
        elif strength < -0.3:
            return "SELL"
        else:
            return "HOLD"
    
    def _calculate_overall_confidence(self, agent_outputs: Dict, fused_signals: Dict) -> float:
        """Calculate overall confidence based on agent agreement"""
        if not agent_outputs:
            return 0.1
        
        # Base confidence from individual agents
        agent_confidences = [output.confidence for output in agent_outputs.values()]
        avg_confidence = np.mean(agent_confidences) if agent_confidences else 0
        
        # Agreement bonus
        agreement_bonus = self._calculate_agreement_bonus(fused_signals)
        
        # Consistency bonus
        consistency_bonus = self._calculate_consistency_bonus(agent_outputs)
        
        final_confidence = avg_confidence * 0.6 + agreement_bonus * 0.3 + consistency_bonus * 0.1
        return min(max(final_confidence, 0.1), 0.95)
    
    def _calculate_agreement_bonus(self, fused_signals: Dict) -> float:
        """Calculate bonus for agent agreement"""
        if not fused_signals:
            return 0
        
        agreement_scores = []
        for asset_signal in fused_signals.values():
            agreement_scores.append(asset_signal['agreement_level'])
        
        return np.mean(agreement_scores) if agreement_scores else 0

    def _calculate_consistency_bonus(self, agent_outputs: Dict) -> float:
        """Bonus for temporal or inter-agent consistency."""
        return 0.1 if self._calculate_consistency(agent_outputs) > 0.8 else 0

    def _calculate_consistency(self, agent_outputs: Dict) -> float:
        """Statistical check of signal distribution."""
        signals = [output.signal for output in agent_outputs.values()]
        if not signals: return 1.0
        # Percentage of signs that are same (directionality)
        signs = [np.sign(s) for s in signals if s != 0]
        if not signs: return 1.0
        return signs.count(signs[0]) / len(signs)

    def _generate_final_recommendation(self, fused_signals: Dict) -> str:
        if not fused_signals: return "HOLD"
        asset = next(iter(fused_signals))
        return fused_signals[asset]['signal']

    def _assess_overall_risk(self, agent_outputs: Dict, fused_signals: Dict) -> Dict:
        return {"level": "LOW", "reason": "High agreement"}

    def _get_agent_contributions(self, agent_outputs: Dict) -> Dict:
        return {k: self.agent_weights.get(k, 0) for k in agent_outputs.keys()}

    def _get_confidence_breakdown(self, agent_outputs: Dict) -> Dict:
        return {k: v.confidence for k, v in agent_outputs.items()}
