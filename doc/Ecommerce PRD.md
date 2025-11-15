# 🛒 E-commerce Application – Product Requirements Document (PRD)

## 1. Overview

### Purpose
To develop a seamless and intuitive e-commerce platform that enables users to:
- Browse and discover products
- Add products to cart and manage purchases
- Complete orders with address, delivery slot, and payment selection
- Manage past orders, addresses, feedback, and support needs

### Target Users
- Everyday customers looking for groceries and local specialty items
- Mobile-first shoppers
- Regional customers looking for curated Bengali and farm-fresh items

## 2. Functional Modules

### 🔹 Module 1: Home Page (Pre-login)
**Key Components:**
- **Header**
    - Search bar (disabled or shows prompt to log in)
    - Login button
    - Cart button (triggers login)
- **Login Flow**
    - Phone number input
    - OTP sent to number
    - OTP validation:
        - ✅ Valid: Redirect to Home Page
        - ❌ Invalid: Error alert "Invalid OTP"

**User Goals:**
- Quick onboarding
- Easy login with mobile verification

### 🔹 Module 2: Home Page (Post-login)
**Header:**
- Search bar (functional)
- Deliver Now button
- User dropdown
- Cart button

**Landing Content:**
- Promotional banners
- "Shop by Categories" section (see next module)
- Featured products / Offers

### 🔹 Module 3: Shop by Categories
**Main Categories & Subcategories:**

| Category         | Subcategories                                 |
|------------------|-----------------------------------------------|
| Bengali Special  | Bengali groceries, home needs, vegetables     |
| Fresh Vegetables | Daily vegetables, exotic vegetables, leafy    |
| Fresh Fruits     | Daily fruits, exotic fruits                   |
| Groceries        | Cooking oil, daal, rice, snacks, spices       |
| Egg Meat & Fish  | Chicken, eggs, mutton                         |
| Dairy            | Butter & ghee                                 |

**UI Features:**
- Category icons/cards
- Horizontal scroll or grid-based layout
- Click → navigates to product listing

### 🔹 Module 4: Product Listing & Product Cards
**Product Card Elements:**
- Product image
- Product name
- Unit (e.g., 1kg, 500gm)
- Price
- Add button (triggers cart animation + notification)

**Product Interaction:**
- Add multiple quantities (toggle/stepper)
- View details (optional future enhancement)

### 🔹 Module 5: Cart & Checkout Flow
**🛒 Cart View:**
- Item list with quantities and total
- Modify quantities or remove item
- Proceed to Checkout

**📌 Address Entry:**
- Fields: Name, Phone, Address, Locality, Landmark, Pincode
- Tags: Home, Work, Other
- Set as default (checkbox)

**📌 Delivery Slot Selection:**
- Modal popup:
    - “Today” or “Tomorrow”
    - Dynamic slot availability
    - If no slots today, defaults to tomorrow

**📌 Payment Options:**
- Cash on Delivery (COD)
- Online Prepaid (integration with Razorpay, Stripe, etc.)

**📌 Place Order:**
- Validate required fields
- Confirm order and redirect to confirmation page

### 🔹 Module 6: Order Confirmation Page
**Displays:**
- Delivery address
- Delivery slot
- Order amount
- Payment method and status
- Actions:
    - See Your Invoice (PDF viewer/download)
    - Continue Shopping (redirect to home)

### 🔹 Module 7: User Dropdown Menu
Located in header (after login):
- Orders
- Address Book
- Customer Support
- Feedback
- Account Privacy
- Logout

### 🔹 Module 8: Orders Page
**Order List:**
- Basic info: Order ID, Delivery Date & Slot, Payment Status

**Expand Order:**
- Show address, items, prices, payment mode
- Cancel Order Button
    - Opens popup:
        - Confirmation prompt
        - Send Cancellation Request → flag in DB

**Invoice:**
- Download invoice PDF

### 🔹 Module 9: Address Book
- List of saved addresses (default tag)
- Add New Address
- Edit / Delete actions for each

### 🔹 Module 10: Customer Support & Feedback
**Support Tab:**
- Support email
- Phone numbers
- Store/Farm/Office addresses

**Feedback Tab:**
- Input fields:
    - Enquiry type
    - Name
    - Email
    - Contact number
    - Message
- Submit button triggers thank-you popup or toast

### 🔹 Module 11: Account Privacy
- Delete Account:
    - Confirmation modal
    - Upon confirm: deactivate/delete account and redirect to pre-login home page

### 🔹 Module 12: Logout
- Clears session/local storage
- Redirects to pre-login homepage

### 🔹 Module 13: Footer Section
**Footer Columns:**

| My Account     | Help         | Proxy         | Categories      |
|---------------|--------------|---------------|----------------|
| Orders        | Support Email| Store Locator | Bengali Special |
| Address Book  | FAQ          | Partner With Us| Fruits         |
| Account Info  | Terms & Privacy | Careers     | Vegetables     |

## 3. Technical Requirements

**📱 Platform**
- Mobile-first responsive web app
- Progressive Web App (PWA) support

**💾 Backend**
- Node.js / Django / Laravel (customizable)
- OTP service integration (Twilio, Firebase, etc.)
- Product, Order, User, Cart, Slot, and Address DB models

**🗃 Database**
- PostgreSQL / MongoDB
- Redis (for session/cache if needed)

**🔌 Integrations**
- Payment Gateway: Razorpay/Stripe
- SMS Gateway for OTP
- Email service for feedback auto-acknowledgement
- PDF invoice generation

## 4. Non-Functional Requirements
- ✅ Highly intuitive UX
- 🔒 Secure authentication (OTP-based)
- 📈 Scalable backend for high product volume
- 🚀 Fast performance (lazy loading, optimized APIs)
- 🛡️ Privacy-compliant (GDPR-ready, if international)

## 5. Future Enhancements (Optional Roadmap)
- Wishlist & Recently Viewed Items
- Referral or Reward System
- Live Order Tracking
- In-app Notifications
- Loyalty Points
- Multi-language Support
- Seller Dashboard (for partners/farmers)
