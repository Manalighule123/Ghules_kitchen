from sqlalchemy.orm import Session
from app.models.models import Kitchen, Order
from app.schemas.schemas import KitchenCapacityOut, OverloadStatusOut

def check_kitchen_overload(db: Session, kitchen_id: int) -> OverloadStatusOut:
    kitchen = db.query(Kitchen).filter(Kitchen.id == kitchen_id).first()
    if not kitchen:
        raise ValueError(f"Kitchen with ID {kitchen_id} not found")

    # Count all active/non-delivered orders belonging to this kitchen
    active_statuses = ["PLACED", "CONFIRMED", "OVERLOAD_DETECTED", "SEARCHING_COOK", "COOK_ASSIGNED", "COOK_ACCEPTED", "PREPARING"]
    active_orders_count = db.query(Order).filter(
        Order.kitchen_id == kitchen_id,
        Order.status.in_(active_statuses)
    ).count()

    # Calculate overload
    total_capacity = kitchen.total_capacity
    if active_orders_count > total_capacity:
        overload_count = active_orders_count - total_capacity
        new_status = "OVERLOAD_DETECTED"
        is_overloaded = True
    else:
        overload_count = 0
        new_status = "NORMAL"
        is_overloaded = False

    # Sync status to database
    if kitchen.status != new_status:
        kitchen.status = new_status
        db.commit()
        db.refresh(kitchen)

    return OverloadStatusOut(
        kitchen_id=kitchen.id,
        kitchen_name=kitchen.name,
        total_capacity=total_capacity,
        current_orders=active_orders_count,
        overload_count=overload_count,
        status=new_status,
        is_overloaded=is_overloaded
    )

def get_kitchen_capacity_details(db: Session, kitchen_id: int) -> KitchenCapacityOut:
    overload_status = check_kitchen_overload(db, kitchen_id)
    kitchen = db.query(Kitchen).filter(Kitchen.id == kitchen_id).first()
    
    preparing_count = db.query(Order).filter(
        Order.kitchen_id == kitchen_id,
        Order.status.in_(["PREPARING", "COOK_ACCEPTED", "COOK_ASSIGNED"])
    ).count()

    avail = max(0, kitchen.total_capacity - overload_status.current_orders)

    return KitchenCapacityOut(
        kitchen_id=kitchen.id,
        kitchen_name=kitchen.name,
        total_capacity=kitchen.total_capacity,
        current_orders=overload_status.current_orders,
        active_orders_preparing=preparing_count,
        available_capacity=avail,
        overload_count=overload_status.overload_count,
        status=overload_status.status
    )
