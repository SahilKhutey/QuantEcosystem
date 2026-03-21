import numpy as np

class MarkovChains:
    """
    State transition modeling for market regimes (e.g., Bull, Bear, Sideways).
    """
    def __init__(self, transition_matrix):
        self.transition_matrix = np.array(transition_matrix)
        self.states = len(transition_matrix)

    def next_state(self, current_state):
        """Predicts the next state based on transition probabilities."""
        return np.random.choice(self.states, p=self.transition_matrix[current_state])

    def stationary_distribution(self):
        """Calculates the long-term stable probabilities for each state."""
        vals, vecs = np.linalg.eig(self.transition_matrix.T)
        stationary = vecs[:, np.isclose(vals, 1)].real
        return (stationary / stationary.sum()).flatten()
