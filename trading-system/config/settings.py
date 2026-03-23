from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Dict

class Settings(BaseSettings):
    # Alpaca API Settings
    API_KEY: str = "your_api_key"
    API_SECRET: str = "your_secret_key"
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"
    
    # IBKR Settings
    IB_HOST: str = "127.0.0.1"
    IB_PORT: int = 7497
    IB_CLIENT_ID: int = 1
    
    # Trading Settings
    STRATEGY_NAME: str = "MeanReversion"
    MAX_POSITION_SIZE_PCT: float = 0.05
    STOP_LOSS_PCT: float = 0.02
    TAKE_PROFIT_PCT: float = 0.05
    
    # Logging Settings
    LOG_LEVEL: str = "INFO"
    ENV: str = "development"
    
    # Compatibility with provided service code
    @property
    def API_KEYS(self) -> Dict[str, str]:
        return {
            'alpaca_key': self.API_KEY,
            'alpaca_secret': self.API_SECRET
        }
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
API_KEYS = settings.API_KEYS
