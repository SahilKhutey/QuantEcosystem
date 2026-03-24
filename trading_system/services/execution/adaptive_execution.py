import numpy as np
import logging
import random
from collections import deque
import tensorflow as tf
from tensorflow.keras import layers, Model, optimizers
from datetime import datetime

logger = logging.getLogger('AdaptiveExecution')

class AdaptiveExecutionEngine:
    """
    Execution engine that uses reinforcement learning to adapt execution strategy
    based on market conditions and order characteristics.
    """
    
    def __init__(self, state_size: int = 8, action_size: int = 5, learning_rate: float = 0.001):
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95  # discount rate
        self.epsilon = 1.0  # exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.batch_size = 32
        self.model = self._build_model()
        self.target_model = self._build_model()
        self.update_target_frequency = 10
        self.step_count = 0
        self.last_update = datetime.now()
        self.performance = {
            'slippage': 0.0,
            'fill_rate': 0.0,
            'win_rate': 0.0,
            'total_orders': 0,
            'last_update': datetime.now()
        }
    
    def _build_model(self):
        """Build neural network for Q-learning"""
        # Input layer
        inputs = layers.Input(shape=(self.state_size,))
        
        # Hidden layers
        x = layers.Dense(64, activation='relu')(inputs)
        x = layers.Dense(32, activation='relu')(x)
        
        # Output layer (Q-values for each action)
        outputs = layers.Dense(self.action_size, activation='linear')(x)
        
        model = Model(inputs=inputs, outputs=outputs)
        model.compile(
            optimizer=optimizers.Adam(learning_rate=self.learning_rate),
            loss='mse'
        )
        
        return model
    
    def remember(self, state, action, reward, next_state, done):
        """Store experience in memory"""
        self.memory.append((state, action, reward, next_state, done))
    
    def act(self, state):
        """Choose action using epsilon-greedy policy"""
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
        
        # Predict Q-values
        act_values = self.model.predict(state, verbose=0)
        return np.argmax(act_values[0])
    
    def replay(self):
        """Train on past experiences"""
        if len(self.memory) < self.batch_size:
            return
        
        # Sample batch memory
        minibatch = random.sample(self.memory, self.batch_size)
        
        states = np.array([t[0] for t in minibatch]).reshape(self.batch_size, self.state_size)
        actions = np.array([t[1] for t in minibatch])
        rewards = np.array([t[2] for t in minibatch])
        next_states = np.array([t[3] for t in minibatch]).reshape(self.batch_size, self.state_size)
        dones = np.array([t[4] for t in minibatch])
        
        # Predict current Q-values
        current_q = self.model.predict(states, verbose=0)
        next_q = self.target_model.predict(next_states, verbose=0)
        
        # Update Q-values
        target = current_q.copy()
        for i in range(self.batch_size):
            if dones[i]:
                target[i][actions[i]] = rewards[i]
            else:
                target[i][actions[i]] = rewards[i] + self.gamma * np.amax(next_q[i])
        
        # Train the model
        self.model.fit(states, target, epochs=1, verbose=0)
        
        # Decay exploration rate
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
        
        # Update target network
        if self.step_count % self.update_target_frequency == 0:
            self.target_model.set_weights(self.model.get_weights())
        
        self.step_count += 1
        self.last_update = datetime.now()
    
    def _get_state(self, order, market_data):
        """
        Get state representation for the current market conditions.
        """
        # Market conditions
        bid = market_data.get('bid', 0.0)
        ask = market_data.get('ask', 0.0)
        spread = ask - bid
        midpoint = (bid + ask) / 2
        volume = market_data.get('volume', 0)
        
        # Order characteristics
        size = order.get('quantity', 1)
        time_remaining = order.get('time_remaining', 0)
        
        # Current position in book
        position_in_book = order.get('position_in_book', 0)
        
        # Market volatility
        volatility = market_data.get('volatility', 0.01)
        
        # Time of day features
        current_hour = datetime.now().hour
        hour_of_day = current_hour / 24.0
        
        # State vector (normalized)
        state = [
            spread / (midpoint + 1e-9),                # Normalized spread
            (midpoint - order.get('entry_price', midpoint)) / (midpoint + 1e-9),  # Price movement
            volume / 10000.0,               # Normalized volume
            size / 100.0,                   # Normalized order size
            time_remaining / 60.0,          # Time remaining (in minutes)
            position_in_book / 100.0,       # Normalized book position
            volatility,                     # Market volatility
            hour_of_day                     # Time of day
        ]
        
        return np.array(state).reshape(1, self.state_size)
    
    def get_execution_strategy(self, order, market_data):
        """
        Get optimal execution strategy based on current market conditions.
        """
        state = self._get_state(order, market_data)
        
        # Choose action
        action = self.act(state)
        
        # Map action to execution strategy
        strategies = [
            {
                'name': 'aggressive',
                'params': {'order_type': 'market', 'time_in_force': 'day', 'speed': 1.0}
            },
            {
                'name': 'balanced',
                'params': {'order_type': 'limit', 'time_in_force': 'day', 'speed': 0.5}
            },
            {
                'name': 'conservative',
                'params': {'order_type': 'limit', 'time_in_force': 'gtc', 'speed': 0.2}
            },
            {
                'name': 'iceberg',
                'params': {'order_type': 'iceberg', 'time_in_force': 'day', 'speed': 0.3, 'display_size': order['quantity'] * 0.1}
            },
            {
                'name': 'vwap',
                'params': {'order_type': 'vwap', 'time_in_force': 'day', 'speed': 0.7, 'vwap_window': 5}
            }
        ]
        
        return strategies[action]
    
    def update_performance(self, order, market_data, fill_status):
        """
        Update the model based on execution performance.
        """
        # Get current state
        state = self._get_state(order, market_data)
        
        # Calculate reward (positive for good fills, negative for bad)
        reward = self._calculate_reward(order, market_data, fill_status)
        
        # Get next state
        next_state = self._get_state(order, market_data)
        
        # Determine if episode is done
        done = fill_status['status'] in ['filled', 'canceled']
        
        # Store experience
        self.remember(state, self.act(state), reward, next_state, done)
        
        # Train on experience
        self.replay()
        
        # Update performance metrics
        self._update_performance_metrics(order, fill_status)
    
    def _calculate_reward(self, order, market_data, fill_status):
        """
        Calculate reward for the execution.
        """
        # Market conditions
        bid = market_data.get('bid', 0.0)
        ask = market_data.get('ask', 0.0)
        midpoint = (bid + ask) / 2
        
        # Execution metrics
        entry_price = order.get('price', midpoint)
        fill_price = fill_status.get('price', entry_price)
        
        # Price impact
        price_impact = abs(fill_price - midpoint) / (midpoint + 1e-9)
        
        # Time to fill
        time_to_fill = fill_status.get('time_to_fill', 0)
        
        # Fill rate
        fill_rate = fill_status.get('filled_qty', 0) / order.get('quantity', 1)
        
        # Calculate reward
        reward = 1.0  # Base reward
        
        # Penalty for price impact
        reward -= price_impact * 5.0
        
        # Penalty for slow fills
        if time_to_fill > 60:  # More than 1 minute
            reward -= 0.1 * (time_to_fill / 60.0)
        
        # Bonus for high fill rate
        reward += fill_rate * 0.5
        
        # Penalty for partial fills
        if fill_rate < 1.0:
            reward -= (1.0 - fill_rate) * 0.3
        
        # Bonus for minimal slippage
        slippage = abs(fill_price - entry_price) / (entry_price + 1e-9)
        if slippage < 0.001:  # Less than 0.1% slippage
            reward += 0.2
        
        return reward
    
    def _update_performance_metrics(self, order, fill_status):
        """Update execution performance metrics"""
        # Calculate slippage
        entry_price = order.get('price', 0.0)
        fill_price = fill_status.get('price', entry_price)
        slippage = abs(fill_price - entry_price) / (entry_price + 1e-9)
        
        # Update metrics
        self.performance['slippage'] = (
            self.performance['slippage'] * 0.9 + slippage * 0.1
        )
        
        self.performance['fill_rate'] = (
            self.performance['fill_rate'] * 0.9 + 
            (fill_status.get('filled_qty', 0) / order.get('quantity', 1)) * 0.1
        )
        
        self.performance['total_orders'] += 1
        self.performance['last_update'] = datetime.now()
    
    def get_performance_metrics(self):
        """Get current execution performance metrics"""
        return {
            **self.performance,
            'epsilon': self.epsilon,
            'step_count': self.step_count,
            'memory_size': len(self.memory)
        }
    
    def reset(self):
        """Reset the execution engine"""
        self.memory.clear()
        self.epsilon = 1.0
        self.step_count = 0
        self.last_update = datetime.now()
        
        # Reset performance metrics
        self.performance = {
            'slippage': 0.0,
            'fill_rate': 0.0,
            'win_rate': 0.0,
            'total_orders': 0,
            'last_update': datetime.now()
        }
        
        logger.info("Adaptive execution engine reset")
    
    def save_model(self, path: str):
        """Save the model to disk"""
        self.model.save(path)
        self.target_model.save(path + "_target")
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load a model from disk"""
        self.model = tf.keras.models.load_model(path)
        self.target_model = tf.keras.models.load_model(path + "_target")
        logger.info(f"Model loaded from {path}")
