import time
from concurrent.futures import ThreadPoolExecutor

class ModelServer:
    """
    Background worker for periodic model training and batch inference tasks.
    """
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)

    def schedule_training(self, model_name, data):
        """Dispatches a training job to the background executor."""
        print(f"Scheduling training for {model_name}...")
        self.executor.submit(self._train_task, model_name, data)

    def _train_task(self, model_name, data):
        """Private task execution for training."""
        # Simulated training time
        time.sleep(5)
        print(f"Training completed for {model_name}.")

    def shutdown(self):
        self.executor.shutdown(wait=True)
