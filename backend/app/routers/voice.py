from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Cook, User, Notification
from app.schemas.schemas import VoiceSimulateRequest, VoiceSimulateOut
from app.services.nlp_service import parse_cook_nlp_response
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/voice", tags=["Voice Simulation Agent"])

@router.post("/simulate", response_model=VoiceSimulateOut)
async def simulate_voice_agent_call(req: VoiceSimulateRequest, db: Session = Depends(get_db)):
    cook = db.query(Cook).filter(Cook.id == req.cook_id).first()
    if not cook:
        raise HTTPException(status_code=404, detail="Cook profile not found")

    user = db.query(User).filter(User.id == cook.user_id).first()
    cook_name = user.name if user else f"Cook #{cook.id}"

    ai_question = (
        f"Hello {cook_name}, this is Ghules Kitchen AI Dispatch! We have an order demand spike. "
        f"Are you available to prepare extra home meals today?"
    )

    # 1. NLP Parse Response
    nlp_result = parse_cook_nlp_response(req.incoming_text)

    # 2. Update cook availability and capacity in DB
    cook.available = nlp_result.available
    if nlp_result.available:
        cook.current_capacity = nlp_result.capacity if nlp_result.capacity > 0 else cook.max_capacity
    else:
        cook.current_capacity = 0

    db.commit()
    db.refresh(cook)

    # 3. Create Notification for Cook
    db.add(Notification(
        user_id=cook.user_id,
        message=f"Voice AI Interactive Session Completed. Updated status: {'Available' if cook.available else 'Offline'} ({cook.current_capacity} meals capacity)",
        type="SYSTEM"
    ))
    db.commit()

    # 4. Notify Kitchen via WebSocket
    status_msg = f"Cook {cook_name} responded: '{req.incoming_text}'. Status updated to {'Available' if cook.available else 'Offline'} ({cook.current_capacity} meals capacity)."
    
    await ws_manager.broadcast_global({
        "event": "VOICE_AGENT_UPDATED",
        "cook_id": cook.id,
        "cook_name": cook_name,
        "available": cook.available,
        "capacity": cook.current_capacity,
        "notes": status_msg
    })

    return VoiceSimulateOut(
        cook_id=cook.id,
        ai_question=ai_question,
        cook_response=req.incoming_text,
        nlp_result=nlp_result,
        updated_cook_capacity=cook.current_capacity,
        updated_availability=cook.available,
        status_message=status_msg
    )
