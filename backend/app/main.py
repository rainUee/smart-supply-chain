from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import structlog

from app.core.config import settings
from app.api.v1 import auth_router, users_router, suppliers_router, products_router, purchase_orders_router

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Supply Chain Management API",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure this properly for production
    )

# Include API routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(suppliers_router, prefix="/api/v1/suppliers", tags=["suppliers"])
app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(purchase_orders_router, prefix="/api/v1/purchase-orders", tags=["purchase-orders"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Supply Chain API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else None
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("Starting Smart Supply Chain API", version=settings.APP_VERSION)


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Shutting down Smart Supply Chain API") 