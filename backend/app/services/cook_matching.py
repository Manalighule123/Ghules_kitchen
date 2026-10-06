import math
from typing import List
from sqlalchemy.orm import Session
from app.models.models import Kitchen, Cook, User, CostConfiguration
from app.schemas.schemas import CookMatchResponse, CookMatchItem
from app.services.overload_detection import check_kitchen_overload

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km."""
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def match_cooks_for_kitchen(db: Session, kitchen_id: int) -> CookMatchResponse:
    kitchen = db.query(Kitchen).filter(Kitchen.id == kitchen_id).first()
    if not kitchen:
        raise ValueError(f"Kitchen with ID {kitchen_id} not found")

    # Fetch configurable matching weights if available
    cost_config = db.query(CostConfiguration).first()
    w_dist = cost_config.weight_distance if cost_config else 0.20
    w_cap = cost_config.weight_capacity if cost_config else 0.25
    w_avail = cost_config.weight_availability if cost_config else 0.25
    w_spec = cost_config.weight_specialization if cost_config else 0.15
    w_work = cost_config.weight_workload if cost_config else 0.15

    overload_info = check_kitchen_overload(db, kitchen_id)
    overload_count = overload_info.overload_count

    # Retrieve all cooks
    cooks = db.query(Cook).all()
    matched_cooks: List[CookMatchItem] = []

    for cook in cooks:
        user = db.query(User).filter(User.id == cook.user_id).first()
        cook_name = user.name if user else f"Cook #{cook.id}"

        dist_km = calculate_distance_km(
            kitchen.latitude, kitchen.longitude,
            cook.latitude, cook.longitude
        )

        # 1. Availability Score
        avail_score = 1.0 if (cook.available and cook.current_capacity > 0 and cook.verification_status == "APPROVED") else 0.0

        # 2. Capacity Score
        target_cap = max(1, overload_count if overload_count > 0 else 30)
        cap_score = min(1.0, cook.current_capacity / target_cap)

        # 3. Distance Score (relative to service radius)
        max_rad = cook.service_radius_km or 5.0
        dist_score = max(0.0, 1.0 - (dist_km / max_rad)) if dist_km <= max_rad else max(0.0, 1.0 - (dist_km / 10.0)) * 0.5

        # 4. Specialization Score
        spec_score = 0.7
        if cook.specialization and any(kw in cook.specialization.lower() for kw in ["roti", "bread", "thali", "chapati", "indian"]):
            spec_score = 1.0

        # 5. Workload Score (higher remaining capacity ratio = less workload)
        workload_ratio = cook.current_capacity / max(1, cook.max_capacity)

        # Weighted Matching Score calculation
        total_score = (
            (avail_score * w_avail) +
            (cap_score * w_cap) +
            (dist_score * w_dist) +
            (spec_score * w_spec) +
            (workload_ratio * w_work)
        )

        reasons = []
        if cook.verification_status != "APPROVED":
            reasons.append(f"Verification status: {cook.verification_status}")
        elif cook.available and cook.current_capacity > 0:
            reasons.append("Verified & Available Now")
        else:
            reasons.append("Currently Offline / At Capacity")

        reasons.append(f"{dist_km} km away ({cook.location})")
        reasons.append(f"Available Capacity: {cook.current_capacity} units (Max: {cook.max_capacity})")
        if cook.specialization:
            reasons.append(f"Specialization: {cook.specialization}")

        reasons.append(f"Hygiene Score: {cook.hygiene_score}% ({cook.hygiene_status})")

        matched_cooks.append(
            CookMatchItem(
                cook_id=cook.id,
                cook_name=cook_name,
                location=cook.location,
                distance_km=dist_km,
                max_capacity=cook.max_capacity,
                available_capacity=cook.current_capacity,
                available=cook.available and cook.verification_status == "APPROVED",
                verification_status=cook.verification_status,
                specialization=cook.specialization or "Home Cook",
                cuisine_types=cook.cuisine_types or "General",
                score=round(total_score, 2),
                matching_breakdown={
                    "distance_score": round(dist_score, 2),
                    "capacity_score": round(cap_score, 2),
                    "availability_score": round(avail_score, 2),
                    "specialization_score": round(spec_score, 2),
                    "workload_score": round(workload_ratio, 2)
                },
                reasons=reasons
            )
        )

    # Sort descending by matching score
    matched_cooks.sort(key=lambda c: c.score, reverse=True)

    return CookMatchResponse(
        kitchen_id=kitchen.id,
        kitchen_name=kitchen.name,
        overload_count=overload_count,
        recommended_cooks=matched_cooks
    )
