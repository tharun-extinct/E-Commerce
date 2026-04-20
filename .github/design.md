# Fresh Greens Platform Design & Architecture

## 1. System Overview
Fresh Greens is a decoupled e-commerce web application running a robust Spring Boot backend alongside a modern, dynamic React frontend. It functions as an online marketplace for fresh agricultural produce. The platform utilizes a two-portal architecture consisting of a primary consumer portal for users and a protected admin portal for management.

## 2. Tech Stack
*   **Backend:** Java 17, Spring Boot 4
*   **Data Persistence:** Spring Data JPA (Hibernate), MySQL Database
*   **Security & Authentication:** Spring Security, Firebase Admin Auth SDK (Client-side Firebase JWT Tokens verified by Backend)
*   **Caching:** Redis (via Spring Boot @EnableCaching)
*   **Payment Gateway:** Razorpay Java SDK
*   **Notifications:** Twilio SDK
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui components, React Router, React Query.

## 3. Core Modules & Configuration Layers

### 3.1 Security & Auth
*   FirebaseTokenFilter: Custom Spring Filter that intercepts incoming requests, parses the Bearer token via Firebase, and propagates ROLE_BUYER or ROLE_ADMIN context into Spring's SecurityContextHolder.
*   SecurityConfig: Establishes authorization patterns mapping stateless token validation.

### 3.2 Caching Mechanism
*   RedisConfig: Applies caching strategies for frequently accessed but read-heavy data.

### 3.3 Payments
*   OrderController & RazorpayConfig: Encapsulates operations reliably exchanging information with Razorpay APIs. Creates the order before prompting the interface and handles signature verifications.
*   WebhookController: Independent receptor for Razorpay's asynchronous event pings (payment.captured, etc.).

## 4. Portals & Application Flow

### 4.1 Default User Portal (/)
The primary interface accessible by both Guests and authenticated Users/Buyers. It provides robust capabilities from product discovery to secure checkouts via an intuitive React frontend.

### 4.2 Admin Portal (/admin)
An exclusive management shell restricted strictly to ROLE_ADMIN identities. Includes endpoints governed by the AdminController to oversee platform metrics.
*   **Stats Dashboard**: Retrieves global transaction and user metrics.
*   **User & Product Management**: Administer accounts, control active constraints, manage product catalogs, and review cross-platform orders globally.

## 5. User Roles and Authorizations

1.  **ROLE_BUYER (User)**: May mutate cart inventories, place checkouts, process payments, update profile details, and track order histories.
2.  **ROLE_ADMIN**: May log into the /admin portal. Possesses absolute governance over user accounts, universal orders, and product data.
