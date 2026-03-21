import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import Tuple

class LSTMPredictor(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, output_size: int):
        super(LSTMPredictor, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class PricePredictor:
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.model = LSTMPredictor(input_size=1, hidden_size=50, num_layers=2, output_size=1)
        
    def prepare_data(self, prices: pd.Series, lookback: int = 60) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare data for LSTM training"""
        scaled_prices = self.scaler.fit_transform(prices.values.reshape(-1, 1))
        
        X, y = [], []
        for i in range(lookback, len(scaled_prices)):
            X.append(scaled_prices[i-lookback:i, 0])
            y.append(scaled_prices[i, 0])
            
        return np.array(X), np.array(y)
    
    def predict_next_price(self, recent_prices: pd.Series) -> float:
        """Predict next price using trained model"""
        # Set model to evaluation mode
        self.model.eval()
        
        # Scale input data
        scaled_data = self.scaler.transform(recent_prices.values.reshape(-1, 1))
        input_tensor = torch.FloatTensor(scaled_data).unsqueeze(0) # [1, lookback, 1]
        
        with torch.no_grad():
            prediction = self.model(input_tensor)
            
        # Inverse scale the prediction
        predicted_price = self.scaler.inverse_transform(prediction.numpy())
        return float(predicted_price[0][0])
