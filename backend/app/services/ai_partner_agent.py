import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import PartnerConversation, AIConversationMessage, Notification, User

ESCALATION_KEYWORDS = [
    "negotiate", "higher pay", "custom rate", "complaint", "legal", "safety",
    "fssai license issue", "dispute", "payment problem", "special terms", "urgent"
]

def process_partner_ai_conversation(
    db: Session,
    conversation_id: int = None,
    partner_name: str = "Applicant Cook",
    user_message: str = ""
) -> PartnerConversation:
    """
    Manages conversational onboarding for prospective home-cook partners.
    Collects contact info, location, capacity, specialization, and availability.
    Flags & escalates to Admin if user requests special terms or raises complaints.
    """
    # Find existing or create new conversation
    conv = None
    if conversation_id:
        conv = db.query(PartnerConversation).filter(PartnerConversation.id == conversation_id).first()

    if not conv:
        conv = PartnerConversation(
            partner_name=partner_name,
            status="AI_HANDLING",
            ai_summary="New home-cook partner inquiry received via AI onboarding agent.",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

        # Initial Welcome Message from AI
        welcome_msg = AIConversationMessage(
            conversation_id=conv.id,
            sender="AI",
            message_text=f"Namaste {partner_name}! Thank you for your interest in joining Ghule's Kitchen as a verified home-cook partner. I am the AI Kitchen Onboarding Assistant. May I know your primary cooking location (area/pincode), daily roti/meal capacity, and food specializations?",
            timestamp=datetime.utcnow()
        )
        db.add(welcome_msg)
        db.commit()

    if not user_message:
        return conv

    # Save user message
    user_msg_obj = AIConversationMessage(
        conversation_id=conv.id,
        sender="PARTNER",
        message_text=user_message,
        timestamp=datetime.utcnow()
    )
    db.add(user_msg_obj)

    # Check for Escalation Triggers
    user_msg_lower = user_message.lower()
    requires_escalation = any(kw in user_msg_lower for kw in ESCALATION_KEYWORDS)

    ai_reply = ""

    if requires_escalation:
        conv.status = "ESCALATED_ADMIN_REQUIRED"
        conv.ai_summary += f" | Escalated to Admin due to keyword query: '{user_message}'"
        ai_reply = f"Thank you for sharing that. Because your inquiry involves special custom terms or operational review, I have flagged this directly to the Ghule's Kitchen Founder & Admin. They will review your notes and reach out shortly."

        # Notify Admin
        admin_users = db.query(User).filter(User.role == "admin").all()
        for admin in admin_users:
            notif = Notification(
                user_id=admin.id,
                message=f"AI Agent Escalation: Partner application #{conv.id} ({partner_name}) requires Admin review.",
                type="SYSTEM"
            )
            db.add(notif)
    else:
        # Standard Onboarding AI Flow
        if "thergaon" in user_msg_lower or "wakad" in user_msg_lower or "pimple" in user_msg_lower or "pune" in user_msg_lower:
            conv.location = user_message[:100]
            ai_reply = "Got it! That is within our active hyperlocal service zone in Pune. What is your maximum daily preparation capacity (e.g. 30 rotis per day) and preferred working hours?"
        elif "roti" in user_msg_lower or "chapati" in user_msg_lower or "thali" in user_msg_lower or "capacity" in user_msg_lower or any(char.isdigit() for char in user_message):
            conv.specialization = "Homemade Indian Meals & Rotis"
            conv.daily_capacity = 30
            ai_reply = "Thank you! Here is how the Ghule's Kitchen Partner model works:\n1. Orders excess of internal capacity are allocated nearby.\n2. You receive per-order payouts automatically.\n3. Hygiene & quality checks are verified by Admin.\nWould you like me to submit your application for final Admin verification?"
        else:
            ai_reply = "Thank you! I have recorded your details. Our platform will match excess local orders to your kitchen whenever demand surges. Our founder will complete your hygiene checklist and activate your partner account."

        conv.ai_summary = f"Location: {conv.location or 'Under review'}, Specialization: {conv.specialization or 'Homemade food'}, Daily Capacity: {conv.daily_capacity} units. Status: Ready for verification."

    # Save AI response
    ai_msg_obj = AIConversationMessage(
        conversation_id=conv.id,
        sender="AI",
        message_text=ai_reply,
        timestamp=datetime.utcnow()
    )
    db.add(ai_msg_obj)
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)

    return conv
