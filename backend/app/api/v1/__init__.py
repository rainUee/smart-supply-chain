from .auth import router as auth_router
from .users import router as users_router
from .suppliers import router as suppliers_router
from .products import router as products_router
from .purchase_orders import router as purchase_orders_router

__all__ = [
    "auth_router",
    "users_router", 
    "suppliers_router",
    "products_router",
    "purchase_orders_router",
] 