import logging
import importlib
import inspect
import os
from typing import Dict, List, Type
from trading_system.services.trading.base_strategy import BaseStrategy

class StrategyMarketplace:
    """
    Manages the lifecycle of trading strategies. 
    Supports dynamic loading and ranking.
    """
    def __init__(self):
        self.logger = logging.getLogger("StrategyMarketplace")
        self.strategies: Dict[str, BaseStrategy] = {}
        self.strategy_path = "trading_system/strategies"
        
        # Ensure directory exists
        os.makedirs(self.strategy_path, exist_ok=True)
        # Create __init__.py if missing
        init_file = os.path.join(self.strategy_path, "__init__.py")
        if not os.path.exists(init_file):
            open(init_file, 'a').close()

    def load_strategies(self):
        """Dynamically discovers and loads all strategies in the directory."""
        self.logger.info("Discovering strategies...")
        for file in os.listdir(self.strategy_path):
            if file.endswith(".py") and file != "__init__.py":
                module_name = f"trading_system.strategies.{file[:-3]}"
                try:
                    module = importlib.import_module(module_name)
                    # Reload to ensure we get late updates during development
                    importlib.reload(module)
                    
                    for name, obj in inspect.getmembers(module):
                        if inspect.isclass(obj) and issubclass(obj, BaseStrategy) and obj is not BaseStrategy:
                            strategy_instance = obj()
                            self.strategies[strategy_instance.name] = strategy_instance
                            self.logger.info(f"Loaded strategy: {strategy_instance.name}")
                except Exception as e:
                    self.logger.error(f"Failed to load strategy from {file}: {e}")

    def get_active_strategies(self) -> List[BaseStrategy]:
        return [s for s in self.strategies.values() if s.is_active]

    def activate_strategy(self, name: str):
        if name in self.strategies:
            self.strategies[name].activate()
        else:
            self.logger.warning(f"Strategy {name} not found.")

    def deactivate_strategy(self, name: str):
        if name in self.strategies:
            self.strategies[name].deactivate()

    def get_strategy_performance(self) -> Dict[str, dict]:
        return {name: s.performance_metrics for name, s in self.strategies.items()}
