import numpy as np
import pandas as pd
import collections

class TradingEnv:
    """
    Simplified Reinforcement Learning environment for simulated trading.
    """
    def __init__(self, data: pd.Series):
        self.data = data.values
        self.n = len(self.data)
        self.reset()

    def reset(self):
        self.t = 0
        self.pos = 0 # -1, 0, 1
        return self._get_state()

    def _get_state(self):
        # State: [price_diff, current_pos]
        diff = self.data[self.t] - self.data[max(0, self.t-1)]
        return (round(diff, 2), self.pos)

    def step(self, action):
        """
        Actions: 0: Stay, 1: Long, 2: Short, 3: Exit
        """
        # Execute action
        old_pos = self.pos
        if action == 1: self.pos = 1
        elif action == 2: self.pos = -1
        elif action == 3: self.pos = 0
        
        # Reward: price change * position
        self.t += 1
        reward = (self.data[self.t] - self.data[self.t-1]) * old_pos
        
        done = (self.t == self.n - 1)
        return self._get_state(), reward, done

class QLearningTrader:
    """
    Q-Learning implementation for trading execution.
    """
    def __init__(self, alpha=0.1, gamma=0.9, epsilon=0.1):
        self.q_table = collections.defaultdict(lambda: np.zeros(4))
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon

    def choose_action(self, state):
        if np.random.rand() < self.epsilon:
            return np.random.randint(4)
        return np.argmax(self.q_table[state])

    def learn(self, state, action, reward, next_state):
        predict = self.q_table[state][action]
        target = reward + self.gamma * np.max(self.q_table[next_state])
        self.q_table[state][action] += self.alpha * (target - predict)

if __name__ == "__main__":
    # Example
    np.random.seed(42)
    prices = pd.Series(100 + np.cumsum(np.random.normal(0, 1, 1000)))
    
    env = TradingEnv(prices)
    agent = QLearningTrader()
    
    for episode in range(10):
        state = env.reset()
        done = False
        while not done:
            action = agent.choose_action(state)
            next_state, reward, done = env.step(action)
            agent.learn(state, action, reward, next_state)
            state = next_state
            
    print("Q-Table size:", len(agent.q_table))
