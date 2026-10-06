from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Complaint, Order, User, Cook, Notification
from app.schemas.schemas import ComplaintOut, ComplaintCreate, ComplaintResolveRequest

router = APIRouter(prefix="/complaints", tags=["Quality & Complaints"])

def build_complaint_out(c: Complaint, db: Session) -> ComplaintOut:
    cust = db.query(User).filter(User.id == c.customer_id).first()
    cook_name = None
    if c.cook_id:
        cook = db.query(Cook).filter(Cook.id == c.cook_id).first()
        if cook:
            c_user = db.query(User).filter(User.id == cook.user_id).first()
            cook_name = c_user.name if c_user else f"Cook #{c.cook_id}"

    return ComplaintOut(
        id=c.id,
        order_id=c.order_id,
        customer_id=c.customer_id,
        customer_name=cust.name if cust else f"Customer #{c.customer_id}",
        cook_id=c.cook_id,
        cook_name=cook_name,
        type=c.type,
        description=c.description,
        resolution=c.resolution,
        status=c.status,
        created_at=c.created_at
    )

@router.get("", response_model=List[ComplaintOut])
def get_complaints(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status:
        query = query.filter(Complaint.status == status)

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return [build_complaint_out(c, db) for c in complaints]

@router.post("", response_model=ComplaintOut)
def file_complaint(
    comp_in: ComplaintCreate,
    customer_id: int = 4, # Demo customer ID
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == comp_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    comp = Complaint(
        order_id=comp_in.order_id,
        customer_id=customer_id,
        cook_id=comp_in.cook_id or order.assigned_cook_id,
        type=comp_in.type.upper(),
        description=comp_in.description,
        status="OPEN"
    )

    db.add(comp)
    db.commit()
    db.refresh(comp)

    # Notify Admin of Quality Complaint
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            message=f"NEW COMPLAINT filed for Order #{order.id}: {comp.type} - {comp.description[:60]}...",
            type="COMPLAINT"
        )
        db.add(notif)
    db.commit()

    return build_complaint_out(comp, db)

@router.put("/{id}/resolve", response_model=ComplaintOut)
def resolve_complaint(
    id: int,
    resolve_in: ComplaintResolveRequest,
    db: Session = Depends(get_db)
):
    comp = db.query(Complaint).filter(Complaint.id == id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Complaint not found")

    comp.resolution = resolve_in.resolution
    comp.status = resolve_in.status.upper()
    db.commit()
    db.refresh(comp)

    # Notify Customer of Resolution
    notif = Notification(
        user_id=comp.customer_id,
        message=f"Resolution update for Complaint #{comp.id} (Order #{comp.order_id}): {comp.resolution}",
        type="STATUS_UPDATE"
    )
    db.add(notif)
    db.commit()

    return build_complaint_out(comp, db)
