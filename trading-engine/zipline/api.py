# Global state to mimic Zipline magic `api` injection
_algo = None

def get_current_algo():
    if _algo is None:
        raise RuntimeError("Zipline API functions must be called from within a running TradingAlgorithm.")
    return _algo

def order(asset, amount, style=None):
    """
    Place an order for `amount` shares of `asset`.
    Executes mock-fill immediately at the current bar's close price.
    """
    algo = get_current_algo()
    portfolio = algo.context.portfolio
    
    # Needs the current price. We assume the BarData is tracking this.
    # Because we don't have direct BarData ref here, we rely on the position's last update
    # or a global price map. For simplicity in the mimic, we fetch from a global mock or skip.
    # We will assume `order` executes against `bar_data.current(asset, 'close')` conceptually.
    # To do this natively, we need to ask the algo perfectly. We'll simplify:
    
    # We assume 'style' is skipped for our simple mock.
    if amount == 0:
        return None

    # We need price. We assume positions hold last known price.
    # If not in positions, we'll try to find it. This requires the `BarData` reference.
    # We will let Execution handler solve it, or just pass to algorithm handler.
    # Wait, our mock algo doesn't have an order queue. Let's do instant fill for simplicity.
    if asset not in portfolio.positions:
        import trading_engine.zipline.algorithm as alg
        portfolio.positions[asset] = alg.SimplePosition(asset)
        
    pos = portfolio.positions[asset]
    
    # What's the price?
    # We should have stored it in the position. If it's a new asset, it's 0.0 right now!
    # In a real zipline, this sends it to a broker. 
    # For our engine, let's inject a 'current_prices' dict into the algo during the run loop.
    price = getattr(algo, '_current_prices', {}).get(asset, 0.0)
    
    if price == 0.0:
        print(f"Warning: Tried to order {asset} but price is unknown. Skipping.")
        return None
        
    cost = max(price * amount, 0)
    value = price * amount
    
    portfolio.cash -= value
    pos.amount += amount
    pos.last_sale_price = price
    
    return f"ORDER_{asset}_{amount}"

def order_target_percent(asset, target):
    """
    Place an order to adjust a position to a target percent of the current portfolio value.
    """
    algo = get_current_algo()
    portfolio = algo.context.portfolio
    portfolio.update_value()
    
    target_value = portfolio.portfolio_value * target
    
    price = getattr(algo, '_current_prices', {}).get(asset, 0.0)
    if price == 0.0:
        return None
        
    current_amount = 0
    if asset in portfolio.positions:
         current_amount = portfolio.positions[asset].amount
         
    current_value = current_amount * price
    value_difference = target_value - current_value
    
    amount_to_order = int(value_difference / price)
    if amount_to_order != 0:
        return order(asset, amount_to_order)
        
    return None

def record(**kwargs):
    """
    Track custom user values throughout the simulation.
    """
    algo = get_current_algo()
    dt = algo.current_dt
    for k, v in kwargs.items():
        if k not in algo.recorded_vars:
            algo.recorded_vars[k] = {}
        algo.recorded_vars[k][dt] = v

def symbol(ticker):
    """
    Convert string ticker to an asset object.
    For simplicity, returns the ticker string itself.
    """
    return ticker
