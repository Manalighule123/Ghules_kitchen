from datetime import datetime
from typing import List
from sqlalchemy.orm import Session
from app.models.models import Kitchen, Cook, Order, OrderItem, CookAssignment, Notification, User, CostConfiguration
from app.schemas.schemas import AllocationResponse, AllocationItem
from app.services.overload_detection import check_kitchen_overload
from app.services.cook_matching import match_cooks_for_kitchen
from app.websocket.manager import ws_manager

async def allocate_excess_orders(
    db: Session,
    kitchen_id: int,
    order_id: int = None,
    max_orders_to_allocate: int = None
) -> AllocationResponse:
    kitchen = db.query(Kitchen).filter(Kitchen.id == kitchen_id).first()
    if not kitchen:
        raise ValueError(f"Kitchen with ID {kitchen_id} not found")

    cost_config = db.query(CostConfiguration).first()
    payout_rate = cost_config.partner_payout_rate_per_item if cost_config else 3.5

    # Fetch orders that require distribution
    query = db.query(Order).filter(Order.kitchen_id == kitchen_id)
    if order_id:
        query = query.filter(Order.id == order_id)
    else:
        query = query.filter(Order.status.in_(["PLACED", "CONFIRMED", "OVERLOAD_DETECTED", "SEARCHING_COOK"]))
    
    excess_orders = query.order_by(Order.order_time.asc()).all()

    if max_orders_to_allocate and max_orders_to_allocate > 0:
        excess_orders = excess_orders[:max_orders_to_allocate]

    if not excess_orders:
        return AllocationResponse(
            kitchen_id=kitchen.id,
            total_overload=0,
            allocated_count=0,
            remaining_overload=0,
            assignments=[],
            message="No orders require external distribution at this time."
        )

    # Get ranked eligible cooks (must be APPROVED, available, with capacity > 0)
    matched_data = match_cooks_for_kitchen(db, kitchen_id)
    eligible_cooks = [c for c in matched_data.recommended_cooks if c.available and c.available_capacity > 0 and c.verification_status == "APPROVED"]

    if not eligible_cooks:
        return AllocationResponse(
            kitchen_id=kitchen.id,
            total_overload=len(excess_orders),
            allocated_count=0,
            remaining_overload=len(excess_orders),
            assignments=[],
            message="No verified, available home cooks found nearby with capacity."
        )

    assignments_created: List[AllocationItem] = []
    total_assigned_items = 0

    for order in excess_orders:
        # Calculate total quantity of items in this order
        total_quantity_needed = sum(item.quantity for item in order.items) if order.items else 1
        item_desc = ", ".join([f"{item.quantity}x {item.menu_item.name if item.menu_item else 'Item'}" for item in order.items]) if order.items else "Food items"

        # Check if internal Ghule's Kitchen can handle part or all of it
        kitchen_can_take = min(kitchen.current_capacity, total_quantity_needed)
        remaining_needed = total_quantity_needed - kitchen_can_take

        if kitchen_can_take > 0:
            kitchen.current_capacity -= kitchen_can_take

        # If remaining quantity is > 0, allocate across eligible cooks dynamically (ORDER SPLITTING)
        cook_idx = 0
        allocated_to_cooks = 0

        while remaining_needed > 0 and cook_idx < len(eligible_cooks):
            cook_candidate = eligible_cooks[cook_idx]
            cook_db = db.query(Cook).filter(Cook.id == cook_candidate.cook_id).first()

            if not cook_db or not cook_db.available or cook_db.current_capacity <= 0 or cook_db.verification_status != "APPROVED":
                cook_idx += 1
                continue

            # How much can this cook take?
            quantity_for_this_cook = min(remaining_needed, cook_db.current_capacity)

            if quantity_for_this_cook > 0:
                payout = quantity_for_this_cook * (cook_db.payout_rate_per_unit or payout_rate)
                
                # Create split CookAssignment record
                assignment = CookAssignment(
                    order_id=order.id,
                    cook_id=cook_db.id,
                    assigned_quantity=quantity_for_this_cook,
                    item_description=f"{quantity_for_this_cook} units of {item_desc}",
                    payout_amount=payout,
                    assigned_at=datetime.utcnow(),
                    status="ASSIGNED"
                )
                db.add(assignment)

                # Update cook capacity & stats
                cook_db.current_capacity -= quantity_for_this_cook
                remaining_needed -= quantity_for_this_cook
                allocated_to_cooks += quantity_for_this_cook
                total_assigned_items += quantity_for_this_cook

                # Notify Cook
                cook_user = db.query(User).filter(User.id == cook_db.user_id).first()
                if cook_user:
                    notif = Notification(
                        user_id=cook_user.id,
                        message=f"New Order #{order.id} assignment: Prepare {quantity_for_this_cook} units. Payout: ₹{payout}",
                        type="ASSIGNMENT"
                    )
                    db.add(notif)

                assignments_created.append(
                    AllocationItem(
                        order_id=order.id,
                        cook_id=cook_db.id,
                        cook_name=cook_candidate.cook_name,
                        assigned_quantity=quantity_for_this_cook,
                        status="COOK_ASSIGNED",
                        payout_amount=payout
                    )
                )

            # Move to next cook if this cook reached full capacity
            if cook_db.current_capacity <= 0:
                cook_idx += 1

        # Update order status & metadata
        if allocated_to_cooks > 0:
            order.assigned_cook_id = assignments_created[-1].cook_id if len(assignments_created) == 1 else None
            order.is_split = len(assignments_created) > 1 or kitchen_can_take > 0
            order.status = "COOK_ASSIGNED"
            order.partner_payout_cost = sum(a.payout_amount for a in assignments_created if a.order_id == order.id)

        db.commit()

    # Create Notification for Kitchen Admin
    if kitchen.owner_id:
        k_notif = Notification(
            user_id=kitchen.owner_id,
            message=f"Smart Order Distribution Complete: Allocated orders across partner cooks.",
            type="OVERLOAD"
        )
        db.add(k_notif)
        db.commit()

    # Emit WebSocket event
    event_data = {
        "event": "ORDERS_ALLOCATED",
        "kitchen_id": kitchen_id,
        "allocated_count": len(assignments_created),
        "assignments": [a.model_dump() for a in assignments_created]
    }
    await ws_manager.broadcast_to_kitchen(kitchen_id, event_data)

    return AllocationResponse(
        kitchen_id=kitchen.id,
        total_overload=len(excess_orders),
        allocated_count=len(assignments_created),
        remaining_overload=0 if remaining_needed == 0 else 1,
        assignments=assignments_created,
        message=f"Successfully distributed order workload across Ghule's Kitchen and {len(set(a.cook_id for a in assignments_created))} nearby home cook partner(s)."
    )
