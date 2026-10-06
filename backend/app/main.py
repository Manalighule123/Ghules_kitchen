from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth_router,
    kitchens_router,
    cooks_router,
    orders_router,
    ai_router,
    voice_router,
    notifications_router,
    analytics_router,
    reviews_router,
    complaints_router,
    packaging_router,
    settings_router
)
from app.websocket.manager import ws_manager

# Ensure all database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Ghules Kitchen AI-Powered Distributed Homemade Food & Kitchen Capacity Platform API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local prototype flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(kitchens_router, prefix=settings.API_V1_STR)
app.include_router(cooks_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(voice_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(reviews_router, prefix=settings.API_V1_STR)
app.include_router(complaints_router, prefix=settings.API_V1_STR)
app.include_router(packaging_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Ghule's Kitchen AI-Powered Distributed Capacity Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "ONLINE"
    }

# WebSocket Endpoint
@app.websocket("/ws/orders/{kitchen_id}")
async def websocket_orders_endpoint(websocket: WebSocket, kitchen_id: int):
    await ws_manager.connect(websocket, kitchen_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f'{{"event": "PONG", "received": {data}}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, kitchen_id)
    except Exception:
        ws_manager.disconnect(websocket, kitchen_id)
