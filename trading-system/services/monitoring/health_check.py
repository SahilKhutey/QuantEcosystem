import asyncio
import psutil
from config.logging import logger

class HealthCheck:
    @staticmethod
    async def monitor():
        while True:
            cpu = psutil.cpu_percent()
            memory = psutil.virtual_memory().percent
            logger.info(f"HEALTH CHECK: CPU: {cpu}%, MEM: {memory}%")
            if cpu > 90 or memory > 90:
                logger.warning("Resource utilization high!")
            await asyncio.sleep(60)
