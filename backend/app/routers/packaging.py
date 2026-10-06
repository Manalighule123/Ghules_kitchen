from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import PackagingInventory, Kitchen, Notification, User
from app.schemas.schemas import PackagingItemOut, PackagingItemCreate, PackagingItemUpdate

router = APIRouter(prefix="/packaging", tags=["Packaging Inventory"])

def build_packaging_out(p: PackagingInventory) -> PackagingItemOut:
    avail = max(0, p.total_quantity - p.used_quantity)
    return PackagingItemOut(
        id=p.id,
        kitchen_id=p.kitchen_id,
        item_name=p.item_name,
        total_quantity=p.total_quantity,
        used_quantity=p.used_quantity,
        available_quantity=avail,
        min_threshold=p.min_threshold,
        unit=p.unit,
        cost_per_unit=p.cost_per_unit,
        is_low_stock=avail <= p.min_threshold
    )

@router.get("", response_model=List[PackagingItemOut])
def get_packaging_inventory(kitchen_id: int = 1, db: Session = Depends(get_db)):
    items = db.query(PackagingInventory).filter(PackagingInventory.kitchen_id == kitchen_id).all()
    return [build_packaging_out(i) for i in items]

@router.post("", response_model=PackagingItemOut)
def create_packaging_item(item_in: PackagingItemCreate, db: Session = Depends(get_db)):
    item = PackagingInventory(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return build_packaging_out(item)

@router.put("/{id}", response_model=PackagingItemOut)
def update_packaging_stock(id: int, update_in: PackagingItemUpdate, db: Session = Depends(get_db)):
    item = db.query(PackagingInventory).filter(PackagingInventory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Packaging item not found")

    if update_in.add_quantity:
        item.total_quantity += update_in.add_quantity
    if update_in.used_quantity is not None:
        item.used_quantity = update_in.used_quantity
    if update_in.min_threshold is not None:
        item.min_threshold = update_in.min_threshold

    db.commit()
    db.refresh(item)

    avail = item.total_quantity - item.used_quantity
    if avail <= item.min_threshold:
        k_obj = db.query(Kitchen).filter(Kitchen.id == item.kitchen_id).first()
        if k_obj and k_obj.owner_id:
            notif = Notification(
                user_id=k_obj.owner_id,
                message=f"LOW PACKAGING ALERT: '{item.item_name}' stock is low ({avail} {item.unit} remaining). Reorder recommended.",
                type="STOCK"
            )
            db.add(notif)
            db.commit()

    return build_packaging_out(item)
