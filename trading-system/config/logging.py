import logging
import sys
import json
from datetime import datetime
from config.settings import settings

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "filename": record.filename,
            "lineno": record.lineno,
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(settings.LOG_LEVEL)
    
    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    if settings.ENV == "production":
        handler.setFormatter(JSONFormatter())
    else:
        # Professional standard formatting for dev
        handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
    
    logger.addHandler(handler)
    return logger

logger = setup_logging()
