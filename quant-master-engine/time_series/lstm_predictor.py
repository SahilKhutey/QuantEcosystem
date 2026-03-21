import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

class LSTMPredictor(nn.Module):
    def __init__(self, input_size: int = 1, hidden_size: int = 50, num_layers: int = 2, output_size: int = 1):
        super(LSTMPredictor, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.2)
        self.dropout = nn.Dropout(0.2)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        # Initialize hidden state
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        
        # Forward pass
        out, _ = self.lstm(x, (h0, c0))
        out = self.dropout(out[:, -1, :])  # Take last output
        out = self.fc(out)
        return out

class AdvancedLSTMPredictor:
    def __init__(self, sequence_length: int = 60, prediction_horizon: int = 1):
        self.sequence_length = sequence_length
        self.prediction_horizon = prediction_horizon
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.model = None
        self.is_trained = False
        
    def prepare_data(self, data: pd.Series, train_ratio: float = 0.8) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Prepare data for LSTM training"""
        # Normalize data
        scaled_data = self.scaler.fit_transform(data.values.reshape(-1, 1))
        
        # Create sequences
        X, y = [], []
        for i in range(self.sequence_length, len(scaled_data) - self.prediction_horizon):
            X.append(scaled_data[i-self.sequence_length:i, 0])
            y.append(scaled_data[i+self.prediction_horizon-1, 0])
        
        X, y = np.array(X), np.array(y)
        
        # Split into train/test
        split_idx = int(len(X) * train_ratio)
        X_train = X[:split_idx]
        y_train = y[:split_idx]
        X_test = X[split_idx:]
        y_test = y[split_idx:]
        
        # Reshape for LSTM [samples, timesteps, features]
        X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
        X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)
        
        return X_train, y_train, X_test, y_test
    
    def train_model(self, data: pd.Series, epochs: int = 100, learning_rate: float = 0.001):
        """Train the LSTM model"""
        X_train, y_train, X_test, y_test = self.prepare_data(data)
        
        # Initialize model
        self.model = LSTMPredictor(
            input_size=1,
            hidden_size=50,
            num_layers=2,
            output_size=1
        )
        
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        
        # Convert to PyTorch tensors
        X_train_tensor = torch.FloatTensor(X_train)
        y_train_tensor = torch.FloatTensor(y_train)
        X_test_tensor = torch.FloatTensor(X_test)
        y_test_tensor = torch.FloatTensor(y_test)
        
        # Training loop
        train_losses = []
        test_losses = []
        
        for epoch in range(epochs):
            self.model.train()
            optimizer.zero_grad()
            
            # Forward pass
            outputs = self.model(X_train_tensor)
            loss = criterion(outputs.squeeze(), y_train_tensor)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            # Test loss
            self.model.eval()
            with torch.no_grad():
                test_outputs = self.model(X_test_tensor)
                test_loss = criterion(test_outputs.squeeze(), y_test_tensor)
            
            train_losses.append(loss.item())
            test_losses.append(test_loss.item())
            
            if epoch % 20 == 0:
                print(f'Epoch {epoch}, Train Loss: {loss.item():.6f}, Test Loss: {test_loss.item():.6f}')
        
        self.is_trained = True
        return {
            'train_losses': train_losses,
            'test_losses': test_losses,
            'final_train_loss': train_losses[-1],
            'final_test_loss': test_losses[-1]
        }
    
    def predict(self, data: pd.Series, future_steps: int = 1) -> Dict:
        """Make predictions using trained model"""
        if not self.is_trained or self.model is None:
            raise ValueError("Model must be trained before prediction")
        
        self.model.eval()
        
        # Prepare latest sequence
        scaled_data = self.scaler.transform(data.values.reshape(-1, 1))
        last_sequence = scaled_data[-self.sequence_length:].reshape(1, -1, 1)
        
        # Make prediction
        with torch.no_grad():
            last_sequence_tensor = torch.FloatTensor(last_sequence)
            prediction = self.model(last_sequence_tensor)
            predicted_value = prediction.numpy()[0, 0]
        
        # Inverse transform to original scale
        predicted_price = self.scaler.inverse_transform([[predicted_value]])[0, 0]
        
        # Generate confidence interval (simplified)
        current_price = data.iloc[-1]
        prediction_error = abs(predicted_price - current_price)
        confidence_interval = (
            predicted_price - prediction_error * 0.5,
            predicted_price + prediction_error * 0.5
        )
        
        return {
            'predicted_price': predicted_price,
            'current_price': current_price,
            'confidence_interval': confidence_interval,
            'prediction_error': prediction_error,
            'prediction_horizon': self.prediction_horizon
        }
    
    def generate_trading_signal(self, data: pd.Series, current_price: float) -> Dict:
        """Generate trading signal based on LSTM prediction"""
        try:
            prediction_results = self.predict(data)
            predicted_price = prediction_results['predicted_price']
            
            # Calculate expected return
            expected_return = (predicted_price - current_price) / current_price * 100
            
            # Signal logic
            if expected_return > 2.0:
                signal = "STRONG_BUY"
                confidence = min(0.9, expected_return / 5.0)
            elif expected_return > 0.5:
                signal = "BUY"
                confidence = min(0.7, expected_return / 3.0)
            elif expected_return < -2.0:
                signal = "STRONG_SELL"
                confidence = min(0.9, abs(expected_return) / 5.0)
            elif expected_return < -0.5:
                signal = "SELL"
                confidence = min(0.7, abs(expected_return) / 3.0)
            else:
                signal = "HOLD"
                confidence = 0.3
            
            return {
                'signal': signal,
                'confidence': confidence,
                'expected_return_pct': expected_return,
                'predicted_price': predicted_price,
                'model_type': 'LSTM',
                'sequence_length': self.sequence_length
            }
            
        except Exception as e:
            return {
                'signal': 'HOLD',
                'error': str(e),
                'confidence': 0.0
            }
