import pandas as pd

class FundamentalFeatures:
    """
    Processes fundamental data for quantitative modeling.
    """
    @staticmethod
    def calculate_valuation_ratios(pe_ratio, pb_ratio, ps_ratio):
        """Standardizes valuation ratios for comparative analysis."""
        return {
            'PE': pe_ratio,
            'PB': pb_ratio,
            'PS': ps_ratio
        }

    @staticmethod
    def calc_growth_metrics(revenue, net_income):
        """Calculates YoY growth for revenue and income."""
        rev_growth = revenue.pct_change()
        inc_growth = net_income.pct_change()
        return rev_growth, inc_growth
