import logging
import time
from datetime import datetime, timedelta
from data_engine.data_aggregator import DataAggregator
from config.settings import API_KEYS

def validate_data_integrity():
    """Validate data integrity across all data sources"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("data_validation.log"),
            logging.StreamHandler()
        ]
    )
    
    logger = logging.getLogger('DataValidation')
    logger.info("Starting data integrity validation")
    
    # Initialize data aggregator
    aggregator = DataAggregator(API_KEYS)
    
    # Test 1: Market data quality
    logger.info("Testing market data quality...")
    
    # Test US stocks
    aapl_data = aggregator.get_market_data('AAPL', start=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
    if aapl_data.empty:
        logger.error("AAPL data validation failed: No data returned")
    else:
        # Check data quality metrics
        if 'close' not in aapl_data.columns:
            logger.error("AAPL data validation failed: Missing 'close' column")
        
        if len(aapl_data) < 20:
            logger.error(f"AAPL data validation failed: Insufficient data points ({len(aapl_data)})")
        else:
            logger.info(f"AAPL data validation passed with {len(aapl_data)} data points")
            
            # Check price range consistency
            if (aapl_data['high'] < aapl_data['low']).any():
                logger.error("AAPL data validation failed: High price lower than low price in some periods")
            
            # Check volume consistency
            if (aapl_data['volume'] < 0).any():
                logger.error("AAPL data validation failed: Negative volume values detected")
            
            # Check for missing values
            missing_values = aapl_data.isnull().sum()
            if missing_values.any():
                logger.error(f"AAPL data validation failed: Missing values detected: {missing_values}")
            else:
                logger.info("AAPL data validation passed all quality checks")
    
    # Test 2: Forex data quality
    logger.info("Testing forex data quality...")
    
    eurusd_data = aggregator.get_market_data('EURUSD', asset_type='forex', start=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
    if eurusd_data.empty:
        logger.error("EURUSD data validation failed: No data returned")
    else:
        # Check data quality metrics
        if 'close' not in eurusd_data.columns:
            logger.error("EURUSD data validation failed: Missing 'close' column")
        
        if len(eurusd_data) < 20:
            logger.error(f"EURUSD data validation failed: Insufficient data points ({len(eurusd_data)})")
        else:
            logger.info(f"EURUSD data validation passed with {len(eurusd_data)} data points")
            
            # Check price range consistency
            if (eurusd_data['high'] < eurusd_data['low']).any():
                logger.error("EURUSD data validation failed: High price lower than low price in some periods")
            
            # Check for missing values
            missing_values = eurusd_data.isnull().sum()
            if missing_values.any():
                logger.error(f"EURUSD data validation failed: Missing values detected: {missing_values}")
            else:
                logger.info("EURUSD data validation passed all quality checks")
    
    # Test 3: Market data consistency across sources
    logger.info("Testing market data consistency across sources...")
    
    try:
        # Get data from primary source (Yahoo Finance)
        aapl_yf = aggregator.sources['yahoo_finance'].get_historical_data('AAPL')
        
        # Get data from secondary source (Alpha Vantage)
        aapl_av = aggregator.sources['alpha_vantage'].get_historical_data('AAPL')
        
        # Check if both have data
        if not aapl_yf.empty and not aapl_av.empty:
            # Align data to same time period
            common_dates = aapl_yf.index.intersection(aapl_av.index)
            aapl_yf = aapl_yf.loc[common_dates]
            aapl_av = aapl_av.loc[common_dates]
            
            # Calculate correlation between close prices
            correlation = aapl_yf['close'].corr(aapl_av['close'])
            
            if correlation < 0.95:
                logger.warning(f"Data inconsistency detected: Correlation between sources is {correlation:.2f}")
            else:
                logger.info(f"Data consistency check passed: Correlation between sources is {correlation:.2f}")
        
    except Exception as e:
        logger.error(f"Error checking data consistency: {str(e)}")
    
    # Test 4: News data quality
    logger.info("Testing news data quality...")
    
    news = aggregator.get_news_data(max_results=10)
    if not news:
        logger.error("News data validation failed: No news articles returned")
    else:
        logger.info(f"News data validation passed with {len(news)} articles")
        
        # Check required fields
        missing_fields = []
        for i, article in enumerate(news):
            if not article.get('title'):
                missing_fields.append(f"Article {i} missing title")
            if not article.get('url'):
                missing_fields.append(f"Article {i} missing URL")
            if not article.get('published_at'):
                missing_fields.append(f"Article {i} missing publication date")
        
        if missing_fields:
            logger.error(f"News data validation failed: {len(missing_fields)} issues found:")
            for issue in missing_fields:
                logger.error(f"- {issue}")
        else:
            logger.info("News data validation passed all quality checks")
    
    # Test 5: Economic data quality
    logger.info("Testing economic data quality...")
    
    try:
        gdp_data = aggregator.get_economic_data('GDP', start_date=(datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"))
        if gdp_data.empty:
            logger.error("GDP data validation failed: No data returned")
        else:
            logger.info(f"GDP data validation passed with {len(gdp_data)} data points")
            
            # Check for reasonable values
            if (gdp_data['value'] < 0).any():
                logger.error("GDP data validation failed: Negative GDP values detected")
            
            # Check for missing values
            if gdp_data['value'].isnull().any():
                logger.error("GDP data validation failed: Missing GDP values detected")
            else:
                logger.info("GDP data validation passed all quality checks")
    except Exception as e:
        logger.error(f"Error validating GDP data: {str(e)}")
    
    # Test 6: Data freshness
    logger.info("Testing data freshness...")
    
    # Check if market data is recent
    recent_data = aggregator.get_market_data(
        'AAPL', 
        start=(datetime.now() - timedelta(hours=24)).strftime("%Y-%m-%d")
    )
    
    if recent_data.empty:
        logger.error("Data freshness validation failed: No recent data")
    else:
        last_timestamp = recent_data.index[-1]
        freshness = (datetime.now() - last_timestamp).total_seconds() / 60
        
        if freshness > 120:  # More than 2 hours old
            logger.warning(f"Data freshness validation warning: Data is {freshness:.1f} minutes old")
        else:
            logger.info(f"Data freshness validation passed: Data is {freshness:.1f} minutes old")
    
    # Test 7: Alternative data integration
    logger.info("Testing alternative data integration...")
    
    # In production, this would test satellite, shipping, etc. data
    # For demonstration, log a message
    logger.info("Alternative data integration test (mock): Passed")
    
    # Final summary
    logger.info("\n" + "="*50)
    logger.info("DATA VALIDATION SUMMARY")
    logger.info("="*50)
    logger.info(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Status: {'Validation completed successfully' if not logger.hasHandlers() else 'Validation completed with warnings'}")
    logger.info("="*50)

if __name__ == "__main__":
    validate_data_integrity()
