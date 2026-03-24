import time
import logging
from datetime import datetime
from services.broker.broker_interface import GlobalBrokerRouter
from services.risk.bayesian_position_sizing import BayesianPositionSizer
from services.risk.evt_risk import EVTRiskManager
from services.signals.nas_signals import NeuralArchitectureSearch
from services.signals.multi_modal_signals import MultiModalSignalGenerator
from services.execution.adaptive_execution import AdaptiveExecutionEngine
from services.portfolio.robust_optimization import RobustPortfolioOptimizer

logger = logging.getLogger('SystemIntegrator')

class SystemIntegrator:
    """
    Integrates all advanced components into a cohesive trading system.
    """
    
    def __init__(self, broker: GlobalBrokerRouter):
        self.broker = broker
        self.risk_manager = None
        self.signal_generator = None
        self.execution_engine = None
        self.portfolio_optimizer = None
        self.last_update = datetime.now()
        self.system_status = {
            'initialized': False,
            'active': False,
            'last_update': datetime.now(),
            'components': {}
        }
    
    def initialize_components(self):
        """Initialize all advanced trading system components"""
        logger.info("Initializing advanced trading system components")
        
        try:
            # Initialize risk management components
            self.risk_manager = {
                'bayesian': BayesianPositionSizer(),
                'evt': EVTRiskManager()
            }
            logger.info("Advanced risk management components initialized")
            
            # Initialize signal generators
            # In production, these would be initialized with proper input shapes
            self.signal_generator = {
                'nas': NeuralArchitectureSearch(input_shape=(50, 5), num_classes=2),
                'multi_modal': MultiModalSignalGenerator({
                    'price': (50, 5),
                    'news': (100, 256),
                    'order_flow': (50, 10),
                    'technical': (50, 20),
                    'sentiment': (5,)
                })
            }
            logger.info("Advanced signal generators initialized")
            
            # Initialize execution engine
            self.execution_engine = AdaptiveExecutionEngine(state_size=8, action_size=5)
            logger.info("Adaptive execution engine initialized")
            
            # Initialize portfolio optimizer
            self.portfolio_optimizer = RobustPortfolioOptimizer()
            logger.info("Robust portfolio optimizer initialized")
            
            # Update system status
            self.system_status = {
                'initialized': True,
                'active': False,
                'last_update': datetime.now(),
                'components': {
                    'risk_manager': {
                        'initialized': True,
                        'type': 'advanced',
                        'last_update': datetime.now()
                    },
                    'signal_generator': {
                        'initialized': True,
                        'type': 'advanced',
                        'last_update': datetime.now()
                    },
                    'execution_engine': {
                        'initialized': True,
                        'type': 'advanced',
                        'last_update': datetime.now()
                    },
                    'portfolio_optimizer': {
                        'initialized': True,
                        'type': 'advanced',
                        'last_update': datetime.now()
                    }
                }
            }
            
            return True
        except Exception as e:
            logger.exception("Error initializing advanced components")
            return False
    
    def start(self):
        """Start the advanced trading system"""
        if not self.system_status['initialized']:
            if not self.initialize_components():
                logger.error("Failed to initialize advanced components")
                return False
        
        self.system_status['active'] = True
        self.system_status['last_update'] = datetime.now()
        logger.info("Advanced trading system started")
        return True
    
    def stop(self):
        """Stop the advanced trading system"""
        self.system_status['active'] = False
        self.system_status['last_update'] = datetime.now()
        logger.info("Advanced trading system stopped")
        return True
    
    def process_market_data(self, symbol: str, market_data: dict):
        """Process market data through the advanced system"""
        if not self.system_status['active']:
            return
        
        # Update risk management components
        self.risk_manager['bayesian'].update_market_regime([market_data.get('return', 0)])
        self.risk_manager['evt'].update_returns([market_data.get('return', 0)])
        
        # Generate signals
        # Use placeholders for generating signals if data is not present
        nas_signal = self.signal_generator['nas'].get_best_architecture()
        multi_modal_signal = self.signal_generator['multi_modal'].generate_signal(market_data)
        
        # Process signals through execution engine
        execution_strategy = self.execution_engine.get_execution_strategy(
            {
                'symbol': symbol,
                'quantity': 100,
                'price': market_data.get('midpoint', 100),
                'time_remaining': 300,
                'entry_price': market_data.get('midpoint', 100),
                'position_in_book': 5
            },
            market_data
        )
        
        # In a real system, we'd wait for fill. Here we simulate update for RL learning.
        self.execution_engine.update_performance(
            {
                'symbol': symbol,
                'quantity': 100,
                'price': market_data.get('midpoint', 100)
            },
            market_data,
            {
                'status': 'filled',
                'price': market_data.get('midpoint', 100),
                'filled_qty': 100,
                'time_to_fill': 10
            }
        )
        
        # Update portfolio optimizer
        if 'return' in market_data:
            self.portfolio_optimizer.update_market_data(np.array([market_data['return']]))
        
        return {
            'risk_metrics': self.get_risk_metrics(),
            'signal': {
                'nas': nas_signal,
                'multi_modal': multi_modal_signal
            },
            'execution': execution_strategy,
            'portfolio': self.portfolio_optimizer.get_performance_metrics(),
            'status': self.get_system_status()
        }
    
    def get_risk_metrics(self):
        """Get comprehensive risk metrics from all risk components"""
        return {
            'bayesian': {
                'current_regime': self.risk_manager['bayesian'].current_regime,
                'probabilities': self.risk_manager['bayesian'].market_regimes
            },
            'evt': self.risk_manager['evt'].get_risk_metrics()
        }
    
    def get_system_status(self):
        """Get current status of the advanced trading system"""
        return {
            **self.system_status,
            'uptime': (datetime.now() - self.system_status['last_update']).total_seconds()
        }
    
    def get_performance_metrics(self):
        """Get overall system performance metrics"""
        return {
            'risk': self.get_risk_metrics(),
            'execution': self.execution_engine.get_performance_metrics(),
            'portfolio': self.portfolio_optimizer.get_performance_metrics(),
            'signals': {
                'multi_modal': self.signal_generator['multi_modal'].get_performance_metrics()
            },
            'system': {
                'last_update': self.system_status['last_update']
            }
        }
