import pandas as pd

class MacroFeatures:
    """
    Integrates macroeconomic indicators into the feature pipeline.
    """
    def __init__(self, macro_data):
        self.macro_data = macro_data

    def get_inflation_adjusted(self, price_series, cpi_series):
        """Adjusts nominal prices for inflation."""
        return price_series / cpi_series

    def yield_curve_slope(self, ten_year, two_year):
        """Calculates the slope of the yield curve (proxy for recession risk)."""
        return ten_year - two_year
