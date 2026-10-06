from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.models import Order, OrderItem, MenuItem, User, Kitchen, Cook, Notification, CookAssignment
from app.schemas.schemas import OrderOut, OrderCreate, OrderStatusUpdate, OrderItemOut, CookAssignmentOut, AssignmentStatusUpdate
from app.services.overload_detection import check_kitchen_overload
from app.services.profitability import calculate_order_contribution
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/orders", tags=["Orders"])

def build_order_out(order: Order, db: Session) -> OrderOut:
    customer = db.query(User).filter(User.id == order.customer_id).first()
    kitchen = db.query(Kitchen).filter(Kitchen.id == order.kitchen_id).first()

    cook_name = None
    if order.assigned_cook_id:
        cook = db.query(Cook).filter(Cook.id == order.assigned_cook_id).first()
        if cook:
            c_user = db.query(User).filter(User.id == cook.user_id).first()
            cook_name = c_user.name if c_user else f"Cook #{cook.id}"

    items_out = []
    total_items_count = 0
    for item in order.items:
        mi = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        total_items_count += item.quantity
        items_out.append(
            OrderItemOut(
                id=item.id,
                menu_item_id=item.menu_item_id,
                item_name=mi.name if mi else "Dish Item",
                quantity=item.quantity,
                price=item.price
            )
        )

    assignments_out = []
    assignments = db.query(CookAssignment).filter(CookAssignment.order_id == order.id).all()
    for a in assignments:
        c_obj = db.query(Cook).filter(Cook.id == a.cook_id).first()
        c_user = db.query(User).filter(User.id == c_obj.user_id).first() if c_obj else None
        assignments_out.append(
            CookAssignmentOut(
                id=a.id,
                order_id=a.order_id,
                cook_id=a.cook_id,
                cook_name=c_user.name if c_user else f"Cook #{a.cook_id}",
                assigned_quantity=a.assigned_quantity,
                item_description=a.item_description,
                payout_amount=a.payout_amount,
                assigned_at=a.assigned_at,
                accepted_at=a.accepted_at,
                status=a.status,
                rejection_reason=a.rejection_reason
            )
        )

    # Compute contribution metrics if zero
    if order.estimated_contribution == 0.0:
        partner_qty = sum(a.assigned_quantity for a in assignments)
        internal_qty = max(0, total_items_count - partner_qty)
        contrib = calculate_order_contribution(
            db,
            total_revenue=order.total_amount,
            item_count=total_items_count,
            distance_km=2.0,
            kitchen_internal_quantity=internal_qty,
            partner_quantity=partner_qty
        )
        order.food_prep_cost = contrib.food_prep_cost
        order.partner_payout_cost = contrib.partner_payout
        order.packaging_cost = contrib.packaging_cost
        order.delivery_cost = contrib.delivery_cost
        order.platform_fee = contrib.platform_fee
        order.estimated_contribution = contrib.estimated_contribution
        order.contribution_margin_pct = contrib.contribution_margin_pct
        db.commit()

    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=customer.name if customer else f"Customer #{order.customer_id}",
        kitchen_id=order.kitchen_id,
        kitchen_name=kitchen.name if kitchen else f"Kitchen #{order.kitchen_id}",
        assigned_cook_id=order.assigned_cook_id,
        assigned_cook_name=cook_name,
        status=order.status,
        is_split=order.is_split or len(assignments_out) > 1,
        total_amount=order.total_amount,
        order_time=order.order_time,
        preferred_delivery_time=order.preferred_delivery_time or "7:30 PM Today",
        estimated_delivery_time=order.estimated_delivery_time,
        priority=order.priority,
        delivery_address=order.delivery_address,
        customer_notes=order.customer_notes,
        food_prep_cost=order.food_prep_cost or 0.0,
        partner_payout_cost=order.partner_payout_cost or 0.0,
        packaging_cost=order.packaging_cost or 0.0,
        delivery_cost=order.delivery_cost or 0.0,
        platform_fee=order.platform_fee or 0.0,
        estimated_contribution=order.estimated_contribution or 0.0,
        contribution_margin_pct=order.contribution_margin_pct or 0.0,
        items=items_out,
        assignments=assignments_out
    )

@router.get("", response_model=List[OrderOut])
def get_orders(
    customer_id: Optional[int] = None,
    kitchen_id: Optional[int] = None,
    assigned_cook_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if kitchen_id:
        query = query.filter(Order.kitchen_id == kitchen_id)
    if assigned_cook_id:
        # Check either direct assigned_cook_id or in CookAssignment list
        cook_assignments = db.query(CookAssignment.order_id).filter(CookAssignment.cook_id == assigned_cook_id).all()
        assigned_order_ids = [a[0] for a in cook_assignments]
        query = query.filter((Order.assigned_cook_id == assigned_cook_id) | (Order.id.in_(assigned_order_ids)))
    if status:
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.order_time.desc()).all()
    return [build_order_out(o, db) for o in orders]

@router.post("", response_model=OrderOut)
async def create_order(
    order_in: OrderCreate,
    customer_id: int = Query(4), # Default demo customer
    db: Session = Depends(get_db)
):
    kitchen = db.query(Kitchen).filter(Kitchen.id == order_in.kitchen_id).first()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen not found")

    total_amt = 0.0
    order_items_objs = []
    max_prep_time = 20
    total_quantity_needed = 0

    for item_in in order_in.items:
        mi = db.query(MenuItem).filter(MenuItem.id == item_in.menu_item_id).first()
        if not mi:
            raise HTTPException(status_code=400, detail=f"Menu item {item_in.menu_item_id} not found")
        item_total = mi.price * item_in.quantity
        total_amt += item_total
        total_quantity_needed += item_in.quantity
        max_prep_time = max(max_prep_time, mi.preparation_time)

        order_items_objs.append(
            OrderItem(
                menu_item_id=mi.id,
                quantity=item_in.quantity,
                price=mi.price
            )
        )

    overload_info = check_kitchen_overload(db, kitchen.id)
    initial_status = "PLACED"
    if overload_info.is_overloaded or total_quantity_needed > kitchen.current_capacity:
        initial_status = "OVERLOAD_DETECTED"

    est_delivery = datetime.utcnow() + timedelta(minutes=max_prep_time + 15)

    # Compute contribution metrics upfront
    contrib = calculate_order_contribution(
        db,
        total_revenue=total_amt,
        item_count=total_quantity_needed,
        distance_km=2.0,
        kitchen_internal_quantity=min(kitchen.current_capacity, total_quantity_needed),
        partner_quantity=max(0, total_quantity_needed - kitchen.current_capacity)
    )

    new_order = Order(
        customer_id=customer_id,
        kitchen_id=kitchen.id,
        status=initial_status,
        total_amount=round(total_amt, 2),
        order_time=datetime.utcnow(),
        preferred_delivery_time=order_in.preferred_delivery_time or "ASAP",
        estimated_delivery_time=est_delivery,
        priority=order_in.priority,
        delivery_address=order_in.delivery_address,
        customer_notes=order_in.customer_notes,
        food_prep_cost=contrib.food_prep_cost,
        partner_payout_cost=contrib.partner_payout,
        packaging_cost=contrib.packaging_cost,
        delivery_cost=contrib.delivery_cost,
        platform_fee=contrib.platform_fee,
        estimated_contribution=contrib.estimated_contribution,
        contribution_margin_pct=contrib.contribution_margin_pct
    )

    new_order.items = order_items_objs
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    check_kitchen_overload(db, kitchen.id)

    if kitchen.owner_id:
        n = Notification(
            user_id=kitchen.owner_id,
            message=f"New Order #{new_order.id} ({total_quantity_needed} items, ₹{new_order.total_amount}). Status: {initial_status}",
            type="ORDER"
        )
        db.add(n)
        db.commit()

    out = build_order_out(new_order, db)
    await ws_manager.broadcast_to_kitchen(kitchen.id, {
        "event": "NEW_ORDER",
        "order": out.model_dump()
    })

    return out

@router.get("/{id}", response_model=OrderOut)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return build_order_out(order, db)

@router.put("/{id}/status", response_model=OrderOut)
async def update_order_status(
    id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    new_status = status_update.status.upper()
    order.status = new_status

    db.commit()
    db.refresh(order)

    check_kitchen_overload(db, order.kitchen_id)

    notif_msg = f"Order #{order.id} status updated to {new_status}"
    db.add(Notification(user_id=order.customer_id, message=notif_msg, type="STATUS_UPDATE"))
    db.commit()

    out = build_order_out(order, db)

    await ws_manager.broadcast_to_kitchen(order.kitchen_id, {
        "event": "ORDER_STATUS_UPDATED",
        "order_id": order.id,
        "old_status": old_status,
        "new_status": new_status,
        "order": out.model_dump()
    })

    return out

@router.post("/{id}/cancel", response_model=OrderOut)
def cancel_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status in ["OUT_FOR_DELIVERY", "DELIVERED"]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled after it is out for delivery or delivered.")

    order.status = "CANCELLED"
    db.commit()
    db.refresh(order)

    # Release capacities
    assignments = db.query(CookAssignment).filter(CookAssignment.order_id == id).all()
    for a in assignments:
        a.status = "CANCELLED"
        cook = db.query(Cook).filter(Cook.id == a.cook_id).first()
        if cook:
            cook.current_capacity = min(cook.max_capacity, cook.current_capacity + a.assigned_quantity)

    db.commit()
    return build_order_out(order, db)

@router.put("/assignment/status")
def update_assignment_status(update_in: AssignmentStatusUpdate, db: Session = Depends(get_db)):
    assignment = db.query(CookAssignment).filter(CookAssignment.id == update_in.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment.status = update_in.status.upper()
    if update_in.rejection_reason:
        assignment.rejection_reason = update_in.rejection_reason

    if update_in.status.upper() == "ACCEPTED":
        assignment.accepted_at = datetime.utcnow()
    elif update_in.status.upper() == "COMPLETED":
        cook = db.query(Cook).filter(Cook.id == assignment.cook_id).first()
        if cook:
            cook.total_earnings = round((cook.total_earnings or 0.0) + (assignment.payout_amount or 0.0), 2)
    elif update_in.status.upper() == "REJECTED":
        # Re-release capacity back to cook if rejected
        cook = db.query(Cook).filter(Cook.id == assignment.cook_id).first()
        if cook:
            cook.current_capacity = min(cook.max_capacity, cook.current_capacity + assignment.assigned_quantity)

    db.commit()
    return {"message": f"Assignment #{assignment.id} updated to {assignment.status}"}
