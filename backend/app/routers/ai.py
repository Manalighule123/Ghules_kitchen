from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import PartnerConversation, Cook, User
from app.schemas.schemas import (
    CookMatchResponse, AllocationRequest, AllocationResponse,
    NLPResponseRequest, NLPResponseOut, AIAssistantRequest, AIAssistantOut,
    FoodRecognitionOut, OrderContributionCalculation, PartnerConversationOut,
    PartnerConversationSimulateRequest
)
from app.services.cook_matching import match_cooks_for_kitchen
from app.services.order_allocation import allocate_excess_orders
from app.services.nlp_service import parse_cook_nlp_response
from app.services.ai_assistant import query_ai_assistant
from app.services.ai_food_recognition import recognize_food_from_image
from app.services.profitability import calculate_order_contribution
from app.services.ai_partner_agent import process_partner_ai_conversation

router = APIRouter(prefix="/ai", tags=["AI Operations"])

@router.post("/match-cook", response_model=CookMatchResponse)
def match_cook_endpoint(kitchen_id: int, db: Session = Depends(get_db)):
    try:
        return match_cooks_for_kitchen(db, kitchen_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/allocate-orders", response_model=AllocationResponse)
async def allocate_orders_endpoint(req: AllocationRequest, db: Session = Depends(get_db)):
    try:
        return await allocate_excess_orders(db, req.kitchen_id, req.order_id, req.max_orders_to_allocate)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/parse-response", response_model=NLPResponseOut)
def parse_response_endpoint(req: NLPResponseRequest):
    return parse_cook_nlp_response(req.text)

@router.post("/assistant", response_model=AIAssistantOut)
def assistant_endpoint(req: AIAssistantRequest, db: Session = Depends(get_db)):
    return query_ai_assistant(db, req)

@router.post("/recognize-food", response_model=FoodRecognitionOut)
async def recognize_food_endpoint(file: Optional[UploadFile] = File(None)):
    fname = file.filename if file else "chapati.jpg"
    contents = await file.read() if file else None
    return recognize_food_from_image(fname, contents)

@router.get("/calculate-contribution", response_model=OrderContributionCalculation)
def calculate_contribution_endpoint(
    total_revenue: float = 500.0,
    item_count: int = 100,
    distance_km: float = 2.0,
    kitchen_internal_quantity: int = 40,
    partner_quantity: int = 60,
    db: Session = Depends(get_db)
):
    return calculate_order_contribution(
        db,
        total_revenue=total_revenue,
        item_count=item_count,
        distance_km=distance_km,
        kitchen_internal_quantity=kitchen_internal_quantity,
        partner_quantity=partner_quantity
    )

@router.post("/partner-chat", response_model=PartnerConversationOut)
def partner_chat_endpoint(req: PartnerConversationSimulateRequest, db: Session = Depends(get_db)):
    conv = process_partner_ai_conversation(
        db,
        conversation_id=req.conversation_id,
        partner_name=req.partner_name or "Applicant Cook",
        user_message=req.user_message
    )
    return conv

@router.get("/partner-conversations", response_model=List[PartnerConversationOut])
def get_partner_conversations(db: Session = Depends(get_db)):
    return db.query(PartnerConversation).order_by(PartnerConversation.updated_at.desc()).all()

@router.post("/partner-conversations/{id}/approve")
def approve_partner_conversation(id: int, db: Session = Depends(get_db)):
    conv = db.query(PartnerConversation).filter(PartnerConversation.id == id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.status = "APPROVED"

    # Check or create cook user record
    existing_user = db.query(User).filter(User.name == conv.partner_name).first()
    if not existing_user:
        import hashlib
        existing_user = User(
            name=conv.partner_name,
            email=f"{conv.partner_name.lower().replace(' ', '')}@partner.com",
            phone=conv.phone or "9876543210",
            password_hash=hashlib.sha256("cook123".encode()).hexdigest(),
            role="cook"
        )
        db.add(existing_user)
        db.commit()
        db.refresh(existing_user)

    existing_cook = db.query(Cook).filter(Cook.user_id == existing_user.id).first()
    if not existing_cook:
        new_cook = Cook(
            user_id=existing_user.id,
            location=conv.location or "Thergaon, Pune",
            specialization=conv.specialization or "Homemade Food",
            max_capacity=conv.daily_capacity or 30,
            current_capacity=conv.daily_capacity or 30,
            available=True,
            verification_status="APPROVED",
            hygiene_status="VERIFIED",
            hygiene_score=96.0
        )
        db.add(new_cook)
        db.commit()
    else:
        existing_cook.verification_status = "APPROVED"
        existing_cook.available = True
        db.commit()

    return {"message": f"Partner {conv.partner_name} approved and activated successfully!", "conversation_id": id}
