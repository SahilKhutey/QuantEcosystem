import pandas as pd
import numpy as np
from datetime import timedelta

class ProphetModel:
    """
    Simulates the Meta (Facebook) Prophet Generalized Additive Model.
    Deconstructs time-series signals into Base Trend, Weekly Seasonality, and Yearly Seasonality.
    """
    def __init__(self):
        self.history = None
        self.trend_slope = 0
        self.trend_offset = 0
        self.weekly_seasonality = {}
        self.yearly_amplitude = 0
        self.yearly_phase = 0
        self.scale_factor = 1.0

    def fit(self, df: pd.DataFrame):
        """
        Expects standard Prophet DataFrame: columns ['ds', 'y']
        """
        if 'ds' not in df.columns or 'y' not in df.columns:
            raise ValueError("Dataframe must contain 'ds' (datetime) and 'y' (target) columns.")
            
        self.history = df.copy()
        self.history['ds'] = pd.to_datetime(self.history['ds']).dt.tz_localize(None)
        self.history = self.history.sort_values('ds').reset_index(drop=True)
        
        # 1. Base Trend (Simulated piece-wise linear fit)
        # Using a simplistic OLS over the entire history for the mock
        x = np.arange(len(self.history))
        y = self.history['y'].values
        
        coefficients = np.polyfit(x, y, 1)
        self.trend_slope = coefficients[0]
        self.trend_offset = coefficients[1]
        
        # Residuals remaining after Trend is extracted
        trend_y = (self.trend_slope * x) + self.trend_offset
        residuals = y - trend_y
        self.history['residual'] = residuals
        
        # 2. Weekly Seasonality
        # Extract the day of the week (0=Monday, 6=Sunday) and average the residuals
        self.history['day_of_week'] = self.history['ds'].dt.dayofweek
        weekly_means = self.history.groupby('day_of_week')['residual'].mean().to_dict()
        
        # Smooth and store weekly effects (Prophet uses dummy variables in reality)
        for i in range(7):
             self.weekly_seasonality[i] = weekly_means.get(i, 0.0)
             
        # Residuals remaining after Weekly is extracted
        self.history['residual'] = self.history.apply(
             lambda row: row['residual'] - self.weekly_seasonality[row['day_of_week']], axis=1
        )
        
        # 3. Yearly Seasonality (Simulated Fourier Transform peak)
        # Prophet uses multiple Fourier terms (N=10 for yearly). We mock a primary sine wave.
        self.history['day_of_year'] = self.history['ds'].dt.dayofyear
        
        # simplistic fit to a generic yearly sine wave
        # A * sin(2*pi*t/365.25 + phi)
        # For our mock, we just define a static deterministic amplitude and phase 
        # based roughly on the standard deviation of remaining residuals
        self.yearly_amplitude = np.std(self.history['residual']) * 0.5
        self.yearly_phase = np.pi / 4 # Offset
        
        # Final residual variance establishes the confidence intervals
        self.scale_factor = np.std(self.history['residual'])

    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generates predictions `yhat` along with uncertainty intervals `yhat_lower`, `yhat_upper`.
        Expects a DataFrame with just the 'ds' column containing future dates to predict.
        """
        if self.history is None:
            raise ValueError("Model must be fitted before predicting.")
            
        out_df = df.copy()
        out_df['ds'] = pd.to_datetime(out_df['ds']).dt.tz_localize(None)
        
        # Reconstruct the Absolute Day Index (t)
        base_date = self.history['ds'].iloc[0]
        
        yhat_list = []
        trend_list = []
        weekly_list = []
        yearly_list = []
        
        for idx, row in out_df.iterrows():
            current_date = row['ds']
            t_days = (current_date - base_date).days
            
            # 1. Base Trend
            trend = (self.trend_slope * t_days) + self.trend_offset
            
            # 2. Weekly component
            day_of_week = current_date.dayofweek
            weekly = self.weekly_seasonality.get(day_of_week, 0.0)
            
            # 3. Yearly component
            day_of_year = current_date.dayofyear
            yearly = self.yearly_amplitude * np.sin(2 * np.pi * day_of_year / 365.25 + self.yearly_phase)
            
            # Final additive recombination
            yhat = trend + weekly + yearly
            
            trend_list.append(trend)
            weekly_list.append(weekly)
            yearly_list.append(yearly)
            yhat_list.append(yhat)
            
        out_df['trend'] = trend_list
        out_df['weekly'] = weekly_list
        out_df['yearly'] = yearly_list
        out_df['yhat'] = yhat_list
        
        # Generate expanding confidence funnel. Uncertainty grows over time (t_days).
        last_train_t = (self.history['ds'].iloc[-1] - base_date).days
        
        out_df['uncertainty'] = out_df['ds'].apply(
            lambda d: max(0, ((d - base_date).days - last_train_t) * 0.05) + 1.0
        )
        
        out_df['yhat_lower'] = out_df['yhat'] - (self.scale_factor * 1.96 * out_df['uncertainty'])
        out_df['yhat_upper'] = out_df['yhat'] + (self.scale_factor * 1.96 * out_df['uncertainty'])
        
        return out_df

    def make_future_dataframe(self, periods: int, freq='D') -> pd.DataFrame:
        """
        Helper method mirroring the Prophet library to auto-generate the prediction target timeline.
        """
        last_date = self.history['ds'].iloc[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=periods, freq=freq)
        
        # Combine historical 'ds' with future 'ds'
        all_dates = pd.concat([self.history['ds'], pd.Series(future_dates)], ignore_index=True)
        return pd.DataFrame({'ds': all_dates})
