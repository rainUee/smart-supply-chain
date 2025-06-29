from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Smart Supply Chain API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Database
    DATABASE_URL: str
    DATABASE_URL_ASYNC: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AWS
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET: Optional[str] = None
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 