from app.routers.auth import router as auth_router
from app.routers.kitchens import router as kitchens_router
from app.routers.cooks import router as cooks_router
from app.routers.orders import router as orders_router
from app.routers.ai import router as ai_router
from app.routers.voice import router as voice_router
from app.routers.notifications import router as notifications_router
from app.routers.analytics import router as analytics_router
from app.routers.reviews import router as reviews_router
from app.routers.complaints import router as complaints_router
from app.routers.packaging import router as packaging_router
from app.routers.settings import router as settings_router

__all__ = [
    "auth_router",
    "kitchens_router",
    "cooks_router",
    "orders_router",
    "ai_router",
    "voice_router",
    "notifications_router",
    "analytics_router",
    "reviews_router",
    "complaints_router",
    "packaging_router",
    "settings_router"
]
