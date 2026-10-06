from sqlalchemy.orm import Session
from app.models.models import Order, CostConfiguration
from app.schemas.schemas import OrderContributionCalculation

def calculate_order_contribution(
    db: Session,
    total_revenue: float,
    item_count: int = 1,
    distance_km: float = 2.0,
    kitchen_internal_quantity: int = 0,
    partner_quantity: int = 0
) -> OrderContributionCalculation:
    """
    Calculates expected contribution & profit margin for an order:
    Revenue - Food Prep Cost - Partner Payout - Packaging Cost - Delivery Cost - Platform Fee = Estimated Contribution
    """
    cost_config = db.query(CostConfiguration).first()

    partner_rate = cost_config.partner_payout_rate_per_item if cost_config else 3.5
    pkg_cost_per_item = cost_config.packaging_cost_per_item if cost_config else 3.0
    del_cost_per_km = cost_config.delivery_cost_per_km if cost_config else 12.0
    base_del_charge = cost_config.base_delivery_charge if cost_config else 30.0
    target_margin_pct = cost_config.min_contribution_margin_pct if cost_config else 25.0

    # Food Prep Cost (raw materials for internally cooked portion)
    food_prep_cost = round(kitchen_internal_quantity * 2.5, 2)

    # Partner Payout Cost (paid to external home cooks for their portion)
    partner_payout = round(partner_quantity * partner_rate, 2)

    # Packaging Cost
    packaging_cost = round(item_count * pkg_cost_per_item, 2)

    # Delivery Cost
    delivery_cost = round(base_del_charge + (distance_km * del_cost_per_km), 2)

    # Platform & Payment Charges (~3% of revenue)
    platform_fee = round(total_revenue * 0.03, 2)

    # Total Costs
    total_estimated_cost = round(food_prep_cost + partner_payout + packaging_cost + delivery_cost + platform_fee, 2)

    # Estimated Contribution
    estimated_contribution = round(total_revenue - total_estimated_cost, 2)

    # Contribution Margin %
    contribution_margin_pct = round((estimated_contribution / total_revenue) * 100.0, 1) if total_revenue > 0 else 0.0

    # Operational Recommendation
    if contribution_margin_pct >= target_margin_pct:
        recommendation = "HIGHLY PROFITABLE: Proceed with allocation. Margins exceed target threshold."
    elif contribution_margin_pct >= 10.0:
        recommendation = "MODERATE MARGIN: Acceptable operational contribution. Consider bundling delivery."
    else:
        recommendation = "LOW MARGIN WARNING: Estimated contribution below target threshold. Review partner rates or delivery distance."

    return OrderContributionCalculation(
        total_revenue=total_revenue,
        item_count=item_count,
        distance_km=distance_km,
        kitchen_internal_quantity=kitchen_internal_quantity,
        partner_quantity=partner_quantity,
        food_prep_cost=food_prep_cost,
        partner_payout=partner_payout,
        packaging_cost=packaging_cost,
        delivery_cost=delivery_cost,
        platform_fee=platform_fee,
        total_estimated_cost=total_estimated_cost,
        estimated_contribution=estimated_contribution,
        contribution_margin_pct=contribution_margin_pct,
        recommendation=recommendation
    )
