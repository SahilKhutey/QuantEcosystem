import numpy as np
import pandas as pd

class WalkForwardOptimization:
    """
    Framework for Walk-Forward Optimization (WFO) to prevent overfitting.
    Divides data into multiple train/test (anchored or sliding) windows.
    """
    def __init__(self, train_size=252, test_size=63, anchored=False):
        self.train_size = train_size
        self.test_size = test_size
        self.anchored = anchored

    def split(self, data: pd.DataFrame):
        """
        Generates walk-forward splits.
        """
        n = len(data)
        indices = []
        
        start = 0
        while start + self.train_size + self.test_size <= n:
            train_start = 0 if self.anchored else start
            train_end = start + self.train_size
            test_end = train_end + self.test_size
            
            indices.append((
                (train_start, train_end),
                (train_end, test_end)
            ))
            
            start += self.test_size
            
        return indices

if __name__ == "__main__":
    # Example
    data = pd.DataFrame(np.random.normal(0, 1, (1000, 5)))
    wfo = WalkForwardOptimization(train_size=200, test_size=50)
    splits = wfo.split(data)
    print(f"Number of WFO splits: {len(splits)}")
    print(f"First split: {splits[0]}")
