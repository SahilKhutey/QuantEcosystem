import logging
import time
import requests
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger("ContinuousImprovement")

class ContinuousImprovementFramework:
    """Continuous improvement framework for production trading system"""
    
    def __init__(self, api_client, feedback_interval=1800):
        self.api_client = api_client
        self.logger = logger
        self.feedback_interval = feedback_interval  # 30 minutes
        self.last_feedback = datetime.min
        self.performance_history = defaultdict(list)
        self.issue_tracking = {}
        self.improvement_pipeline = []
        self.last_optimization = datetime.min
        self.base_url = "http://localhost:8000/api"
    
    def run_iteration(self):
        """Run a single iteration of the feedback loop (for integration with async/background tasks)"""
        try:
            self._collect_performance_data()
            self._identify_improvement_opportunities()
            self._prioritize_improvements()
            self._update_optimization_pipeline()
        except Exception as e:
            logger.exception("Error in continuous improvement iteration")

    def _collect_performance_data(self):
        """Collect performance data from all system components"""
        try:
            # Get performance metrics
            metrics = self.api_client.get_prod_performance_metrics() # Corrected method name to match SystemMonitor
            if metrics:
                # Store metrics
                timestamp = datetime.now()
                self.performance_history['total_profit'].append({
                    'timestamp': timestamp,
                    'value': metrics['total_profit']
                })
                self.performance_history['win_rate'].append({
                    'timestamp': timestamp,
                    'value': metrics['win_rate']
                })
                self.performance_history['sharpe_ratio'].append({
                    'timestamp': timestamp,
                    'value': metrics['sharpe_ratio']
                })
                self.performance_history['max_drawdown'].append({
                    'timestamp': timestamp,
                    'value': metrics['max_drawdown']
                })
                
                logger.info(f"Collected performance data: "
                          f"Profit=${metrics['total_profit']:,.2f}, "
                          f"Win Rate={metrics['win_rate']:.2%}, "
                          f"Sharpe={metrics['sharpe_ratio']:.2f}")
        
        except Exception as e:
            logger.exception("Error collecting performance data")
    
    def _identify_improvement_opportunities(self):
        """Identify potential improvement opportunities based on performance data"""
        try:
            # Check for performance degradation
            if self._check_performance_degradation():
                self._log_performance_issue()
            
            # Check for execution quality issues
            if self._check_execution_quality_issues():
                self._log_execution_issue()
            
            # Check for risk management issues
            if self._check_risk_management_issues():
                self._log_risk_issue()
            
        except Exception as e:
            logger.exception("Error identifying improvement opportunities")
    
    def _check_performance_degradation(self):
        """Check if performance metrics are degrading over time"""
        # Check if win rate has decreased by more than 10% in last week
        if len(self.performance_history['win_rate']) >= 7:
            recent_win_rates = [p['value'] for p in self.performance_history['win_rate'][-7:]]
            if recent_win_rates[-1] < recent_win_rates[0] * 0.9:
                return True
        
        # Check if sharpe ratio has decreased by more than 20% in last week
        if len(self.performance_history['sharpe_ratio']) >= 7:
            recent_sharpe = [p['value'] for p in self.performance_history['sharpe_ratio'][-7:]]
            if recent_sharpe[-1] < recent_sharpe[0] * 0.8:
                return True
        
        return False
    
    def _check_execution_quality_issues(self):
        """Check for execution quality issues"""
        try:
            execution_metrics = self.api_client.get_prod_execution_metrics()
            if not execution_metrics:
                return False
            
            # Check fill rate
            if execution_metrics.get('fill_rate', 1) < 0.85:
                return True
            
            # Check slippage
            if execution_metrics.get('slippage', 0) > 0.01:
                return True
            
            # Check order processing time
            if execution_metrics.get('order_processing_time', 0) > 3.0:
                return True
            
            return False
            
        except Exception as e:
            logger.exception("Error checking execution quality")
            return False
    
    def _check_risk_management_issues(self):
        """Check for risk management issues"""
        try:
            risk_metrics = self.api_client.get_prod_risk_metrics()
            if not risk_metrics:
                return False
            
            # Check daily loss
            if risk_metrics.get('daily_loss', 0) > risk_metrics.get('max_daily_loss', 0) * 0.9:
                return True
            
            # Check position risk
            if risk_metrics.get('position_risk', 0) > risk_metrics.get('max_position_allocation', 0) * 0.9:
                return True
            
            return False
            
        except Exception as e:
            logger.exception("Error checking risk management")
            return False
    
    def _calculate_win_rate_change(self):
        if len(self.performance_history['win_rate']) < 2: return 0
        return self.performance_history['win_rate'][-1]['value'] - self.performance_history['win_rate'][0]['value']

    def _calculate_sharpe_change(self):
        if len(self.performance_history['sharpe_ratio']) < 2: return 0
        return self.performance_history['sharpe_ratio'][-1]['value'] - self.performance_history['sharpe_ratio'][0]['value']

    def _log_performance_issue(self):
        """Log performance degradation issue"""
        issue = {
            'timestamp': datetime.now(),
            'type': 'performance_degradation',
            'description': 'System performance has degraded over the last week',
            'severity': 'medium',
            'data': {
                'win_rate_change': self._calculate_win_rate_change(),
                'sharpe_change': self._calculate_sharpe_change()
            }
        }
        
        self._add_issue(issue)
        logger.warning(f"Performance degradation issue logged: {issue['description']}")
    
    def _log_execution_issue(self):
        """Log execution quality issue"""
        try:
            execution_metrics = self.api_client.get_prod_execution_metrics()
            issue = {
                'timestamp': datetime.now(),
                'type': 'execution_quality',
                'description': 'Execution quality issues detected',
                'severity': 'high',
                'data': execution_metrics
            }
            
            self._add_issue(issue)
            logger.warning(f"Execution quality issue logged: {issue['description']}")
            
        except Exception as e:
            logger.exception("Error logging execution issue")
    
    def _log_risk_issue(self):
        """Log risk management issue"""
        try:
            risk_metrics = self.api_client.get_prod_risk_metrics()
            issue = {
                'timestamp': datetime.now(),
                'type': 'risk_management',
                'description': 'Risk management issues detected',
                'severity': 'critical',
                'data': risk_metrics
            }
            
            self._add_issue(issue)
            logger.warning(f"Risk management issue logged: {issue['description']}")
            
        except Exception as e:
            logger.exception("Error logging risk issue")
    
    def _add_issue(self, issue):
        """Add an issue to the tracking system"""
        # Convert timestamp to string for serialization
        iso_ts = issue['timestamp'].isoformat()
        self.issue_tracking[iso_ts] = issue
    
    def _prioritize_improvements(self):
        """Prioritize improvement opportunities based on severity and impact"""
        # Sort issues by severity and recency
        issues = sorted(
            self.issue_tracking.values(),
            key=lambda x: (
                self._get_severity_score(x['severity']),
                -time.mktime(x['timestamp'].timetuple())
            )
        )
        
        # Prioritize top 5 issues
        self.improvement_pipeline = issues[:5]
        
        # Log prioritization
        if self.improvement_pipeline:
            logger.info(f"Prioritized {len(self.improvement_pipeline)} improvement opportunities")
    
    def _get_severity_score(self, severity):
        """Convert severity level to numerical score for prioritization"""
        scores = {
            'critical': 3,
            'high': 2,
            'medium': 1,
            'low': 0
        }
        return scores.get(severity, 0)
    
    def _update_optimization_pipeline(self):
        """Update the optimization pipeline with new improvements"""
        if not self.improvement_pipeline:
            return
        
        # Process top issue
        top_issue = self.improvement_pipeline[0]
        
        # Determine improvement type
        if top_issue['type'] == 'performance_degradation':
            self._generate_performance_improvement_plan(top_issue)
        elif top_issue['type'] == 'execution_quality':
            self._generate_execution_improvement_plan(top_issue)
        elif top_issue['type'] == 'risk_management':
            self._generate_risk_improvement_plan(top_issue)
        
        # Mark issue as processed
        self.improvement_pipeline.pop(0)
    
    def _generate_performance_improvement_plan(self, issue):
        """Generate improvement plan for performance degradation"""
        logger.info("Generating performance improvement plan...")
        
        # Create improvement plan
        improvement = {
            'issue_id': issue['timestamp'].isoformat(),
            'type': 'performance',
            'description': 'Address performance degradation',
            'priority': 'high',
            'actions': [
                "Analyze recent market conditions for regime change",
                "Review strategy parameters for potential recalibration",
                "Consider adding new signals for improved edge",
                "Optimize position sizing for current market conditions"
            ],
            'estimated_impact': {
                'win_rate': '+3-5%',
                'sharpe_ratio': '+0.2-0.4',
                'max_drawdown': '-5-10%'
            },
            'status': 'planned'
        }
        
        # Store improvement plan
        self._save_improvement_plan(improvement)
        
        # Log plan
        logger.info("Performance improvement plan generated")
    
    def _generate_execution_improvement_plan(self, issue):
        """Generate improvement plan for execution quality issues"""
        logger.info("Generating execution quality improvement plan...")
        
        # Create improvement plan
        improvement = {
            'issue_id': issue['timestamp'].isoformat(),
            'type': 'execution',
            'description': 'Improve execution quality',
            'priority': 'critical',
            'actions': [
                "Optimize order routing algorithm for current market conditions",
                "Adjust order size based on current liquidity",
                "Implement dynamic slippage controls",
                "Add more aggressive order types for high-momentum conditions"
            ],
            'estimated_impact': {
                'fill_rate': '+5-10%',
                'slippage': '-15-25%',
                'order_processing_time': '-20-30%'
            },
            'status': 'planned'
        }
        
        # Store improvement plan
        self._save_improvement_plan(improvement)
        
        # Log plan
        logger.info("Execution quality improvement plan generated")
    
    def _generate_risk_improvement_plan(self, issue):
        """Generate improvement plan for risk management issues"""
        logger.info("Generating risk management improvement plan...")
        
        # Create improvement plan
        improvement = {
            'issue_id': issue['timestamp'].isoformat(),
            'type': 'risk',
            'description': 'Strengthen risk management',
            'priority': 'critical',
            'actions': [
                "Adjust risk parameters for current market conditions",
                "Implement more sophisticated position sizing",
                "Add volatility-based risk controls",
                "Enhance circuit breaker functionality"
            ],
            'estimated_impact': {
                'daily_loss': '-20-30%',
                'max_drawdown': '-15-25%',
                'position_risk': '-20-30%'
            },
            'status': 'planned'
        }
        
        # Store improvement plan
        self._save_improvement_plan(improvement)
        
        # Log plan
        logger.info("Risk management improvement plan generated")
    
    def _save_improvement_plan(self, improvement):
        """Save improvement plan to tracking system"""
        try:
            response = requests.post(
                f"{self.base_url}/continuous-improvement/plan",
                json=improvement,
                timeout=10
            )
            
            if response.status_code != 200:
                logger.error(f"Failed to save improvement plan: {response.text}")
            else:
                logger.info("Improvement plan saved successfully")
                
        except Exception as e:
            logger.exception("Error saving improvement plan")
