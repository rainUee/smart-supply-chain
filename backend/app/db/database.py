from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.core.config import settings

# Async database engine
async_engine = create_async_engine(
    settings.DATABASE_URL_ASYNC,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Sync database engine (for migrations)
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Session factories
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Dependency to get async database session
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Dependency to get sync database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 