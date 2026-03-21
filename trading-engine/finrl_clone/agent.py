import numpy as np

class DRLAgent:
    """
    Simulates the wrapper for stable_baselines3 (PPO, A2C, DDPG) 
    in the FinRL framework.
    """
    def __init__(self, env):
        self.env = env
        self.policy_network = None
        self.training_history = []

    def train_model(self, model_name="PPO", total_timesteps=10):
        """
        Simulates the model.learn(total_timesteps) function.
        In reality this performs thousands of gradient descents. Here we mock
        it to generate a 'learning curve' showing the agent getting smarter.
        """
        self.training_history = []
        
        # Simulate PPO learning curve over epochs
        for epoch in range(total_timesteps):
            # As training goes on, loss decreases and episodic reward increases
            base_reward = -200 + (epoch * 40) + np.random.normal(0, 50)
            
            # Caps out asymptotically
            max_reward = 1500
            current_reward = min(base_reward, max_reward - np.random.normal(0, 100))
            
            # Loss exponentially decays
            policy_loss = 2.5 * np.exp(-epoch / 3.0) + np.random.normal(0, 0.1)
            
            self.training_history.append({
                'epoch': epoch,
                'episodic_reward': round(current_reward, 2),
                'policy_loss': round(abs(policy_loss), 4)
            })
            
        # The agent is "Trained"
        self.policy_network = "Trained_PPO_Weights_V1"
        return self.training_history

    def DRL_prediction(self, env):
        """
        The evaluation hook (`predict`). Uses the "trained" policy 
        against an out-of-sample environment dataset.
        """
        state = env.reset()
        terminal = False
        
        # A semi-intelligent deterministic action policy simulating a trained agent
        # Buy low, sell high on momentum.
        while not terminal:
            actions = []
            
            # State structure: [Cash, H0, H1, H2, P0, P1, P2]
            n_assets = env.action_space_length
            prices = state[1 + n_assets : 1 + (2 * n_assets)]
            
            # Naive mock RL decision logic: Mean reversion with momentum scaling
            for i in range(len(prices)):
                p = prices[i]
                # Simulating a neural network activation output between -1 and 1
                if p < 95:
                    action = np.random.uniform(0.5, 1.0) # Strong Buy
                elif p > 105:
                    action = np.random.uniform(-1.0, -0.5) # Strong Sell
                else:
                    action = np.random.uniform(-0.2, 0.2) # Hold/minor adjustment
                actions.append(action)
                
            state, reward, terminal = env.step(actions)
            
        return env.asset_memory, env.date_memory
