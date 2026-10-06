import sys
import os
import hashlib
from datetime import datetime, timedelta

# Ensure backend root is on Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.models import (
    User, Kitchen, Cook, MenuItem, Order, OrderItem, CookAssignment, Notification,
    PackagingInventory, PartnerConversation, AIConversationMessage, CostConfiguration, Review, Complaint
)
from app.services.overload_detection import check_kitchen_overload
from app.services.profitability import calculate_order_contribution

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()

def seed_database():
    print("Initializing Database Schemas for Ghule's Kitchen...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Cost Configuration...")
        cost_cfg = CostConfiguration(
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
        db.add(cost_cfg)
        db.commit()

        print("Seeding Core Users...")
        # Admin / Founder
        admin_user = User(
            name="Mr. Ghule (Founder & Admin)",
            email="admin@ghuleskitchen.com",
            phone="+919767781142",
            password_hash=hash_pw("admin123"),
            role="admin"
        )
        # Kitchen Manager
        kitchen_owner = User(
            name="Manali & Dipali Ghule",
            email="kitchen@ghuleskitchen.com",
            phone="+919767781142",
            password_hash=hash_pw("kitchen123"),
            role="kitchen"
        )

        # Home Cook Partners
        priya_user = User(name="Priya Sharma (Thergaon)", email="cook@ghuleskitchen.com", phone="+919876543220", password_hash=hash_pw("cook123"), role="cook")
        sneha_user = User(name="Sneha Patil (Wakad)", email="sneha@ghuleskitchen.com", phone="+919876543221", password_hash=hash_pw("cook123"), role="cook")
        anita_user = User(name="Anita Kulkarni (Pimple Saudagar)", email="anita@ghuleskitchen.com", phone="+919876543222", password_hash=hash_pw("cook123"), role="cook")
        rajesh_user = User(name="Rajesh Verma (Hinjawadi)", email="rajesh@ghuleskitchen.com", phone="+919876543223", password_hash=hash_pw("cook123"), role="cook")
        meera_user = User(name="Meera Joshi (Applicant Cook)", email="meera@ghuleskitchen.com", phone="+919876543224", password_hash=hash_pw("cook123"), role="cook")

        # Customers
        rahul_cust = User(name="Rahul Verma", email="customer@ghuleskitchen.com", phone="+919988776655", password_hash=hash_pw("customer123"), role="customer")
        pooja_cust = User(name="Pooja Deshmukh", email="pooja@gmail.com", phone="+919822001122", password_hash=hash_pw("customer123"), role="customer")
        amit_cust = User(name="Amit Shah", email="amit@gmail.com", phone="+919822003344", password_hash=hash_pw("customer123"), role="customer")

        db.add_all([admin_user, kitchen_owner, priya_user, sneha_user, anita_user, rajesh_user, meera_user, rahul_cust, pooja_cust, amit_cust])
        db.commit()

        print("Seeding Main Kitchen (Ghule's Kitchen)...")
        gk_kitchen = Kitchen(
            name="Ghule's Kitchen (Main Hub - Thergaon)",
            owner_id=kitchen_owner.id,
            location="Thergaon, Chinchwad, Pune",
            pincode="411033",
            latitude=18.5987,
            longitude=73.7749,
            total_capacity=100, # 100 rotis total daily capacity
            current_capacity=40, # 40 capacity remaining internally
            status="NORMAL"
        )
        db.add(gk_kitchen)
        db.commit()

        print("Seeding Home-Cook Partners...")
        # Cook A: Thergaon (1.5 km, Capacity 30)
        cook_a = Cook(
            user_id=priya_user.id,
            location="Thergaon Sector 2",
            pincode="411033",
            latitude=18.6010,
            longitude=73.7810,
            service_radius_km=3.0,
            service_areas="Thergaon, Wakad",
            specialization="Whole Wheat Phulka Roti, Chapati",
            max_capacity=30,
            current_capacity=30,
            available=True,
            cuisine_types="Maharashtrian, North Indian Breads",
            working_hours="08:00 AM - 09:00 PM",
            available_days="Mon-Sun",
            rating=4.9,
            verification_status="APPROVED",
            hygiene_status="VERIFIED",
            hygiene_score=98.0,
            payout_rate_per_unit=4.0,
            total_earnings=1450.0
        )
        # Cook B: Wakad (2.0 km, Capacity 30)
        cook_b = Cook(
            user_id=sneha_user.id,
            location="Wakad Datta Mandir Road",
            pincode="411057",
            latitude=18.5990,
            longitude=73.7620,
            service_radius_km=5.0,
            service_areas="Wakad, Thergaon, Rahatani",
            specialization="Tandoori Roti, Bajra Bhakri, Chapati",
            max_capacity=30,
            current_capacity=30,
            available=True,
            cuisine_types="Indian Breads, Thalis",
            working_hours="09:00 AM - 09:30 PM",
            available_days="Mon-Sat",
            rating=4.8,
            verification_status="APPROVED",
            hygiene_status="VERIFIED",
            hygiene_score=96.0,
            payout_rate_per_unit=4.0,
            total_earnings=1120.0
        )
        # Cook C: Pimple Saudagar (4.0 km, Capacity 40)
        cook_c = Cook(
            user_id=anita_user.id,
            location="Pimple Saudagar Linear Garden",
            pincode="411027",
            latitude=18.5920,
            longitude=73.7950,
            service_radius_km=6.0,
            service_areas="Pimple Saudagar, Rahatani, Kalewadi",
            specialization="Deluxe Thalis, Puran Poli, Rotis",
            max_capacity=40,
            current_capacity=40,
            available=True,
            cuisine_types="Maharashtrian Sweets, North Indian",
            working_hours="10:00 AM - 10:00 PM",
            available_days="Mon-Sun",
            rating=4.7,
            verification_status="APPROVED",
            hygiene_status="VERIFIED",
            hygiene_score=95.0,
            payout_rate_per_unit=3.8,
            total_earnings=980.0
        )
        # Cook D: Hinjawadi Phase 1 (7.0 km, Capacity 50)
        cook_d = Cook(
            user_id=rajesh_user.id,
            location="Hinjawadi IT Park Phase 1",
            pincode="411057",
            latitude=18.5900,
            longitude=73.7380,
            service_radius_km=8.0,
            service_areas="Hinjawadi, Wakad",
            specialization="Executive Lunch Boxes, Parathas",
            max_capacity=50,
            current_capacity=50,
            available=True,
            cuisine_types="North Indian, Parathas",
            working_hours="08:00 AM - 08:00 PM",
            available_days="Mon-Fri",
            rating=4.6,
            verification_status="APPROVED",
            hygiene_status="VERIFIED",
            hygiene_score=94.0,
            payout_rate_per_unit=3.5,
            total_earnings=840.0
        )
        # Cook E: Applicant Cook (Pending Verification)
        cook_e = Cook(
            user_id=meera_user.id,
            location="Kalewadi Phata, Pune",
            pincode="411017",
            latitude=18.6050,
            longitude=73.7900,
            service_radius_km=4.0,
            service_areas="Kalewadi, Thergaon",
            specialization="Homemade Rotis & Sabzi",
            max_capacity=20,
            current_capacity=20,
            available=False,
            cuisine_types="Maharashtrian",
            working_hours="09:00 AM - 07:00 PM",
            available_days="Mon-Sat",
            rating=4.5,
            verification_status="UNDER_REVIEW",
            hygiene_status="PENDING_CHECK",
            hygiene_score=90.0,
            payout_rate_per_unit=3.5,
            total_earnings=0.0
        )

        db.add_all([cook_a, cook_b, cook_c, cook_d, cook_e])
        db.commit()

        print("Seeding Menu Items...")
        items = [
            MenuItem(kitchen_id=gk_kitchen.id, name="Whole Wheat Chapati / Roti", description="Soft freshly puffed whole wheat roti made with zero preservatives", price=12.0, category="Indian Bread", cuisine="Maharashtrian", preparation_time=15, unit_name="pcs"),
            MenuItem(kitchen_id=gk_kitchen.id, name="Special Maharashtrian Deluxe Thali", description="3 Rotis, Paneer Sabzi, Dal Tadka, Steamed Rice, Pickle & Gulab Jamun", price=160.0, category="Thali", cuisine="Maharashtrian", preparation_time=25, unit_name="plate"),
            MenuItem(kitchen_id=gk_kitchen.id, name="Paneer Butter Masala Curry", description="Fresh cottage cheese cubes in rich homemade tomato cashew gravy", price=180.0, category="Curry", cuisine="North Indian", preparation_time=20, unit_name="portion"),
            MenuItem(kitchen_id=gk_kitchen.id, name="Dal Tadka & Jeera Rice Bowl", description="Yellow lentils tempered with ghee, garlic and cumin basmati rice", price=140.0, category="Rice & Dal", cuisine="Indian", preparation_time=20, unit_name="portion"),
            MenuItem(kitchen_id=gk_kitchen.id, name="Traditional Puran Poli (2 pcs)", description="Authentic sweet chana dal & jaggery stuffed flatbread served with ghee", price=110.0, category="Sweets", cuisine="Maharashtrian", preparation_time=20, unit_name="pack")
        ]
        db.add_all(items)
        db.commit()

        roti_item = items[0]

        print("Seeding Packaging Inventory...")
        pkg_items = [
            PackagingInventory(kitchen_id=gk_kitchen.id, item_name="Eco Roti Box (10 pcs capacity)", total_quantity=250, used_quantity=180, min_threshold=30, unit="pcs", cost_per_unit=3.0),
            PackagingInventory(kitchen_id=gk_kitchen.id, item_name="Curry Container 500ml", total_quantity=150, used_quantity=110, min_threshold=25, unit="pcs", cost_per_unit=4.5),
            PackagingInventory(kitchen_id=gk_kitchen.id, item_name="Kraft Paper Carry Bag", total_quantity=200, used_quantity=160, min_threshold=40, unit="pcs", cost_per_unit=2.0),
            PackagingInventory(kitchen_id=gk_kitchen.id, item_name="Thermal Sealing Roll", total_quantity=10, used_quantity=8, min_threshold=3, unit="rolls", cost_per_unit=45.0)
        ]
        db.add_all(pkg_items)
        db.commit()

        print("Seeding 100-Roti Bulk Order Scenario for Operational Demo...")
        # Order 1: Bulk order of 100 rotis by Rahul Verma
        contrib100 = calculate_order_contribution(
            db,
            total_revenue=1200.0,
            item_count=100,
            distance_km=2.0,
            kitchen_internal_quantity=40,
            partner_quantity=60
        )
        bulk_order = Order(
            customer_id=rahul_cust.id,
            kitchen_id=gk_kitchen.id,
            status="OVERLOAD_DETECTED", # Requires extra capacity!
            is_split=False,
            total_amount=1200.0, # 100 rotis * ₹12
            order_time=datetime.utcnow() - timedelta(minutes=10),
            preferred_delivery_time="07:30 PM Today",
            estimated_delivery_time=datetime.utcnow() + timedelta(minutes=45),
            priority="HIGH",
            delivery_address="Flat 402, Royal Palms Society, Thergaon, Pune - 411033",
            customer_notes="Please pack in fresh thermal insulated boxes for corporate dinner party.",
            food_prep_cost=contrib100.food_prep_cost,
            partner_payout_cost=contrib100.partner_payout,
            packaging_cost=contrib100.packaging_cost,
            delivery_cost=contrib100.delivery_cost,
            platform_fee=contrib100.platform_fee,
            estimated_contribution=contrib100.estimated_contribution,
            contribution_margin_pct=contrib100.contribution_margin_pct
        )
        db.add(bulk_order)
        db.commit()
        db.refresh(bulk_order)

        order_item = OrderItem(order_id=bulk_order.id, menu_item_id=roti_item.id, quantity=100, price=12.0)
        db.add(order_item)
        db.commit()

        # Seed additional normal completed/in-progress orders
        order2 = Order(
            customer_id=pooja_cust.id,
            kitchen_id=gk_kitchen.id,
            assigned_cook_id=cook_a.id,
            status="PREPARING",
            is_split=False,
            total_amount=320.0,
            order_time=datetime.utcnow() - timedelta(minutes=25),
            preferred_delivery_time="08:00 PM",
            delivery_address="Bungalow 12, Wakad Greens, Pune"
        )
        order2_item = OrderItem(order_id=2, menu_item_id=items[1].id, quantity=2, price=160.0)

        db.add(order2)
        db.commit()

        print("Seeding AI Partner Conversations & Escalation queue...")
        conv1 = PartnerConversation(
            partner_name="Sunita Shinde",
            phone="+919811223344",
            email="sunita@gmail.com",
            location="Pimple Nilakh, Pune",
            specialization="Chapati & Bhakri",
            daily_capacity=30,
            status="AI_HANDLING",
            ai_summary="Partner details collected. Location: Pimple Nilakh. Capacity: 30 rotis/day. Specialization: Chapati & Bhakri.",
            created_at=datetime.utcnow() - timedelta(hours=2),
            updated_at=datetime.utcnow() - timedelta(minutes=30)
        )
        db.add(conv1)
        db.commit()
        db.refresh(conv1)

        msg1 = AIConversationMessage(conversation_id=conv1.id, sender="PARTNER", message_text="Hello, I want to register as a home cook partner for Ghule's Kitchen in Pimple Nilakh.", timestamp=datetime.utcnow() - timedelta(hours=2))
        msg2 = AIConversationMessage(conversation_id=conv1.id, sender="AI", message_text="Namaste Sunita! Welcome. What is your daily cooking capacity and food specialization?", timestamp=datetime.utcnow() - timedelta(hours=2, minutes=-1))
        msg3 = AIConversationMessage(conversation_id=conv1.id, sender="PARTNER", message_text="I can prepare 30 chapatis per day. My specialty is soft Maharashtrian wheat chapatis.", timestamp=datetime.utcnow() - timedelta(minutes=30))
        db.add_all([msg1, msg2, msg3])

        conv2 = PartnerConversation(
            partner_name="Meera Joshi",
            phone="+919876543224",
            email="meera@ghuleskitchen.com",
            location="Kalewadi Phata, Pune",
            specialization="Homemade Rotis & Sabzi",
            daily_capacity=20,
            status="ESCALATED_ADMIN_REQUIRED",
            ai_summary="Escalated to Admin: Partner requested custom payout rate of ₹6 per roti.",
            created_at=datetime.utcnow() - timedelta(hours=5),
            updated_at=datetime.utcnow() - timedelta(hours=1)
        )
        db.add(conv2)
        db.commit()
        db.refresh(conv2)

        emsg1 = AIConversationMessage(conversation_id=conv2.id, sender="PARTNER", message_text="Hi, I can supply 20 rotis daily, but I want to negotiate a higher pay rate of ₹6 per roti.", timestamp=datetime.utcnow() - timedelta(hours=1))
        emsg2 = AIConversationMessage(conversation_id=conv2.id, sender="AI", message_text="Thank you for sharing that. Because your inquiry involves special custom pay rates, I have flagged this directly to Mr. Ghule (Admin). They will review and contact you.", timestamp=datetime.utcnow() - timedelta(hours=1, minutes=-1))
        db.add_all([emsg1, emsg2])
        db.commit()

        print("Seeding Reviews & Quality Complaints...")
        rev1 = Review(order_id=bulk_order.id, customer_id=rahul_cust.id, cook_id=cook_a.id, food_rating=5.0, cook_rating=5.0, comment="Outstanding authentic homemade rotis! Fresh, warm, and delivered right on time for our event.")
        db.add(rev1)

        comp1 = Complaint(order_id=2, customer_id=pooja_cust.id, cook_id=cook_b.id, type="PACKAGING", description="Packaging container seal was slightly damaged during delivery transit.", status="OPEN")
        db.add(comp1)
        db.commit()

        print("Seeding Notifications...")
        n1 = Notification(
            user_id=admin_user.id,
            message="HIGH DEMAND ALERT: Order #1 (100 Rotis) received. Kitchen internal capacity is 40. Extra capacity required: 60 rotis. AI Smart Allocation available.",
            type="OVERLOAD"
        )
        n2 = Notification(
            user_id=admin_user.id,
            message="AI ESCALATION: Meera Joshi requested custom pay terms (₹6/roti). Admin review required in Partner Conversations.",
            type="SYSTEM"
        )
        db.add_all([n1, n2])
        db.commit()

        print("Ghule's Kitchen database seeding complete!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
