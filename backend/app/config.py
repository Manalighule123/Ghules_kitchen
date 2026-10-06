import os
from pydantic_settings import BaseSettings

# Absolute path to ghules_kitchen.db in the root project folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DEFAULT_DB_PATH = os.path.join(PROJECT_ROOT, "ghules_kitchen.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Ghules Kitchen - Distributed Cloud Kitchen Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ghules-kitchen-secret-key-2026-super-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
