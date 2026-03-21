from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'trading-engine')))

from prophet_clone.forecaster import ProphetModel

prophet_bp = Blueprint('prophet_framework', __name__)

@prophet_bp.route('/run', methods=['POST'])
def run_prophet():
    """Builds and runs the Meta Prophet GAM forecaster"""
    data_payload = request.json or {}
    forecast_horizon = int(data_payload.get('horizon', 90)) # Default forecast 90 days out
    
    # 1. Generate standard Time-Series History (e.g. Sales, Revenue, or Prices)
    # We will generate a curve that has obvious trend and seasonality
    np.random.seed(42)
    periods = 730 # 2 years of history
    dates = pd.date_range(start='2021-01-01', periods=periods, freq='D')
    
    # Construct base deterministic signal
    time_t = np.arange(periods)
    actual_trend = time_t * 0.15 + 50 # Upward drift
    actual_yearly = np.sin(2 * np.pi * time_t / 365.25) * 15 # Yearly cycle
    actual_weekly = np.sin(2 * np.pi * time_t / 7) * 3 # Weekly cycle
    noise = np.random.normal(0, 2, periods) # Measurement noise
    
    y = actual_trend + actual_yearly + actual_weekly + noise
    
    df_train = pd.DataFrame({'ds': dates, 'y': y})
    
    # 2. Instantiate and Fit the Prophet Model
    model = ProphetModel()
    model.fit(df_train)
    
    # 3. Create Future DataFrame (History + Horizon)
    future = model.make_future_dataframe(periods=forecast_horizon)
    
    # 4. Predict
    forecast = model.predict(future)
    
    # Merge historical actuals (`y`) into the forecast to easily plot them together
    forecast = pd.merge(forecast, df_train, on='ds', how='left')
    
    # 5. Format Data for the UI
    # We resample slightly to reduce payload size over HTTP, but keep the structure
    forecast_weekly = forecast.set_index('ds').resample('W').last().reset_index()
    
    timeseries = []
    component_trend = []
    component_yearly = []
    component_weekly = []
    
    for idx, row in forecast_weekly.iterrows():
        timeseries.append({
            'date': row['ds'].strftime('%Y-%m-%d'),
            'y': row['y'] if not np.isnan(row['y']) else None, # Real historical observations
            'yhat': float(row['yhat']),                      # GAM Projection
            'yhat_lower': float(row['yhat_lower']),          # 95% Confidence floor
            'yhat_upper': float(row['yhat_upper'])           # 95% Confidence ceiling
        })
        
        component_trend.append({
             'date': row['ds'].strftime('%Y-%m-%d'),
             'trend': float(row['trend'])
        })
        
        component_yearly.append({
             'day_of_year': int(row['ds'].dayofyear),
             'yearly': float(row['yearly'])
        })

    # For weekly, we just map 0-6 to day names
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for i in range(7):
         component_weekly.append({
             'day': days[i],
             'effect': model.weekly_seasonality.get(i, 0.0)
         })
         
    # Sort yearly by day of year so it plots cleanly as a single wave
    component_yearly = sorted(component_yearly, key=lambda x: x['day_of_year'])

    return jsonify({
        "status": "success",
        "message": f"Prophet Generalized Additive Model projected {forecast_horizon} days.",
        "config": {
            "History": f"{periods} Days",
            "Linear Trend": "Fitted",
            "Yearly Seasonality": "Fitted (Fourier)",
            "Weekly Seasonality": "Fitted (Dummy)"
        },
        "forecast": timeseries,
        "components": {
            "trend": component_trend,
            "weekly": component_weekly,
            "yearly": component_yearly
        }
    })
