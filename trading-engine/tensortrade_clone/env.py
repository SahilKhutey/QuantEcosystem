class TradingEnv:
    """
    The master TensorTrade Gym Environment assembly tying all modules together natively.
    """
    def __init__(self, action_scheme, reward_scheme, broker, feed):
        self.action_scheme = action_scheme
        self.reward_scheme = reward_scheme
        self.broker = broker
        self.feed = feed
        
        # Link environments
        self.action_scheme.broker = self.broker
        self.reward_scheme.broker = self.broker
        
        self.history = []
        self.current_obs = None

    def reset(self):
        self.broker.reset()
        self.feed.reset()
        self.action_scheme.__init__()
        self.reward_scheme.__init__()
        
        self.action_scheme.broker = self.broker
        self.reward_scheme.broker = self.broker
        
        self.history = []
        self.current_obs = self.feed.next()
        return self.current_obs

    def step(self, action):
        """Standard OpenAI Gym interface using isolated modules"""
        if self.current_obs is None:
             return None, 0, True, {}
             
        current_price = self.current_obs['close']
        
        # 1. Action Scheme executes Intent
        intent_type, qty = self.action_scheme.perform(action, current_price)
        
        # 2. Broker Evaluates new World State
        net_worth = self.broker.evaluate(current_price)
        
        # 3. Reward Scheme calculates Feedback Factor
        reward = self.reward_scheme.get_reward()
        
        # 4. Advance DataFeed
        self.current_obs = self.feed.next()
        done = self.current_obs is None
        
        # Optional: Save history
        self.history.append({
            'action': intent_type,
            'qty': round(qty, 4),
            'price': round(current_price, 2),
            'reward': round(reward, 4),
            'net_worth': round(net_worth, 2)
        })
        
        info = {
            'action': intent_type,
            'net_worth': net_worth
        }
        
        return self.current_obs, reward, done, info
