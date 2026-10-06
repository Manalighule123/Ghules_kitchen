from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Review, Order, User, Cook
from app.schemas.schemas import ReviewOut, ReviewCreate

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

def build_review_out(rev: Review, db: Session) -> ReviewOut:
    cust = db.query(User).filter(User.id == rev.customer_id).first()
    cook_name = None
    if rev.cook_id:
        cook = db.query(Cook).filter(Cook.id == rev.cook_id).first()
        if cook:
            c_user = db.query(User).filter(User.id == cook.user_id).first()
            cook_name = c_user.name if c_user else f"Cook #{cook.id}"

    return ReviewOut(
        id=rev.id,
        order_id=rev.order_id,
        customer_id=rev.customer_id,
        customer_name=cust.name if cust else f"Customer #{rev.customer_id}",
        cook_id=rev.cook_id,
        cook_name=cook_name,
        food_rating=rev.food_rating,
        cook_rating=rev.cook_rating,
        comment=rev.comment,
        created_at=rev.created_at
    )

@router.get("", response_model=List[ReviewOut])
def get_reviews(
    cook_id: Optional[int] = None,
    order_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if cook_id:
        query = query.filter(Review.cook_id == cook_id)
    if order_id:
        query = query.filter(Review.order_id == order_id)

    reviews = query.order_by(Review.created_at.desc()).all()
    return [build_review_out(r, db) for r in reviews]

@router.post("", response_model=ReviewOut)
def create_review(
    rev_in: ReviewCreate,
    customer_id: int = 4, # Demo customer ID
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == rev_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    rev = Review(
        order_id=rev_in.order_id,
        customer_id=customer_id,
        cook_id=rev_in.cook_id or order.assigned_cook_id,
        food_rating=rev_in.food_rating,
        cook_rating=rev_in.cook_rating,
        comment=rev_in.comment
    )

    db.add(rev)
    db.commit()
    db.refresh(rev)

    # Recalculate cook average rating if cook_id present
    if rev.cook_id:
        all_cook_revs = db.query(Review).filter(Review.cook_id == rev.cook_id).all()
        if all_cook_revs:
            avg_r = sum(r.cook_rating for r in all_cook_revs) / len(all_cook_revs)
            cook = db.query(Cook).filter(Cook.id == rev.cook_id).first()
            if cook:
                cook.rating = round(avg_r, 1)
                db.commit()

    return build_review_out(rev, db)
