from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.models import CostConfiguration
from app.schemas.schemas import CostConfigurationOut, CostConfigurationUpdate

router = APIRouter(prefix="/settings", tags=["Business Settings"])

@router.get("", response_model=CostConfigurationOut)
def get_cost_settings(db: Session = Depends(get_db)):
    config = db.query(CostConfiguration).first()
    if not config:
        config = CostConfiguration(
            max_kitchen_capacity=100,
            partner_service_radius_km=5.0,
            min_contribution_margin_pct=25.0,
            partner_payout_rate_per_item=3.5,
            packaging_cost_per_item=3.0,
            delivery_cost_per_km=12.0,
            base_delivery_charge=30.0,
            weight_distance=0.20,
            weight_capacity=0.25,
            weight_availability=0.25,
            weight_specialization=0.15,
            weight_workload=0.15
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("", response_model=CostConfigurationOut)
def update_cost_settings(update_in: CostConfigurationUpdate, db: Session = Depends(get_db)):
    config = db.query(CostConfiguration).first()
    if not config:
        config = CostConfiguration()
        db.add(config)

    for field, val in update_in.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(config, field, val)

    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config
