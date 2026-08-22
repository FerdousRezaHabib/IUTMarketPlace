# E-Commerce Project — Trimmed Scope (Monolith + Reviews Microservice)

## Context

The original outline (`project_outline.md` / PDF) proposed a full microservices split (Users, Products, Inventory, Cart, Orders, Payments, Reviews, Notifications) with Spring Cloud Gateway, OpenFeign, Redis, and Kafka/RabbitMQ. For a 3-person student team, that is significantly more infrastructure work than business-logic work, and several of the technologies (message broker, real payment gateway, service discovery/gateway) have no real payoff at this scale.

The course/assignment requires *some* use of microservices, but there is no numeric minimum specified in the project's own documents — this is the team's own proposal, not an externally imposed rubric. Given that, the team decided to minimize the microservices footprint: one monolith holding everything with no independent-service justification, plus exactly one real microservice for the one feature that has a genuine, honest reason to be separate (no shared transactions, not on the critical path, independent read/write pattern) — **Reviews**.

This plan captures the resulting scope so it can be shared with teammates/instructor before any code is written.

**Feature-level trim:** the original "Main Features" list has no hedging language (unlike the tech/architecture list, which said "may include"), so features were not cut wholesale except one. Wishlist is removed entirely — it duplicates Cart's save-a-product-against-a-user behavior with no distinct logic of its own, so it added a named feature's worth of surface area for no unique value. Every other listed feature is kept but implemented at minimum depth: Notifications has no dedicated entity (status is just visible on the order/account page), Order status tracking is a single status field with no history timeline, Search/filter supports only category + price sort (no combined/multi-field search), and Admin dashboard is basic CRUD with no analytics.

## Recommended Scope

### Architecture
- **1 monolith** (Spring Boot) containing: Users/Auth, Products, Cart, Orders, Payment (mocked internally), Inventory/Stock, Order status tracking, Admin dashboard.
- **1 microservice**: Reviews & Ratings — separate Spring Boot app, separate database/schema, called by the monolith over plain REST (`GET /reviews/product/{id}`, `POST /reviews`).
- No API gateway, no service discovery (Eureka/Consul) — monolith calls Reviews directly via a configured URL. Justified because 2 deployables don't need dynamic routing.
- No message broker (Kafka/RabbitMQ) — dropped entirely; notifications become simple in-app records written directly by the monolith, not event-driven.
- No Redis — dropped unless a concrete caching need shows up during build (e.g. product listing under real load, which won't happen in a student demo).
- Payment stays **inside the monolith** as an internal mock (flips order status, writes a payment record) rather than a separate service — resolves the earlier contradiction (trivial logic doesn't justify network-boundary overhead).

### Feature list and where it lives
| Feature | Location | Notes |
|---|---|---|
| Registration, login, JWT auth, role-based authz | Monolith | Foundation; everything else depends on it |
| Product listing (categories, price, desc, images, stock) | Monolith | |
| Search/sort/filter | Monolith | Category filter + price sort only, plain SQL, no multi-field/combined search, no search engine |
| Shopping cart | Monolith | |
| Order placement + history | Monolith | |
| Payment | Monolith (mocked) | One endpoint/internal call, flips status, no gateway/webhooks/retries |
| Inventory/stock | Monolith | Naive decrement, no concurrency/race-condition handling — explicitly scoped out, state this in the report |
| Order status tracking | Monolith | Just a status field that updates (Pending/Paid/Shipped/etc.), no separate tracking-history entity |
| Notifications | Monolith | Status visible directly on the order/account page — no dedicated notification entity, no email, no broker |
| Admin dashboard | Monolith | Basic CRUD screens for products + orders, no analytics/charts |
| **Reviews & ratings** | **Separate microservice** | Own DB, own container, called read-only by product pages |

### Technologies kept vs. dropped from the original list
- **Kept**: Java + Spring Boot, Spring Security + JWT, MySQL/PostgreSQL, React.js, Swagger/OpenAPI, Docker + Docker Compose, Git + GitHub.
- **Dropped**: Spring Cloud Gateway, Eureka/service discovery, OpenFeign (plain REST client is enough for one inter-service call), Redis, Kafka/RabbitMQ, real payment gateway.

### Docker Compose footprint
4 containers: `monolith`, `reviews-service`, `monolith-db`, `reviews-db`. Each service gets its own database instance (not just a separate schema in a shared container) — this is the actual industry norm for microservices data ownership (no shared failure domain, no shared connection pool), and the marginal Compose cost of a second DB container is negligible compared to the payoff of a clean, caveat-free "each service owns its data" story.

## Implementation Details

### Repository layout
Two independent Maven/Gradle Spring Boot projects in this working directory, plus a root Compose file:
```
/monolith/              # Spring Boot app
/reviews-service/       # Spring Boot app
/frontend/              # React app (run locally, not containerized)
/docker-compose.yml     # 4 services: monolith, reviews-service, monolith-db, reviews-db
```
No shared code/module between the two backend apps — if a DTO shape needs to match (e.g. review payload), duplicate the small class in both rather than introducing a shared library. A shared library between "independent" services undermines the independence you're trying to demonstrate.

### Monolith — package structure
`com.xyz.ecommerce` with one package per feature area, not one giant package: `auth`, `user`, `product`, `cart`, `order`, `payment`, `inventory`, `admin`. Each package holds its own `Controller`, `Service`, `Repository`, `Entity`/`DTO` classes. This keeps the monolith internally organized by bounded context even though it's one deployable — makes it easy to explain "here's where we'd cut the next service if we had to."

### Monolith — entities (minimum fields)
- **User**: id, email, passwordHash, fullName, role (CUSTOMER/ADMIN), createdAt
- **Product**: id, name, description, price, category, imageUrl, stockQuantity
- **CartItem**: id, userId, productId, quantity
- **Order**: id, userId, status (PENDING/PAID/SHIPPED/CANCELLED), totalAmount, createdAt
- **OrderItem**: id, orderId, productId, quantity, priceAtPurchase
- **Payment**: id, orderId, amount, status (SUCCESS/FAILED), createdAt

No separate `Wishlist`, `Notification`, or `OrderStatusHistory` entities — deliberately cut per the scope trim above.

### Monolith — REST endpoints (minimum set)
- `POST /auth/register`, `POST /auth/login` (returns JWT)
- `GET /products`, `GET /products/{id}`, `GET /products?category=&sort=price`, `POST /products` (admin), `PUT /products/{id}` (admin), `DELETE /products/{id}` (admin)
- `GET /cart`, `POST /cart/items`, `DELETE /cart/items/{id}`
- `POST /orders` (checkout: reads cart, decrements stock, calls internal payment mock, creates order + order items, clears cart), `GET /orders` (current user's history), `GET /orders/{id}`, `PUT /orders/{id}/status` (admin)
- `GET /admin/orders`, `GET /admin/products` (thin wrappers/reuses product+order endpoints with admin-only access)

### Reviews microservice — entity & endpoints
- **Review**: id, productId, userId, rating (1–5), comment, createdAt
- `POST /reviews` (auth required — read the JWT, don't re-validate against the monolith's user table, just trust the token's subject claim)
- `GET /reviews/product/{productId}` (list + average rating, public, no auth)

### Cross-service call
Monolith's product-detail endpoint calls `GET http://reviews-service:8082/reviews/product/{id}` (service name resolved via Docker Compose network) when building the product detail response. Wrap this call with a short timeout (e.g. 2s) and a fallback to an empty review list on failure — this is the one place a network call replaces what would've been a function call, so it needs to fail gracefully instead of breaking the product page.

### JWT approach across the two apps
Monolith issues and validates JWTs (its own signing secret). Reviews-service does NOT re-implement login — it just validates the same JWT signature (share the signing secret via env var in Compose) to identify the calling user for `POST /reviews`. This avoids building a second auth system while still keeping Reviews as a genuinely separate deployable.

### Docker Compose — specifics
- `monolith-db`: MySQL/Postgres image, env vars for db name `ecommerce_core`, volume `monolith-db-data`
- `reviews-db`: MySQL/Postgres image, env vars for db name `ecommerce_reviews`, volume `reviews-db-data`
- `monolith`: builds from `/monolith`, depends_on `monolith-db`, env vars for DB connection + JWT secret, exposes port 8080
- `reviews-service`: builds from `/reviews-service`, depends_on `reviews-db`, env vars for DB connection + same JWT secret, exposes port 8082
- All four on one Compose network so services resolve each other by container name

### Build order (do in this sequence)
1. Monolith skeleton + `monolith-db` in Compose, confirm it boots and connects to its DB
2. Auth (register/login/JWT) — everything else needs this to test as a real user
3. Product CRUD + category/price filter
4. Cart
5. Reviews-service skeleton + `reviews-db` in Compose, confirm it boots independently; wire the monolith's product-detail call to it (with fallback)
6. Inventory decrement logic (naive, inside Product/Order flow)
7. Order placement (cart → stock decrement → payment mock → order created) — this is the most involved single piece, build it last among "core" features since it depends on everything above
8. Order status update + display (admin sets status, customer sees it)
9. Admin dashboard screens (thin layer over product/order endpoints already built)
10. Frontend wiring throughout — realistically start frontend work in parallel once Auth + Products exist, rather than waiting for step 9

## Team Split (3 Parts)

Part 1 is a hard prerequisite for Parts 2 and 3 — both depend on the auth/security pattern and skeleton it establishes. Once Part 1 is done, Parts 2 and 3 run mostly in parallel; the one exception is Part 3's Admin dashboard, which needs Part 2's product/order endpoints to exist first. Reviews-service (also in Part 3) is a fully separate deployable and does not need Part 2 to be done.

### Part 1 — Initialize & Foundation (blocks everyone else)
- Spring Boot project skeleton for the monolith, package structure (`auth`, `user`, `product`, `cart`, `order`, `payment`, `inventory`, `admin`)
- Docker Compose skeleton: all 4 containers defined (`monolith`, `reviews-service`, `monolith-db`, `reviews-db`), booted with empty/stub services before real logic exists
- `monolith-db` connection wired up
- Auth module: register, login, JWT issuing/validation, role-based (CUSTOMER/ADMIN) authorization
- Swagger/OpenAPI wired in from the start
- Git repo initialized, initial commit, README stub

### Part 2 — Core Commerce Flow (depends on Part 1)
- Product CRUD + category/price filter
- Cart
- Inventory decrement logic (naive, no concurrency handling — per scope)
- Payment mock
- Order placement (cart → stock decrement → payment mock → order created)
- Order status update + display

### Part 3 — Reviews Microservice + Admin + Frontend Integration (depends on Part 1; Reviews itself doesn't need Part 2)
- Reviews-service: own Spring Boot app, own DB, JWT validation reusing Part 1's signing secret, `POST /reviews` + `GET /reviews/product/{id}`
- Cross-service wiring: monolith's product-detail call to reviews-service, with timeout + graceful fallback
- Admin dashboard screens (waits on Part 2's endpoints)
- React frontend wiring across all features
- Final Docker Compose integration pass + end-to-end verification

## Frontend Style

Scope note: web application only (desktop-first browser use), not a native mobile app — this trims how much responsive/mobile-specific design work is justified.

**Typography & Color**
- Font: Inter (Google Fonts / system-ui fallback).
- Palette: off-white background, white surfaces, near-black primary text, muted gray secondary text, light gray borders.
- One accent color: indigo (`#4F46E5`).
- Semantic colors only where needed: green (success/available), red (error/destructive/out-of-stock), amber (pending/warning).

**Layout & Spacing**
- 8px-based spacing scale, consistent max-width container (e.g. 1280px), generous whitespace between sections.
- Responsive grid: product listing goes 4 columns (desktop) → 2 columns (tablet/mobile), single breakpoint around 768px. No separate mobile-first redesign per page.

**Components**
- One primary button style (solid, accent color) + one secondary/outline style. Moderate border radius, consistent height. No pill shapes.
- Product card: image, name, category, price, stock badge, one action button. Subtle border, hover = slight shadow/lift.
- Navbar: brand left, nav links center-left, cart/account right. Subtle bottom border, no heavy shadow. Below 768px, collapses into a simple hamburger dropdown — no drawer animation.
- Forms: clear labels, comfortable input height, subtle border, visible focus outline (accent color), inline error text below the field.
- Lucide icons, used sparingly (cart, search, user, chevron, star for ratings).
- Broken product images fall back to a plain neutral placeholder box.

**States (only where it matters)**
- Full attention (loading/empty/error) on: product listing, cart, checkout.
- Everywhere else (admin tables, order history): plain "Loading…" text and plain "No results" text — no custom empty-state illustrations.
- Disabled/out-of-stock buttons: grayed out, no click.

**Motion**
- Exactly two transitions: button hover (~100ms) and product card hover (~100ms). No modal/page/nav transition animations.

**Explicitly not doing**
- No skeleton loaders — plain spinner or loading text.
- No mobile drawer nav or touch-target-specific redesign.
- No per-component 9-state design system (loading/empty/error/success/disabled/hover/focus/selected/out-of-stock) — reserved for the 3 core commerce screens only.

Rationale: this gives the UI a consistent, intentional look (single accent color, restrained shadows, real spacing/typography hierarchy) without asking a 3-person team to hand-build a full design system on top of two backend services and Docker Compose — same triage logic already applied to the backend scope above.

## Verification
Before writing code:
- Confirm no rubric document exists with a stricter minimum service count than 2 (monolith + Reviews) — if one turns up, scope may need revisiting.
- Confirm teammates agree to the feature cuts (Wishlist removed; Notifications, Order status, Search/filter, Admin dashboard implemented at minimum depth).

Once implementation begins, verify at each build-order milestone rather than only at the end:
- Monolith boots, connects to `monolith-db`, and its endpoints are visible/callable via Swagger UI
- A user can register, log in, and receive a JWT; a protected endpoint rejects requests without one
- Product CRUD works and category/price filtering returns correct subsets
- `reviews-service` boots independently and connects to `reviews-db` with no dependency on the monolith being up
- From inside `docker-compose up`, the monolith's product-detail call successfully reaches `reviews-service` by container name, and returns an empty list gracefully (not an error) if reviews-service is stopped
- A full checkout (add to cart → place order → mock payment → stock decremented → order visible in history with correct status) works end-to-end
- Admin can update an order's status and the customer sees the updated status
