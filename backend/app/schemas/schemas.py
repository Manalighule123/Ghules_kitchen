from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- KITCHEN SCHEMAS ---
class KitchenBase(BaseModel):
    name: str
    location: str
    pincode: Optional[str] = "411033"
    latitude: float = 18.5987
    longitude: float = 73.7749
    total_capacity: int = 100

class KitchenCreate(KitchenBase):
    owner_id: int

class KitchenOut(KitchenBase):
    id: int
    owner_id: int
    current_capacity: int
    status: str
    model_config = ConfigDict(from_attributes=True)

class KitchenCapacityOut(BaseModel):
    kitchen_id: int
    kitchen_name: str
    total_capacity: int
    used_capacity: int
    current_orders: int
    available_capacity: int
    overload_count: int
    extra_capacity_required: int
    available_nearby_partners: int
    status: str

class OverloadStatusOut(BaseModel):
    kitchen_id: int
    kitchen_name: str
    total_capacity: int
    current_orders: int
    overload_count: int
    status: str
    is_overloaded: bool

# --- COOK SCHEMAS ---
class CookBase(BaseModel):
    location: str
    pincode: Optional[str] = "411033"
    latitude: float = 18.5987
    longitude: float = 73.7749
    service_radius_km: float = 5.0
    service_areas: Optional[str] = "Thergaon, Wakad, Pimple Saudagar"
    specialization: Optional[str] = "Indian Breads, Rotis, Thalis"
    max_capacity: int = 30
    cuisine_types: str = "Maharashtrian, North Indian"
    working_hours: Optional[str] = "09:00 AM - 09:00 PM"
    available_days: Optional[str] = "Mon-Sun"
    payout_rate_per_unit: Optional[float] = 4.0

class CookCreate(CookBase):
    user_id: int

class CookOut(CookBase):
    id: int
    user_id: int
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    current_capacity: int
    available: bool
    rating: float
    verification_status: str
    hygiene_status: str
    hygiene_score: float
    total_earnings: float
    model_config = ConfigDict(from_attributes=True)

class CookAvailabilityUpdate(BaseModel):
    available: Optional[bool] = None
    current_capacity: Optional[int] = None
    max_capacity: Optional[int] = None

class CookVerificationUpdate(BaseModel):
    verification_status: str # APPROVED, REJECTED, UNDER_REVIEW
    hygiene_status: Optional[str] = None
    hygiene_score: Optional[float] = None

# --- MENU ITEM SCHEMAS ---
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str = "Indian Bread"
    cuisine: str = "Indian"
    preparation_time: int = 20
    image_url: Optional[str] = None
    unit_name: str = "pcs"

class MenuItemCreate(MenuItemBase):
    kitchen_id: int

class MenuItemOut(MenuItemBase):
    id: int
    kitchen_id: int
    model_config = ConfigDict(from_attributes=True)

# --- ASSIGNMENT SCHEMAS ---
class CookAssignmentOut(BaseModel):
    id: int
    order_id: int
    cook_id: int
    cook_name: Optional[str] = None
    assigned_quantity: int
    item_description: str
    payout_amount: float
    assigned_at: datetime
    accepted_at: Optional[datetime] = None
    status: str
    rejection_reason: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- ORDER SCHEMAS ---
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    item_name: Optional[str] = None
    quantity: int
    price: float
    model_config = ConfigDict(from_attributes=True)

class OrderCreate(BaseModel):
    kitchen_id: int
    items: List[OrderItemCreate]
    delivery_address: str
    preferred_delivery_time: Optional[str] = "ASAP"
    priority: str = "NORMAL"
    customer_notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str

class AssignmentStatusUpdate(BaseModel):
    assignment_id: int
    status: str # ACCEPTED, REJECTED, PREPARING, READY, COMPLETED
    rejection_reason: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    kitchen_id: int
    kitchen_name: Optional[str] = None
    assigned_cook_id: Optional[int] = None
    assigned_cook_name: Optional[str] = None
    status: str
    is_split: bool
    total_amount: float
    order_time: datetime
    preferred_delivery_time: Optional[str] = None
    estimated_delivery_time: Optional[datetime] = None
    priority: str
    delivery_address: Optional[str] = None
    customer_notes: Optional[str] = None

    # Contribution calculation metrics
    food_prep_cost: float = 0.0
    partner_payout_cost: float = 0.0
    packaging_cost: float = 0.0
    delivery_cost: float = 0.0
    platform_fee: float = 0.0
    estimated_contribution: float = 0.0
    contribution_margin_pct: float = 0.0

    items: List[OrderItemOut] = []
    assignments: List[CookAssignmentOut] = []
    model_config = ConfigDict(from_attributes=True)

# --- FINANCIAL CONTRIBUTION SCHEMAS ---
class OrderContributionCalculation(BaseModel):
    order_id: Optional[int] = None
    total_revenue: float
    item_count: int
    distance_km: float
    kitchen_internal_quantity: int
    partner_quantity: int

    # Calculated breakdown
    food_prep_cost: float
    partner_payout: float
    packaging_cost: float
    delivery_cost: float
    platform_fee: float
    total_estimated_cost: float
    estimated_contribution: float
    contribution_margin_pct: float
    recommendation: str

# --- AI & MATCHING SCHEMAS ---
class CookMatchItem(BaseModel):
    cook_id: int
    cook_name: str
    location: str
    distance_km: float
    max_capacity: int
    available_capacity: int
    available: bool
    verification_status: str
    specialization: str
    cuisine_types: str
    score: float
    matching_breakdown: dict
    reasons: List[str]

class CookMatchResponse(BaseModel):
    kitchen_id: int
    kitchen_name: str
    overload_count: int
    recommended_cooks: List[CookMatchItem]

class AllocationRequest(BaseModel):
    kitchen_id: int
    order_id: Optional[int] = None
    max_orders_to_allocate: Optional[int] = None

class AllocationItem(BaseModel):
    order_id: int
    cook_id: int
    cook_name: str
    assigned_quantity: int
    status: str
    payout_amount: float

class AllocationResponse(BaseModel):
    kitchen_id: int
    total_overload: int
    allocated_count: int
    remaining_overload: int
    assignments: List[AllocationItem]
    contribution_summary: Optional[dict] = None
    message: str

class AIConversationMessageCreate(BaseModel):
    conversation_id: int
    sender: str # PARTNER, AI, ADMIN
    message_text: str

class AIConversationMessageOut(BaseModel):
    id: int
    conversation_id: int
    sender: str
    message_text: str
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class PartnerConversationOut(BaseModel):
    id: int
    partner_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    specialization: Optional[str] = None
    daily_capacity: int
    status: str
    ai_summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[AIConversationMessageOut] = []
    model_config = ConfigDict(from_attributes=True)

class PartnerConversationSimulateRequest(BaseModel):
    conversation_id: Optional[int] = None
    partner_name: Optional[str] = "Home Cook Applicant"
    user_message: str

# --- REVIEWS & COMPLAINTS SCHEMAS ---
class ReviewCreate(BaseModel):
    order_id: int
    cook_id: Optional[int] = None
    food_rating: float
    cook_rating: float
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    order_id: int
    customer_id: int
    customer_name: Optional[str] = None
    cook_id: Optional[int] = None
    cook_name: Optional[str] = None
    food_rating: float
    cook_rating: float
    comment: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ComplaintCreate(BaseModel):
    order_id: int
    cook_id: Optional[int] = None
    type: str
    description: str

class ComplaintResolveRequest(BaseModel):
    resolution: str
    status: str = "RESOLVED"

class ComplaintOut(BaseModel):
    id: int
    order_id: int
    customer_id: int
    customer_name: Optional[str] = None
    cook_id: Optional[int] = None
    cook_name: Optional[str] = None
    type: str
    description: str
    resolution: Optional[str] = None
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- PACKAGING INVENTORY SCHEMAS ---
class PackagingItemCreate(BaseModel):
    kitchen_id: int
    item_name: str
    total_quantity: int
    min_threshold: int = 20
    unit: str = "pcs"
    cost_per_unit: float = 2.5

class PackagingItemUpdate(BaseModel):
    add_quantity: Optional[int] = None
    used_quantity: Optional[int] = None
    min_threshold: Optional[int] = None

class PackagingItemOut(BaseModel):
    id: int
    kitchen_id: int
    item_name: str
    total_quantity: int
    used_quantity: int
    available_quantity: int
    min_threshold: int
    unit: str
    cost_per_unit: float
    is_low_stock: bool
    model_config = ConfigDict(from_attributes=True)

# --- COST CONFIGURATION SCHEMAS ---
class CostConfigurationUpdate(BaseModel):
    max_kitchen_capacity: Optional[int] = None
    partner_service_radius_km: Optional[float] = None
    min_contribution_margin_pct: Optional[float] = None
    partner_payout_rate_per_item: Optional[float] = None
    packaging_cost_per_item: Optional[float] = None
    delivery_cost_per_km: Optional[float] = None
    base_delivery_charge: Optional[float] = None
    weight_distance: Optional[float] = None
    weight_capacity: Optional[float] = None
    weight_availability: Optional[float] = None
    weight_specialization: Optional[float] = None
    weight_workload: Optional[float] = None

class CostConfigurationOut(BaseModel):
    id: int
    max_kitchen_capacity: int
    partner_service_radius_km: float
    min_contribution_margin_pct: float
    partner_payout_rate_per_item: float
    packaging_cost_per_item: float
    delivery_cost_per_km: float
    base_delivery_charge: float
    weight_distance: float
    weight_capacity: float
    weight_availability: float
    weight_specialization: float
    weight_workload: float
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- AI FOOD RECOGNITION SCHEMAS ---
class FoodRecognitionOut(BaseModel):
    food_name: str
    category: str
    confidence_score: float
    candidate_foods: List[dict]
    estimated_prep_time_mins: int
    suggested_price: float
    nutrition_highlights: str
    disclaimer: str

# --- AI NLP & VOICE SCHEMAS ---
class NLPResponseRequest(BaseModel):
    cook_id: Optional[int] = None
    text: str

class NLPResponseOut(BaseModel):
    available: bool
    capacity: int
    intent: str
    confidence: float
    raw_text: str
    extracted_notes: str

class AIAssistantRequest(BaseModel):
    query: str
    kitchen_id: Optional[int] = None
    user_role: Optional[str] = "ADMIN"

class AIAssistantOut(BaseModel):
    query: str
    answer: str
    sources: List[str]
    suggested_actions: List[str]

class VoiceSimulateRequest(BaseModel):
    cook_id: int
    incoming_text: str

class VoiceSimulateOut(BaseModel):
    cook_id: int
    ai_question: str
    cook_response: str
    nlp_result: NLPResponseOut
    updated_cook_capacity: int
    updated_availability: bool
    status_message: str

# --- NOTIFICATION SCHEMAS ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    type: str
    read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

