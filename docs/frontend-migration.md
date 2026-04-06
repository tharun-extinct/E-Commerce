# Fresh Greens Frontend Migration Plan (Structured)

## 1) Objective

Migrate the legacy static frontend from Spring Boot static pages to a production-ready React SPA using Vite + TypeScript, while keeping backend APIs intact.

- **Source UI**: [app/src/main/resources/static](../app/src/main/resources/static)
- **Target UI**: [frontend](../frontend)
- **Backend**: Spring Boot (unchanged API contracts unless explicitly required)

---

## 2) Locked Architecture Decisions

These are final and must be followed across iterations:

1. **Auth model**: Session-cookie auth with same parent domain (`app.*` + `api.*`)
2. **Firebase config**: Vite env variables (`VITE_*`)
3. **Hosting model**: Separate frontend hosting via **Google Cloud Storage + Cloud CDN**
4. **UI system**: **Tailwind CSS + shadcn/ui** components
5. **Data fetching**: **TanStack Query**
6. **HTTP client**: **Axios** (target version: `1.14.0`, as `1.14.1` is not available)

---

## 3) Scope Constraints

- Platform is **B2C only**.
- **No seller flows** (`sell`, `my-listings`, seller CTA/buttons) in final UX.
- Preserve or improve legacy UX from static pages.

---

## 4) Target Tech Stack

| Layer | Selection |
|---|---|
| Build Tool | Vite 6 |
| UI Framework | React 19 + TypeScript (`.tsx`) |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 + design tokens |
| Components | shadcn/ui |
| Data/Cache | TanStack Query |
| HTTP | Axios 1.14.0 |
| Forms | React Hook Form + Zod |
| Auth | Firebase JS SDK (modular) + backend session exchange |
| Toasts | React Hot Toast / Sonner-compatible setup |
| Payments | Razorpay Checkout.js via hook |

---

## 5) Migration Phases

## Phase 1 — Architecture Lock

- Session-cookie auth on same parent domain
- Vite env-based Firebase configuration
- Tailwind + shadcn component mapping

## Phase 2 — Foundation

- Vite React TypeScript setup in [frontend](../frontend)
- Core modules:
  - API client
  - Auth context
  - Location context

## Phase 3 — Page Migration

- Convert Spring Boot static pages to React route pages
- Build shared shell and reusable components for commerce/admin
- Remove seller-specific flows for B2C scope

## Phase 4 — Separate Hosting (GCS + Cloud CDN)

- Frontend deployment pipeline
- Cache strategy + invalidation
- DNS/TLS/CDN rollout + rollback controls

---

## 6) Static-to-React Route Mapping

| Legacy Page | React Route | Status |
|---|---|---|
| index.html | `/` | Migrated |
| login.html | `/login` | Migrated |
| product-detail.html | `/products/:id` | Migrated |
| cart.html | `/cart` | Migrated |
| checkout.html | `/checkout` | Migrated |
| profile.html | `/profile` | Migrated |
| orders.html | `/orders` | Migrated |
| settings.html | `/settings` | Migrated |
| admin.html | `/admin` | Migrated |
| error.html | `*` | Migrated |
| sell.html | `/sell` | **Out of scope (B2C)** |
| my-listings.html | `/my-listings` | **Out of scope (B2C)** |

---

## 7) Implemented Improvements (Completed)

### Core Platform

- Cookie + CSRF configuration hardened for same-parent-domain strategy
- Firebase env template updated for separate frontend origin
- HTTP client improvements:
  - request timeout
  - request ID header support
- Expanded typed API coverage
- Auth flow hardening:
  - popup fallback to redirect
  - redirect-result resume

### UI/UX Upgrades

- Header redesign to align with legacy visual language
- Shared style system improvements in [frontend/src/index.css](../frontend/src/index.css)
- Home page improvements:
  - hero section
  - category strip
  - product card polish
  - location-aware listing behavior
- Page visual upgrades:
  - login
  - cart
  - checkout
  - settings
  - profile
  - orders
  - product detail
- Shell/footer polish for consistency

### Location Experience

- Replaced single IP provider with fallback providers
- Retry and timeout handling
- Added manual location picker (city + pincode modal)
- Added location-aware product filtering and indicator text

### Deployment

- GCS + Cloud CDN-oriented deployment workflow upgraded:
  - release promotion
  - rollback mode (`workflow_dispatch`)
  - immutable asset cache vs revalidated HTML shell
  - targeted CDN invalidation

---

## 8) Known Issues Resolved

1. **Firebase env error**
   - Root cause: env keys missing `VITE_` prefix
   - Resolution: renamed `FIREBASE_WEB_*` to `VITE_FIREBASE_*`

2. **UI click-blocking issue**
   - Root cause: decorative/toast overlay pointer capture
   - Resolution: pointer-event rules fixed for overlay/toast layers

3. **City auto-detect reliability**
   - Root cause: single provider instability
   - Resolution: fallback provider chain + manual picker support

---

## 9) Production Readiness Checklist

- [✓] Lint/build are passing in frontend iterations
- [✓] Route migration completed for in-scope B2C pages
- [✓] Session-cookie architecture decision implemented
- [✓] Environment variable model stabilized (`VITE_*`)
- [x] CDN-oriented deployment workflow implemented
- [ ] Route-level code-splitting for bundle reduction
- [ ] Error boundaries + resilient retry UX on critical pages
- [ ] E2E smoke tests (login/cart/checkout/admin)
- [ ] Final accessibility pass (keyboard focus, aria labels, contrast)
- [ ] Final pixel-parity pass against legacy static UI

---

## 10) Next Iteration Plan

1. Implement route-level lazy loading and chunk strategy.
2. Add global and route-level error boundaries.
3. Complete shadcn primitives integration where custom UI is still used.
4. Add automated smoke tests for top user journeys.
5. Execute final UX parity review page-by-page vs legacy static screens.

---

## 11) Validation Commands

Run from [frontend](../frontend):

- `npm run lint`
- `npm run build`
- `npm run typecheck`

---

## 12) Notes

- The previous version of this document contained conversational logs.
- This version is normalized for project tracking, handoff, and production planning.User: Convert this `static` html, js, css to Vite React with .tsx file extension. Plan on How we gonna implement it with the optimal Tech Stack



 





### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Bundler | **Vite 6** | Fast HMR, native TS, zero-config |
| UI Library | **React 19 + TypeScript** | Type-safe `.tsx` components |
| Routing | **React Router v7** | File-friendly route structure, loaders/actions |
| Styling | **Tailwind CSS v4** + existing CSS custom properties | Utility-first, keeps your design tokens (`--fg-green`, etc.) |
| Icons | **React Icons** (Bootstrap icon set) | Drop-in replacement for current BI icons |
| HTTP Client | **Axios** | Interceptors for CSRF token + 401 redirect |
| Auth State | **React Context + Firebase JS SDK (modular v10)** | Replace IIFE `FGAuth` module |
| Location State | **React Context** | Replace IIFE `FGLocation` module |
| Forms | **React Hook Form + Zod** | Typed validation matching backend DTOs |
| Payments | **Razorpay Checkout.js** (dynamic `<script>`) | Same integration, wrapped in a hook |
| Notifications | **React Hot Toast** | Replace jQuery toast utility |
| State (optional) | **TanStack Query (React Query)** | Server-state caching, pagination, revalidation |

---

### Steps

1. **Scaffold the Vite React TS project** — Run `npm create vite@latest` with the `react-ts` template inside a new `frontend/` directory at the project root (sibling to app). Install Tailwind CSS v4, React Router v7, Axios, React Hook Form, Zod, TanStack Query, React Hot Toast, React Icons, and the Firebase JS SDK.

2. **Define TypeScript types from backend DTOs** — Create a `frontend/src/types/` folder with interfaces mirroring every DTO in dto: `ApiResponse<T>`, `ProductResponse`, `CartResponse`, `OrderResponse`, `PageResponse<T>`, `AdminStatsResponse`, etc.

3. **Build the API client & auth/location providers** — Create `frontend/src/lib/apiClient.ts` (Axios instance with CSRF cookie interceptor + 401 redirect), `frontend/src/context/AuthContext.tsx` (Firebase popup/redirect auth → `/api/auth/login` token exchange → session), and `frontend/src/context/LocationContext.tsx` (ip-api auto-detect + localStorage override). These replace api.js, auth.js, and location.js.

4. **Create shared layout & reusable components** — Extract the duplicated navbar, footer, toast, loading spinner, product card, category chips, and empty-state into shared components under `frontend/src/components/`. Build a `<RootLayout>` with `<Outlet>` for React Router that wraps navbar + footer + auth gate logic, eliminating the current per-page duplication across all 12 HTML files.

5. **Convert 12 HTML pages → React route pages** — Map each page to a `.tsx` route component under `frontend/src/pages/`:

   | Static Page | Route | Component |
   |-------------|-------|-----------|
   | index.html | `/` | `HomePage.tsx` |
   | login.html | `/login` | `LoginPage.tsx` |
   | product-detail.html | `/products/:id` | `ProductDetailPage.tsx` |
   | cart.html | `/cart` | `CartPage.tsx` |
   | checkout.html | `/checkout` | `CheckoutPage.tsx` |
   | profile.html | `/profile` | `ProfilePage.tsx` |
   | sell.html | `/sell` | `SellPage.tsx` |
   | my-listings.html | `/my-listings` | `MyListingsPage.tsx` |
   | orders.html | `/orders` | `OrdersPage.tsx` |
   | settings.html | `/settings` | `SettingsPage.tsx` |
   | admin.html | `/admin` | `AdminPage.tsx` |
   | error.html | `*` | `ErrorPage.tsx` |

   Use **TanStack Query** hooks for data fetching/caching in each page, and **React Hook Form + Zod** for forms (sell, checkout, settings).

6. **Configure dev proxy & production build output** — In `vite.config.ts`, add a dev proxy (`/api/** → http://localhost:8080`) so the React dev server forwards API calls to Spring Boot. For production, configure the build output (`outDir`) to emit into static (or serve separately). Add a `Dockerfile` or update the existing one to include a Node build stage.





### Further Considerations

1. **Deployment strategy** — Should the React build be bundled *inside* the Spring Boot JAR (copied to `resources/static/`) for single-artifact deployment, or served separately (e.g., CDN / Nginx)? Single-artifact is simpler; separate gives independent scaling. **Recommendation: start with single-artifact, split later if needed.**

2. **Tailwind CSS vs. keeping Bootstrap** — The current UI is heavily Bootstrap 5. A full Tailwind rewrite gives a smaller bundle and more control but takes longer. An incremental approach — keep Bootstrap initially, migrate to Tailwind page-by-page — is also viable. **Which do you prefer?**

3. **TanStack Query vs. plain Axios** — TanStack Query adds caching, background refetch, and pagination helpers (great for the product grid, admin tables, order history). It adds ~12 KB gzipped. If you want a lighter setup, plain Axios + `useEffect` works but you lose cache benefits. **Recommendation: use TanStack Query — the pagination-heavy pages benefit significantly.**


---






---

### 🟡 Medium Concerns

**4. CORS Configuration Update**
SecurityConfig.java currently allows only `http://localhost:8080`. Must add the React dev server (`http://localhost:5173`) and production frontend domain to `APP_CORS_ORIGINS` env var. Already supported — no code change needed, just config.

**5. Tailwind Migration Effort**
The current UI uses Bootstrap 5 heavily (grid, cards, modals, dropdowns, alerts). Tailwind has **no pre-built components** — every Bootstrap component must be manually rebuilt in Tailwind. This increases effort significantly. Consider using **shadcn/ui** (headless Radix components + Tailwind styling) to accelerate building cards, modals, dropdowns, and form controls.

**6. SEO Opportunity**
Current pages are already fully client-rendered with zero meta tags — the React SPA doesn't worsen this. However, as a B2C platform, product pages *should* be indexable. Consider adding **React Helmet** for dynamic `<meta>` tags now, and plan a future move to **Next.js** or **React Router SSR** if organic search traffic matters.

---

### 🟢 Low Concerns (Straightforward)

**7. Razorpay Integration** — Load `checkout.js` dynamically via a `useRazorpay` hook. The flow is clean API-driven and maps directly.

**8. Image Handling** — Products use Unsplash URLs (`imageUrl` string field). No file upload logic exists — React just renders `<img>` tags.

**9. Twilio OTP Flow** — Settings page sends/verifies OTP via two API calls. Maps to a simple form + state machine in React.

---

### Refined Steps (With Your Choices)

1. **Scaffold `frontend/`** at project root — Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + React Router v7 + TanStack Query + Axios + React Hook Form + Zod + React Hot Toast + Firebase JS SDK (modular).

2. **Configure cross-origin auth** — Update SecurityConfig.java cookie settings (or switch to Bearer auth) based on decision above. Add CORS origins for `localhost:5173` + production domain.

3. **Build core infrastructure** — `apiClient.ts` (Axios + CSRF interceptor), `AuthContext.tsx` (Firebase + session), `LocationContext.tsx` (ip-api + localStorage), TypeScript types from all DTOs in dto.

4. **Build shared components with Tailwind + shadcn/ui** — `Navbar`, `Footer`, `ProductCard`, `CategoryChips`, `EmptyState`, `Spinner`, route guards (`RequireAuth`, `RequireAdmin`). Migrate design tokens (`--fg-green`, `--fg-accent`, etc.) into `tailwind.config.ts` theme extensions.

5. **Convert 12 pages → route components** with TanStack Query hooks for data fetching, React Hook Form + Zod for forms (sell, checkout, settings), and Razorpay hook for checkout.

6. **Set up deployment** — `vite.config.ts` with dev proxy (`/api → localhost:8080`), production build, and hosting setup (Firebase Hosting / Nginx / CDN based on decision).




---


---



### Phase 2: Build Foundation 
- Create Vite React TS app + Tailwind + shadcn/ui + TanStack Query
- Create API/auth/location core modules 

### Phase 3: Page Migration
- Convert `app\src\main\resources\static` static pages of SprintBoot Application to  React pages in the `frontend` folder
- Shared UI shell + reusable commerce/admin components  

### Phase 4: Separate Hosting (GCS + Cloud CDN)
- Frontend deploy pipeline + cache strategy + invalidation
- DNS/TLS/CDN rollout + rollback controls


---



Implemented — Iteration 1 is complete and aligned to your decisions.

### What I improved

- Locked same-parent-domain cookie setup with configurable secure/samesite behavior for session + CSRF cookies in SecurityConfig.java and application.properties.
- Kept Vite env-driven Firebase model and updated env template for separate API origin in TEMPLATE_.env.example.
- Strengthened frontend foundation:
  - request timeout + request ID header in http.ts
  - expanded typed API surface in api.ts
  - improved auth flow with popup fallback to redirect and redirect-result resume in auth-context.tsx
- Improved page migration quality:
  - header search now route-driven and role checks fixed for `ADMIN` in app-header.tsx
  - home page now uses backend-correct search/category endpoints and location-aware search in home-page.tsx
  - admin page upgraded to production-style tabbed operations (users/products/orders with pagination + inline mutations) in admin-page.tsx
  - type alignment with backend DTO reality in api.ts
- Deployment pipeline upgraded for GCS + Cloud CDN:
  - release-based promotion
  - rollback mode via `workflow_dispatch`
  - cache policy split (immutable assets vs revalidated shell)
  - targeted CDN invalidation  
  in /.github/workflows/frontend-deploy.yml.



### Next iterative concerns (recommended for Iteration 2)

1. Split large JS bundle (~566 KB) via route-level lazy loading.
2. Add error boundaries + retry UX for key queries.
3. Add real `Tabs/Table/Select` primitives from shadcn once cert trust is fixed.
4. Add Playwright smoke tests for login/cart/checkout/admin critical paths.
5. Add backend env profiles for local non-HTTPS cookie fallback vs prod strict cookies.




---



 npm run dev -- --host 0.0.0.0 --port 5173



### What I changed

- Rebuilt top navigation to match the original style (gradient navbar, location pill, rounded search, stronger actions) in app-header.tsx.
- Added a richer visual design system (original color tokens, shadows, hero, category chips, product card behavior, button styles, login visuals, cart/settings/footer classes) in index.css.
- Upgraded home experience (hero section + category strip + product card polish + location label) in home-page.tsx.
- Redesigned login screen to closely match original premium auth card style in login-page.tsx.
- Improved cart visuals (images, quantity controls, summary CTA styling) in cart-page.tsx.
- Improved checkout form and summary presentation in checkout-page.tsx.
- Improved settings/profile/orders/product detail page styling and hierarchy:
  - settings-page.tsx
  - profile-page.tsx
  - orders-page.tsx
  - product-detail-page.tsx
- Upgraded shell/footer polish:
  - app-shell.tsx
  - app-footer.tsx

### Validation

- Lint: passed (warnings only, no errors)
- Build: passed successfully

### About browser interaction

- I opened the app in the in-editor browser and iterated styling live.
- Playwright MCP interaction is not available in this current toolset/session, so I couldn’t run automated browser interaction flows from Playwright here.

If you want, next iteration I’ll do a strict “pixel-pass” on the remaining pages against each original static page one-by-one (starting with Admin and Settings), so the React version becomes near-identical plus cleaner UX.



---




### Why it was failing
Your auto-detect used location-context.tsx with `https://ip-api.com/json`.  
That provider is unreliable for this browser setup (often blocked/limited on HTTPS), so city stayed at **All Cities**.

### What I changed
- Replaced single-provider lookup with resilient fallback providers:
  - `https://ipapi.co/json/`
  - `https://ipwho.is/`
- Added timeout handling and normalization.
- Added logic to retry detection when previously saved value is placeholder (`All Cities`).
- Added manual refresh trigger by clicking the location pill in header.

Updated files:
- location-context.tsx
- app-header.tsx
- index.css

### Build status
- Production build succeeds.

If it still shows old value once, hard refresh the page (or clear `fg_location` in localStorage), then it will re-detect.

Made changes.

User: Now I can't even even able to click any element /buttons in the UI 



```

```


Ran terminal command: Set-Location "c:\Users\2472081\OneDrive - Cognizant\Project\fresh-greens\frontend"; npm run build

Fixed — this was likely an overlay pointer-events issue.

I applied a UI interaction fix in index.css:

- Disabled pointer capture on decorative login overlays:
  - `.login-container::before`
  - `.login-container::after`
- Prevented the toast host layer from blocking the page:
  - `[data-sonner-toaster] { pointer-events: none; }`
  - `[data-sonner-toast] { pointer-events: auto; }`

Build passes after change.

---


City detection was updating in the header, but location was not consistently applied to the product list.


- Location filtering now applies even when there is no keyword search.
- If city/pincode is set, product fetch uses search endpoint with location.
- Added client-side safety filter so displayed cards match selected city/pincode.
- Added a visible “Showing produce for …” indicator in hero section.

Build is passing.

Please refresh and test again on Home page:
1. Click the location pill (refresh detect).
2. Confirm city changes.
3. Product grid should now reflect that location.

If you want, next I can add a manual location picker (city + pincode modal) like the original static UI.

Made changes.

User: add a manual location picker (city + pincode modal) like the original static UI.




```

```


Implemented. I added a manual location picker modal (city + pincode) in the header, matching the original static flow and keeping auto-detect as an option.

### What changed
- Added modal open/close state and draft fields.
- Added manual `city` + `pincode` inputs.
- Added `Apply`, `Cancel`, and `Auto detect` actions.
- Wired `Apply` to `setLocation(...)`.
- Kept desktop location pill and added mobile location button to open the modal.

Updated file:
- app-header.tsx

### Validation
- Ran production build successfully after changes.

If you want, I can next add:
1) required-field validation (e.g., city mandatory, pincode must be 6 digits), and  
2) a small “Use current location” icon inside the modal input row to match legacy UX even closer.





implement spring cloud gateway

---


all the api request/ response should be routed through the Spring cloud api gateway


---

admin-console -> gateway -> server

---

customer-portal -> gateway -> server


---


tell me whether this project architecture is industry standard and scalable?