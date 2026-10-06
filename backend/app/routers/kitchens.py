from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Kitchen, Cook, MenuItem
from app.schemas.schemas import (
    KitchenOut, KitchenCreate, KitchenCapacityOut, OverloadStatusOut, CookMatchItem, MenuItemOut, MenuItemCreate
)
from app.services.overload_detection import get_kitchen_capacity_details, check_kitchen_overload
from app.services.cook_matching import match_cooks_for_kitchen

router = APIRouter(prefix="/kitchens", tags=["Kitchens"])

@router.get("", response_model=List[KitchenOut])
def get_kitchens(db: Session = Depends(get_db)):
    kitchens = db.query(Kitchen).all()
    for k in kitchens:
        check_kitchen_overload(db, k.id)
    return db.query(Kitchen).all()

@router.post("", response_model=KitchenOut)
def create_kitchen(kitchen_in: KitchenCreate, db: Session = Depends(get_db)):
    kitchen = Kitchen(**kitchen_in.model_dump())
    db.add(kitchen)
    db.commit()
    db.refresh(kitchen)
    return kitchen

@router.get("/{id}/capacity", response_model=KitchenCapacityOut)
def get_capacity(id: int, db: Session = Depends(get_db)):
    try:
        return get_kitchen_capacity_details(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{id}/overload", response_model=OverloadStatusOut)
def get_overload(id: int, db: Session = Depends(get_db)):
    try:
        return check_kitchen_overload(db, id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{id}/available-cooks", response_model=List[CookMatchItem])
def get_available_cooks_for_kitchen(id: int, db: Session = Depends(get_db)):
    try:
        match_result = match_cooks_for_kitchen(db, id)
        return match_result.recommended_cooks
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{id}/menu", response_model=List[MenuItemOut])
def get_kitchen_menu(id: int, db: Session = Depends(get_db)):
    return db.query(MenuItem).filter(MenuItem.kitchen_id == id).all()

@router.post("/{id}/menu", response_model=MenuItemOut)
def add_menu_item(id: int, item_in: MenuItemCreate, db: Session = Depends(get_db)):
    kitchen = db.query(Kitchen).filter(Kitchen.id == id).first()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen not found")
    
    item = MenuItem(
        kitchen_id=id,
        name=item_in.name,
        description=item_in.description,
        price=item_in.price,
        category=item_in.category or "Indian Bread",
        cuisine=item_in.cuisine or "Indian",
        preparation_time=item_in.preparation_time or 20,
        image_url=item_in.image_url,
        unit_name=item_in.unit_name or "pcs"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted successfully"}

@router.get("/{id}", response_model=KitchenOut)
def get_kitchen(id: int, db: Session = Depends(get_db)):
    kitchen = db.query(Kitchen).filter(Kitchen.id == id).first()
    if not kitchen:
        raise HTTPException(status_code=404, detail="Kitchen not found")
    check_kitchen_overload(db, kitchen.id)
    db.refresh(kitchen)
    return kitchen
