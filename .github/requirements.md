# Requirements Document

## Introduction
Fresh Greens is a modern B2C e-commerce platform dedicated to fresh agricultural produce. This document outlines the core functional requirements and corresponding user stories.

## Portals Structure
The application operates exclusively with two portals:
*   **User Portal**: The default application serving guests and registered buyers (/).
*   **Admin Portal**: The management dashboard accessible strictly under the /admin route.

## Requirements

### Requirement 1: User Registration & Authentication
**User Story:** As a user, I want to securely log in or register using my existing Google/Social accounts via Firebase so that I can access personalized features, manage my profile, and save my preferences.

#### Acceptance Criteria
1. Users must be able to securely authenticate via Firebase Auth.
2. The backend must properly issue and validate a session against the Firebase token.
3. First-time users should be prompted to update their profile (email, phone, location).

### Requirement 2: Product Discovery & Search
**User Story:** As a customer or guest, I want to browse and search for fresh produce by categories, keywords, or my local city/pincode so that I can easily find relevant products to buy.

#### Acceptance Criteria
1. The product catalog must be accessible to unauthenticated and authenticated users.
2. Users must be able to filter search results by city and pincode.
3. The catalog payload must be resolved rapidly utilizing caching layers (Redis).

### Requirement 3: Shopping Cart Management
**User Story:** As an authenticated buyer, I want to add products to my cart, adjust quantities, and remove items to compile my order before checkout.

#### Acceptance Criteria
1. Users must be logged in to modify cart inventories.
2. The platform must confirm stock availability dynamically.
3. Cart total costs must correctly multiply item quantity alongside real-time entity pricing.

### Requirement 4: Checkout & Secure Payments
**User Story:** As a buyer, I want to seamlessly check out my cart and pay via a payment gateway (Razorpay) so that my order is successfully completed.

#### Acceptance Criteria
1. Buyers must explicitly provide their delivery address details.
2. The UI must initialize a Razorpay sequence securely brokered by backend controllers.
3. Successful backend verification of the Razorpay HMAC signature is mandated before transitioning the order to PAID.

### Requirement 5: Order History & Tracking
**User Story:** As a buyer, I want to view my past and ongoing orders so that I can track deliveries.

#### Acceptance Criteria
1. Buyers can retrieve a paginated array of their transaction history sorted chronologically.
2. The interface must portray accurately cached itemized purchase prices matching the snapshot at the time of purchase.

### Requirement 6: Platform Administration
**User Story:** As an admin, I want to monitor sales statistics, review comprehensive orders, and govern user accounts to ensure operational integrity.

#### Acceptance Criteria
1. Only users natively holding the ROLE_ADMIN context may connect to /admin routes.
2. The admin portal must display fundamental analytics related to users and payments.
3. Admins must have authorization to inspect generic data spanning products, users, and orders effortlessly.





