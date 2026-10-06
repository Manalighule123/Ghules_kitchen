from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Cook, User, Order, MenuItem, CookAssignment
from app.schemas.schemas import CookOut, CookCreate, CookAvailabilityUpdate, CookVerificationUpdate, OrderOut, OrderItemOut, CookAssignmentOut, CookBase

router = APIRouter(prefix="/cooks", tags=["Cooks"])

def build_cook_out(cook: Cook, db: Session) -> CookOut:
    user = db.query(User).filter(User.id == cook.user_id).first()
    return CookOut(
        id=cook.id,
        user_id=cook.user_id,
        name=user.name if user else f"Cook #{cook.id}",
        phone=user.phone if user else None,
        email=user.email if user else None,
        location=cook.location,
        pincode=cook.pincode,
        latitude=cook.latitude,
        longitude=cook.longitude,
        service_radius_km=cook.service_radius_km or 5.0,
        service_areas=cook.service_areas,
        specialization=cook.specialization,
        max_capacity=cook.max_capacity,
        current_capacity=cook.current_capacity,
        available=cook.available,
        cuisine_types=cook.cuisine_types,
        working_hours=cook.working_hours,
        available_days=cook.available_days,
        payout_rate_per_unit=cook.payout_rate_per_unit or 4.0,
        rating=cook.rating,
        verification_status=cook.verification_status or "APPROVED",
        hygiene_status=cook.hygiene_status or "VERIFIED",
        hygiene_score=cook.hygiene_score or 95.0,
        total_earnings=cook.total_earnings or 0.0
    )

@router.get("", response_model=List[CookOut])
def get_cooks(db: Session = Depends(get_db)):
    cooks = db.query(Cook).all()
    return [build_cook_out(c, db) for c in cooks]

@router.post("", response_model=CookOut)
def create_cook(cook_in: CookCreate, db: Session = Depends(get_db)):
    cook = Cook(**cook_in.model_dump())
    cook.verification_status = "PENDING"
    cook.hygiene_status = "PENDING_CHECK"
    db.add(cook)
    db.commit()
    db.refresh(cook)
    return build_cook_out(cook, db)

@router.get("/{id}", response_model=CookOut)
def get_cook(id: int, db: Session = Depends(get_db)):
    cook = db.query(Cook).filter(Cook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")
    return build_cook_out(cook, db)

@router.put("/{id}/profile", response_model=CookOut)
def update_cook_profile(id: int, profile_in: CookBase, db: Session = Depends(get_db)):
    cook = db.query(Cook).filter(Cook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")

    cook.location = profile_in.location
    if profile_in.pincode: cook.pincode = profile_in.pincode
    if profile_in.service_radius_km: cook.service_radius_km = profile_in.service_radius_km
    if profile_in.service_areas: cook.service_areas = profile_in.service_areas
    if profile_in.specialization: cook.specialization = profile_in.specialization
    if profile_in.max_capacity:
        cook.max_capacity = profile_in.max_capacity
        if cook.current_capacity > cook.max_capacity:
            cook.current_capacity = cook.max_capacity
    if profile_in.cuisine_types: cook.cuisine_types = profile_in.cuisine_types
    if profile_in.working_hours: cook.working_hours = profile_in.working_hours
    if profile_in.available_days: cook.available_days = profile_in.available_days
    if profile_in.payout_rate_per_unit: cook.payout_rate_per_unit = profile_in.payout_rate_per_unit

    db.commit()
    db.refresh(cook)
    return build_cook_out(cook, db)

@router.put("/{id}/availability", response_model=CookOut)
def update_availability(id: int, update_data: CookAvailabilityUpdate, db: Session = Depends(get_db)):
    cook = db.query(Cook).filter(Cook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")

    if update_data.available is not None:
        cook.available = update_data.available
        if not update_data.available:
            cook.current_capacity = 0
        elif cook.current_capacity == 0:
            cook.current_capacity = cook.max_capacity

    if update_data.max_capacity is not None:
        cook.max_capacity = update_data.max_capacity

    if update_data.current_capacity is not None:
        cook.current_capacity = max(0, min(cook.max_capacity, update_data.current_capacity))
        if cook.current_capacity > 0:
            cook.available = True

    db.commit()
    db.refresh(cook)
    return build_cook_out(cook, db)

@router.put("/{id}/verify", response_model=CookOut)
def verify_cook(id: int, update_data: CookVerificationUpdate, db: Session = Depends(get_db)):
    cook = db.query(Cook).filter(Cook.id == id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook not found")

    cook.verification_status = update_data.verification_status
    if update_data.hygiene_status:
        cook.hygiene_status = update_data.hygiene_status
    if update_data.hygiene_score is not None:
        cook.hygiene_score = update_data.hygiene_score

    if update_data.verification_status == "APPROVED":
        cook.available = True
        if cook.current_capacity <= 0:
            cook.current_capacity = cook.max_capacity

    db.commit()
    db.refresh(cook)
    return build_cook_out(cook, db)

@router.get("/{id}/assignments", response_model=List[CookAssignmentOut])
def get_cook_assignments(id: int, db: Session = Depends(get_db)):
    assignments = db.query(CookAssignment).filter(CookAssignment.cook_id == id).order_by(CookAssignment.assigned_at.desc()).all()
    out = []
    for a in assignments:
        out.append(
            CookAssignmentOut(
                id=a.id,
                order_id=a.order_id,
                cook_id=a.cook_id,
                assigned_quantity=a.assigned_quantity,
                item_description=a.item_description,
                payout_amount=a.payout_amount,
                assigned_at=a.assigned_at,
                accepted_at=a.accepted_at,
                status=a.status,
                rejection_reason=a.rejection_reason
            )
        )
    return out
