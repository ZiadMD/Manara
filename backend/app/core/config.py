import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Basira Screening Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "manara_super_secret_psychometric_eval_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database URL: defaults to local PostgreSQL or sqlite fallback for test runs
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./manara.db")
    
    # Sync database URL for Alembic migrations
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", "sqlite:///./manara.db")

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    DATA_DIR: Path = BASE_DIR / "data"
    model_config = {"case_sensitive": True}

settings = Settings()
