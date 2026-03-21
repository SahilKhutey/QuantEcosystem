import logging
from data_engine.data_pipeline import DataPipeline
from config.settings import API_KEYS

def start_data_pipeline():
    """Start the data pipeline service"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("data_pipeline.log"),
            logging.StreamHandler()
        ]
    )
    
    logger = logging.getLogger('DataPipelineService')
    logger.info("Starting Data Pipeline Service")
    
    try:
        pipeline = DataPipeline(
            api_keys=API_KEYS,
            update_interval=60  # 1 minute
        )
        
        logger.info("Data pipeline initialized successfully")
        logger.info("Starting data pipeline...")
        pipeline.start()
        
    except Exception as e:
        logger.error(f"Data pipeline service failed: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    start_data_pipeline()
