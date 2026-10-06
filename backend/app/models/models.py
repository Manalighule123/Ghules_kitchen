from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(30), nullable=False) # admin, kitchen, cook, customer
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    kitchens = relationship("Kitchen", back_populates="owner")
    cook_profile = relationship("Cook", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="customer")
    notifications = relationship("Notification", back_populates="user")
    reviews = relationship("Review", back_populates="customer")
    complaints = relationship("Complaint", back_populates="customer")

class Kitchen(Base):
    __tablename__ = "kitchens"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String(200), nullable=False)
    pincode = Column(String(10), default="411033") # Thergaon/Wakad default
    latitude = Column(Float, default=18.5987) # Thergaon, Pune coordinates
    longitude = Column(Float, default=73.7749)
    total_capacity = Column(Integer, default=100) # Daily cooking capacity
    current_capacity = Column(Integer, default=100) # Remaining internal capacity
    status = Column(String(50), default="NORMAL") # NORMAL, OVERLOAD_DETECTED, CAPACITY_FULL

    # Relationships
    owner = relationship("User", back_populates="kitchens")
    menu_items = relationship("MenuItem", back_populates="kitchen")
    orders = relationship("Order", back_populates="kitchen")
    packaging = relationship("PackagingInventory", back_populates="kitchen")

class Cook(Base):
    __tablename__ = "cooks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String(200), nullable=False)
    pincode = Column(String(10), default="411033")
    latitude = Column(Float, default=18.5987)
    longitude = Column(Float, default=73.7749)
    service_radius_km = Column(Float, default=5.0)
    service_areas = Column(Text, default="Thergaon, Wakad, Pimple Saudagar")
    specialization = Column(String(200), default="Indian Breads, Rotis, Thalis")
    max_capacity = Column(Integer, default=30)
    current_capacity = Column(Integer, default=30) # available capacity
    available = Column(Boolean, default=True)
    cuisine_types = Column(String(200), default="Maharashtrian, North Indian")
    working_hours = Column(String(50), default="09:00 AM - 09:00 PM")
    available_days = Column(String(100), default="Mon, Tue, Wed, Thu, Fri, Sat, Sun")
    rating = Column(Float, default=4.8)
    verification_status = Column(String(30), default="APPROVED") # PENDING, UNDER_REVIEW, APPROVED, REJECTED
    hygiene_status = Column(String(30), default="VERIFIED") # VERIFIED, PENDING_CHECK, FAILED
    hygiene_score = Column(Float, default=95.0)
    payout_rate_per_unit = Column(Float, default=4.0) # e.g. ₹4 per roti prepared
    total_earnings = Column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="cook_profile")
    assignments = relationship("CookAssignment", back_populates="cook")
    assigned_orders = relationship("Order", back_populates="assigned_cook")
    reviews = relationship("Review", back_populates="cook")
    complaints = relationship("Complaint", back_populates="cook")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(50), default="Indian Bread")
    cuisine = Column(String(50), default="Indian")
    preparation_time = Column(Integer, default=20) # in minutes
    image_url = Column(String(300), nullable=True)
    unit_name = Column(String(30), default="pcs") # rotis, plates, portions

    # Relationships
    kitchen = relationship("Kitchen", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id"), nullable=False)
    assigned_cook_id = Column(Integer, ForeignKey("cooks.id"), nullable=True)
    status = Column(String(50), default="PLACED")
    # PLACED, CONFIRMED, OVERLOAD_DETECTED, SEARCHING_COOK, COOK_ASSIGNED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    is_split = Column(Boolean, default=False) # true if order is split among multiple cooks
    total_amount = Column(Float, nullable=False)
    order_time = Column(DateTime, default=datetime.utcnow)
    preferred_delivery_time = Column(String(50), nullable=True) # e.g., "7:30 PM Today"
    estimated_delivery_time = Column(DateTime, nullable=True)
    priority = Column(String(20), default="NORMAL") # HIGH, NORMAL, LOW
    delivery_address = Column(String(200), nullable=True)
    customer_notes = Column(Text, nullable=True)

    # Financial Contribution Metrics
    food_prep_cost = Column(Float, default=0.0)
    partner_payout_cost = Column(Float, default=0.0)
    packaging_cost = Column(Float, default=0.0)
    delivery_cost = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    estimated_contribution = Column(Float, default=0.0)
    contribution_margin_pct = Column(Float, default=0.0)

    # Relationships
    customer = relationship("User", back_populates="orders")
    kitchen = relationship("Kitchen", back_populates="orders")
    assigned_cook = relationship("Cook", back_populates="assigned_orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    assignments = relationship("CookAssignment", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")

class CookAssignment(Base):
    __tablename__ = "cook_assignments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    cook_id = Column(Integer, ForeignKey("cooks.id"), nullable=False)
    assigned_quantity = Column(Integer, default=1) # Quantity assigned to this specific cook/kitchen
    item_description = Column(String(200), default="Food Portion")
    payout_amount = Column(Float, default=0.0)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="ASSIGNED") # ASSIGNED, ACCEPTED, REJECTED, PREPARING, READY, COMPLETED
    rejection_reason = Column(String(250), nullable=True)

    # Relationships
    order = relationship("Order", back_populates="assignments")
    cook = relationship("Cook", back_populates="assignments")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cook_id = Column(Integer, ForeignKey("cooks.id"), nullable=True)
    food_rating = Column(Float, default=5.0)
    cook_rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="reviews")
    customer = relationship("User", back_populates="reviews")
    cook = relationship("Cook", back_populates="reviews")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cook_id = Column(Integer, ForeignKey("cooks.id"), nullable=True)
    type = Column(String(50), nullable=False) # QUALITY, MISSING_ITEM, LATE_DELIVERY, PACKAGING, OTHER
    description = Column(Text, nullable=False)
    resolution = Column(Text, nullable=True)
    status = Column(String(30), default="OPEN") # OPEN, IN_PROGRESS, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="complaints")
    customer = relationship("User", back_populates="complaints")
    cook = relationship("Cook", back_populates="complaints")

class PackagingInventory(Base):
    __tablename__ = "packaging_inventory"

    id = Column(Integer, primary_key=True, index=True)
    kitchen_id = Column(Integer, ForeignKey("kitchens.id"), nullable=False)
    item_name = Column(String(100), nullable=False)
    total_quantity = Column(Integer, default=100)
    used_quantity = Column(Integer, default=0)
    min_threshold = Column(Integer, default=20)
    unit = Column(String(20), default="pcs")
    cost_per_unit = Column(Float, default=2.5)

    # Relationships
    kitchen = relationship("Kitchen", back_populates="packaging")

class PartnerConversation(Base):
    __tablename__ = "partner_conversations"

    id = Column(Integer, primary_key=True, index=True)
    partner_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(120), nullable=True)
    location = Column(String(200), nullable=True)
    specialization = Column(String(200), nullable=True)
    daily_capacity = Column(Integer, default=20)
    status = Column(String(40), default="AI_HANDLING") # AI_HANDLING, ESCALATED_ADMIN_REQUIRED, APPROVED, REJECTED
    ai_summary = Column(Text, nullable=True)
    collected_data_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    messages = relationship("AIConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

class AIConversationMessage(Base):
    __tablename__ = "ai_conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("partner_conversations.id"), nullable=False)
    sender = Column(String(20), nullable=False) # PARTNER, AI, ADMIN
    message_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("PartnerConversation", back_populates="messages")

class CostConfiguration(Base):
    __tablename__ = "cost_configurations"

    id = Column(Integer, primary_key=True, index=True)
    max_kitchen_capacity = Column(Integer, default=100)
    partner_service_radius_km = Column(Float, default=5.0)
    min_contribution_margin_pct = Column(Float, default=25.0) # 25% target min margin
    partner_payout_rate_per_item = Column(Float, default=3.5) # ₹ per item
    packaging_cost_per_item = Column(Float, default=3.0) # ₹
    delivery_cost_per_km = Column(Float, default=12.0) # ₹ per km
    base_delivery_charge = Column(Float, default=30.0) # ₹
    weight_distance = Column(Float, default=0.20)
    weight_capacity = Column(Float, default=0.25)
    weight_availability = Column(Float, default=0.25)
    weight_specialization = Column(Float, default=0.15)
    weight_workload = Column(Float, default=0.15)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="INFO") # OVERLOAD, ASSIGNMENT, STATUS_UPDATE, SYSTEM, COMPLAINT, STOCK
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
