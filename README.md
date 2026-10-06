<<<<<<< HEAD
# Ghules_kitchen
=======
# GHULE’S KITCHEN 🍳
### AI-Powered Homemade Food Marketplace & Smart Kitchen Capacity Management Platform

> **"Homemade Food. Smarter Capacity. More Opportunities."**  
> *Helping a small homemade-food business increase its order capacity without immediately taking on expensive full-time staff.*

---

## 📌 Business Overview & Core Concept

**Ghule’s Kitchen** is designed for a real small food business in Pune (Thergaon / Wakad). 
The founder currently manages operations with limited human resources. When orders surge (e.g., a corporate order of 100 rotis arrives while the kitchen's internal capacity is 40 rotis), one person cannot prepare and manage everything alone, and hiring a full-time employee is not always financially practical.

The platform solves this by building a verified hyperlocal network of nearby home-cook partners who help prepare excess order quantities on a pay-per-order basis.

### Core Value Proposition
- **For Ghule's Kitchen**: Increase order fulfillment capacity without fixed labor overheads or delivery delays.
- **For Home Cooks**: Flexible earning opportunities for verified local home cooks in Thergaon, Wakad, and Pune.
- **For Customers**: Authentic, fresh, homemade food delivered fast with live order tracking.

---

## 🌟 Key System Capabilities & Architecture

### 1. Dynamic Order Splitting Algorithm (`backend/app/services/order_allocation.py`)
- Automatically splits bulk orders across Ghule's Kitchen and multiple home cooks.
- **Example Scenario**:
  - Customer orders **100 rotis**.
  - **Ghule's Kitchen** handles **40 rotis** (internal capacity limit).
  - **Extra Capacity Required**: **60 rotis**.
  - **Cook A** (Thergaon, 1.5 km): Assigned **30 rotis**.
  - **Cook B** (Wakad, 2.0 km): Assigned **30 rotis**.
- Maintains step-by-step preparation status for each preparation split.

### 2. Hyperlocal Nearby Cook Matching (`backend/app/services/cook_matching.py`)
Calculates a weighted matching score:
$$\text{Score} = (D \cdot 0.20) + (C \cdot 0.25) + (A \cdot 0.25) + (S \cdot 0.15) + (W \cdot 0.15)$$
- **D (Distance)**: Haversine distance score relative to partner service radius.
- **C (Capacity)**: Available cooking bandwidth score.
- **A (Availability & Verification)**: Active & Admin-approved status.
- **S (Specialization)**: Cuisine and dish specialization match.
- **W (Workload Ratio)**: Remaining capacity ratio.

### 3. Financial Contribution & Profitability Calculator (`backend/app/services/profitability.py`)
Calculates exact net margin for every order/batch:
$$\text{Revenue} - \text{Food Prep Cost} - \text{Partner Payout} - \text{Packaging} - \text{Delivery} - \text{Platform Fee} = \text{Estimated Net Contribution}$$

### 4. AI Partner Onboarding & Conversation Agent (`backend/app/services/ai_partner_agent.py`)
- Handles conversational onboarding for prospective home-cook partners.
- Collects name, location, daily capacity, specialization, and available hours.
- **Auto-Escalation**: Flags custom pay rate requests, disputes, or complaints directly to the Founder/Admin.

### 5. AI Food Recognition Lens (`backend/app/services/ai_food_recognition.py`)
- Inspired by Google Lens for food.
- Upload or capture a food photo to detect food item ("Whole Wheat Chapati"), category ("Indian Bread"), confidence score (96.4%), suggested price, and nutrition highlights.

### 6. Packaging Inventory Management (`backend/app/routers/packaging.py`)
- Tracks stock levels for eco roti boxes, curry containers, paper carry bags, and thermal sealing rolls.
- Triggers low-stock alerts when inventory drops below minimum thresholds.

---

## 👥 Core User Roles & Credentials

| Role | Demo Email | Password | Key Functionalities |
| :--- | :--- | :--- | :--- |
| **Founder / Admin** | `admin@ghuleskitchen.com` | `admin123` | Capacity Command Center, 100-Roti Demo, Contribution Calculator, AI Partner Chat & Approval, Partner Verification, Complaints, Packaging Stock, Settings |
| **Home-Cook Partner** | `cook@ghuleskitchen.com` | `cook123` | Availability & Capacity Toggle, Assigned Split Workloads, Accept/Reject with Reason, Update Prep Status (`PREPARING` $\rightarrow$ `READY`), Earnings Summary |
| **Customer** | `customer@ghuleskitchen.com` | `customer123` | Browse Food, AI Food Lens, Select Delivery Time Slot & Address, Live Stepper Order Tracker with Split Breakdown, Rate & Review, File Complaint |

---

## ⚙️ Quick Start Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+

### 1. Start Backend API Server
```bash
cd backend
python -m venv venv
# Windows activate:
venv\Scripts\activate
# Install requirements:
pip install -r requirements.txt
# Seed database (Pre-configured with 100-roti scenario, cooks, packaging & AI conversations):
python seed.py
# Start FastAPI backend:
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 2. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
- Frontend Application: `http://localhost:3000`

### 3. Run Backend Unit Tests
```bash
cd backend
python -m pytest
```

---

## 📄 License & Startup Attribution
Developed for **Ghule’s Kitchen** by **Manali & Dipali Ghule**. All rights reserved.
>>>>>>> 83e6b8a (Initial commit: Ghule's Kitchen AI-powered homemade food marketplace and smart kitchen capacity platform)
