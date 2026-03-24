import logging
from datetime import datetime
from typing import Dict, List, Optional

class SocialManager:
    """
    Manages social trading features: Leaderboards, Follower tracking, and Signal Broadcasting.
    """
    def __init__(self, marketplace):
        self.logger = logging.getLogger("Social.Manager")
        self.marketplace = marketplace
        self.followers: Dict[str, List[str]] = {} # strategy_name -> list of follower_ids
        self.signal_stream: List[dict] = []
        self.max_history = 50

    def follow_strategy(self, strategy_name: str, follower_id: str):
        if strategy_name not in self.followers:
            self.followers[strategy_name] = []
        if follower_id not in self.followers[strategy_name]:
            self.followers[strategy_name].append(follower_id)
            self.logger.info(f"User {follower_id} is now following {strategy_name}")

    def broadcast_signal(self, strategy_name: str, signal: dict):
        """Broadcasts a signal from an active strategy to its followers."""
        broadcast_data = {
            'strategy': strategy_name,
            'signal': signal,
            'timestamp': datetime.utcnow().isoformat(),
            'followers_notified': len(self.followers.get(strategy_name, []))
        }
        self.signal_stream.append(broadcast_data)
        if len(self.signal_stream) > self.max_history:
            self.signal_stream.pop(0)
        
        self.logger.info(f"SIGNAL BROADCAST: {strategy_name} -> {signal['action']} {signal['symbol']}")

    def get_leaderboard(self) -> List[dict]:
        """Ranks strategies by PnL and Win Rate."""
        perf = self.marketplace.get_strategy_performance()
        leaderboard = []
        for name, metrics in perf.items():
            leaderboard.append({
                'name': name,
                'pnl': metrics['pnl'],
                'win_rate': metrics['win_rate'],
                'trades': metrics['total_trades'],
                'followers': len(self.followers.get(name, []))
            })
        
        # Sort by PnL (descending)
        return sorted(leaderboard, key=lambda x: x['pnl'], reverse=True)

    def get_live_signals(self) -> List[dict]:
        return self.signal_stream
