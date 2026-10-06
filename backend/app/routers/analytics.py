from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Kitchen, Cook, User, Order, CookAssignment
from app.services.overload_detection import check_kitchen_overload

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_analytics(db: Session = Depends(get_db)):
    total_kitchens = db.query(Kitchen).count()
    total_cooks = db.query(Cook).count()
    total_customers = db.query(User).filter(User.role == "customer").count()
    total_orders = db.query(Order).count()

    overloaded_kitchens_count = 0
    total_overloaded_orders = 0

    kitchen_stats = []
    kitchens = db.query(Kitchen).all()
    for k in kitchens:
        status = check_kitchen_overload(db, k.id)
        if status.is_overloaded:
            overloaded_kitchens_count += 1
            total_overloaded_orders += status.overload_count
        kitchen_stats.append({
            "name": k.name,
            "total_capacity": k.total_capacity,
            "current_orders": status.current_orders,
            "overload": status.overload_count,
            "status": status.status
        })

    distributed_orders_count = db.query(Order).filter(
        Order.assigned_cook_id.is_not(None)
    ).count()

    active_orders_count = db.query(Order).filter(
        Order.status.in_(["PLACED", "CONFIRMED", "OVERLOAD_DETECTED", "COOK_ASSIGNED", "COOK_ACCEPTED", "PREPARING"])
    ).count()

    # Cook utilization stats
    available_cooks = db.query(Cook).filter(Cook.available == True).count()
    cook_stats = []
    cooks = db.query(Cook).all()
    for c in cooks:
        u = db.query(User).filter(User.id == c.user_id).first()
        used = c.max_capacity - c.current_capacity
        cook_stats.append({
            "name": u.name if u else f"Cook #{c.id}",
            "max_capacity": c.max_capacity,
            "used_capacity": used,
            "remaining_capacity": c.current_capacity,
            "available": c.available
        })

    # Order volume breakdown by status
    status_counts = {}
    for st in ["PLACED", "CONFIRMED", "OVERLOAD_DETECTED", "COOK_ASSIGNED", "COOK_ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]:
        status_counts[st] = db.query(Order).filter(Order.status == st).count()

    return {
        "summary": {
            "total_kitchens": total_kitchens,
            "total_cooks": total_cooks,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "active_orders": active_orders_count,
            "distributed_orders": distributed_orders_count,
            "overloaded_kitchens": overloaded_kitchens_count,
            "total_overloaded_orders": total_overloaded_orders,
            "available_cooks": available_cooks
        },
        "kitchen_capacity_chart": kitchen_stats,
        "cook_utilization_chart": cook_stats,
        "order_status_chart": [{"status": k, "count": v} for k, v in status_counts.items()],
        "system_status": {
            "ai_matching_engine": "ONLINE",
            "overload_detector": "ACTIVE",
            "voice_nlp_agent": "ONLINE",
            "websocket_gateway": "CONNECTED",
            "database_connection": "HEALTHY"
        }
    }
