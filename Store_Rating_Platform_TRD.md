# Technical Requirement Document: Store Rating Platform

**Version:** 1.0
**Status:** Draft for V1 (MVP)
**Companion to:** Store Rating Platform PRD v1.0
**Owner:** Engineering

---

## 1. System Architecture Overview

A standard three-tier monolith is the right shape for V1. This is a CRUD-heavy, moderate-traffic internal-facing platform — not a system that needs microservices, event buses, or multi-region infrastructure. Overbuilding here would slow delivery and add operational burden with no corresponding benefit.

```
┌─────────────────┐        HTTPS/JSON        ┌──────────────────────┐        SQL        ┌─────────────────┐
│   React SPA      │ ───────────────────────▶ │  Node.js Backend API  │ ────────────────▶ │   PostgreSQL     │
│  (Frontend)       │ ◀─────────────────────── │  (Express/NestJS)      │ ◀──────────────── │   (Database)     │
└─────────────────┘        REST API          └──────────────────────┘                    └─────────────────┘
```

- **Frontend:** React SPA, calls backend via REST over HTTPS.
- **Backend:** Single Node.js service (Express or NestJS) exposing a REST API, handling auth, validation, and business logic.
- **Database:** PostgreSQL, single instance for V1, with room to add a read replica later if read load grows.
- **Deployment:** Frontend and backend deployed as two separate artifacts (static build + API server) behind a reverse proxy (e.g., Nginx) or a managed platform (e.g., Render/Railway/EC2 + a managed Postgres). No container orchestration (Kubernetes) needed at this scale — a single backend instance, or two behind a load balancer for basic redundancy, is sufficient.

This architecture deliberately avoids: microservices, message queues, caching layers, and multi-database setups. None are justified by the current feature set or expected load. They can be introduced later if specific bottlenecks appear (see Section 8).

---

## 2. Frontend Responsibilities (React)

The frontend owns presentation, client-side validation (as a UX convenience, never as the source of truth), routing/navigation by role, and state management for the current session.

**Responsibilities:**
- Render role-specific views: Admin Dashboard, Store Listing (Normal User), Store Owner Dashboard.
- Client-side form validation mirroring backend rules (Name length, Address length, Password complexity, Email format) — fast feedback before hitting the API.
- Route guarding: redirect unauthenticated users to login; block role-mismatched routes (e.g., Normal User cannot navigate to `/admin`).
- Store and refresh the auth token (see Section 6) and attach it to all API calls.
- Handle API error responses gracefully (validation errors, 401/403, empty states).
- Client-side sorting/filtering can be done for small result sets, but primary sort/filter/search should be delegated to the backend via query params (see Section 5) so behavior is consistent and scalable as data grows.

**Explicitly not the frontend's job:**
- Enforcing authorization (that's a backend responsibility — frontend guarding is UX only, not security).
- Computing aggregate ratings (backend/DB computes and returns them).
- Persisting any sensitive data client-side beyond the auth token (no local caching of other users' data).

**Suggested structure:** Standard React SPA with a router (React Router), a lightweight state solution (Context API or a small store like Zustand — Redux is likely overengineering for this scope), and a thin API client layer (e.g., Axios wrapper with interceptors for auth headers and 401 handling).

---

## 3. Backend Responsibilities

The backend is the single source of truth for business rules, validation, and authorization. It owns:

- **Authentication:** login, signup, password hashing/verification, token issuance.
- **Authorization:** role-based access control enforced on every protected route/controller.
- **Validation:** re-validates all input server-side regardless of frontend validation (Name, Address, Password, Email, Rating range).
- **Business logic:**
  - Rating upsert logic (create if not exists for user+store, update if exists) rather than separate create/update endpoints the client has to choose between.
  - Aggregate rating calculation (average rating per store), computed via SQL aggregation rather than maintained as a denormalized counter for V1 — simpler and correct-by-construction, revisit only if performance requires denormalization (see Section 8).
  - Dashboard counts (total users, stores, ratings) via simple aggregate queries.
- **Data access:** all DB interaction goes through a single backend layer — no direct frontend-to-DB access, ever.
- **Consistent API responses:** standard success/error envelope, consistent HTTP status codes.

**Suggested internal structure (regardless of Express/NestJS/Loopback choice):**
- `controllers/routes` — HTTP layer, request/response shaping
- `services` — business logic
- `repositories/models` — DB access (via an ORM/query builder)
- `middleware` — auth guard, role guard, validation, error handler
- `validators/schemas` — request validation (e.g., Zod, Joi, or class-validator if NestJS)

---

## 4. Database Schema Proposal

PostgreSQL, normalized, four core tables. No over-normalization beyond what's needed, no premature sharding/partitioning.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | VARCHAR(60) | 20–60 char constraint enforced at app layer (and optionally a CHECK constraint) |
| email | VARCHAR(255) UNIQUE NOT NULL | |
| password_hash | VARCHAR(255) NOT NULL | bcrypt/argon2 hash, never plaintext |
| address | VARCHAR(400) | nullable only if a role doesn't require it |
| role | ENUM('ADMIN','NORMAL_USER','STORE_OWNER') NOT NULL | |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

### `stores`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | VARCHAR(60) | |
| email | VARCHAR(255) | store contact email |
| address | VARCHAR(400) | |
| owner_id | UUID (FK → users.id) NULLABLE | nullable to support the "unassigned store" open question from PRD §8; if business decides otherwise, make NOT NULL |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

### `ratings`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users.id) NOT NULL | |
| store_id | UUID (FK → stores.id) NOT NULL | |
| value | SMALLINT NOT NULL | CHECK (value BETWEEN 1 AND 5) |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |
| | | **UNIQUE (user_id, store_id)** — enforces one rating per user per store at the DB level, backing the "modify not duplicate" edge case |

### Indexes
- `users(email)` — unique index, used on every login/signup check.
- `stores(name)`, `stores(address)` — for search/filter (or a single trigram/GIN index if search needs to be more flexible later).
- `ratings(store_id)` — for computing per-store aggregates quickly.
- `ratings(user_id, store_id)` — backed by the unique constraint already.

### Notes
- **owner_id nullability** and the store-owner-to-store cardinality (1:1 vs 1:many) are open PRD questions — schema above defaults to 1:many (a `users` row can own multiple `stores`) since it's the more flexible default and costs nothing extra; confirm with product before locking behavior.
- Average rating is **not stored as a column** on `stores` for V1 — it's computed via `AVG(value)` over `ratings WHERE store_id = ?`. This avoids sync bugs between a cached value and the source of truth. Revisit only if this query becomes a measured bottleneck (see Section 8).
- No soft-delete columns (`deleted_at`) for V1 since the PRD scopes V1 as create+view only, with no delete functionality. Add if delete is introduced later.

---

## 5. API Structure

REST, JSON, versioned under `/api/v1`. Resource-oriented, standard HTTP verbs and status codes.

### Auth
```
POST   /api/v1/auth/signup          Normal user self-registration
POST   /api/v1/auth/login           All roles
POST   /api/v1/auth/logout          Invalidate/clear session
PATCH  /api/v1/auth/password        Update own password (authenticated)
```

### Users (Admin only, except self-service password above)
```
GET    /api/v1/users                List users; query params: ?name=&email=&address=&role=&sort=&order=
POST   /api/v1/users                Create user (Admin creates Normal User, Admin, or Store Owner)
GET    /api/v1/users/:id            Get user detail (includes rating if Store Owner)
```

### Stores
```
GET    /api/v1/stores               List stores; query params: ?name=&address=&sort=&order=
                                     Normal User: includes overall rating + their own rating
                                     Admin: includes overall rating
POST   /api/v1/stores               Create store (Admin only)
GET    /api/v1/stores/:id           Store detail
```

### Ratings
```
POST   /api/v1/stores/:id/ratings   Submit or update rating (upsert) — body: { value: 1-5 }
                                     Normal User only, own rating for that store
```

### Dashboards
```
GET    /api/v1/admin/dashboard        Admin: total users, total stores, total ratings
GET    /api/v1/store-owner/dashboard  Store Owner: avg rating + list of raters for their store(s)
```

**Conventions:**
- Auth via `Authorization: Bearer <token>` header on all protected routes.
- Pagination via `?page=&limit=` on all list endpoints (default sensible limit, e.g., 20) to keep response sizes predictable as data grows.
- Sorting via `?sort=<field>&order=asc|desc`, validated against an allow-list of sortable columns per resource (never pass raw client input into a SQL `ORDER BY`).
- Errors follow a consistent shape: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {...} } }`.
- The rating endpoint is a single upsert (`POST .../ratings`) rather than separate create/update routes — matches the DB's unique constraint and removes an unnecessary branching decision from the frontend.

---

## 6. Authentication Strategy

**Approach:** Stateless JWT-based authentication, kept deliberately simple.

- On login/signup, backend issues a signed JWT (short-lived access token, e.g., 1 hour) containing `userId` and `role`.
- Token stored client-side in memory or an `httpOnly` cookie (cookie preferred over `localStorage` to reduce XSS token-theft risk).
- No refresh-token rotation system, no session store, no OAuth for V1 — the PRD explicitly excludes social login and this isn't a high-security financial platform, so a straightforward short-lived JWT plus re-login on expiry is appropriate. A refresh-token flow can be added later without a schema change if session length becomes a UX complaint.
- Passwords hashed with **bcrypt** (or argon2), never stored or logged in plaintext.
- Authorization enforced via a role-guard middleware checked against the JWT's `role` claim on every protected route — never trust a role passed in the request body.
- Rate limiting on `/auth/login` (e.g., basic IP/account-based throttling) to blunt brute-force attempts — lightweight, not a full WAF.

This is intentionally not over-engineered: no multi-factor auth, no SSO, no complex permission matrix beyond the three fixed roles — none of that is called for by the PRD.

---

## 7. Third-Party Dependencies

Kept minimal and mainstream — each one earns its place; nothing speculative.

| Purpose | Library/Service | Why |
|---|---|---|
| Backend framework | Express or NestJS | Per tech-stack requirement; NestJS if the team wants structure/DI out of the box, Express if the team prefers minimal footprint |
| ORM / query builder | Prisma (or TypeORM/Knex) | Type-safe schema, migrations, avoids hand-rolled SQL for CRUD while still allowing raw queries for aggregates |
| Password hashing | bcrypt | Industry standard, no reason to deviate |
| JWT handling | jsonwebtoken | Standard, well-maintained |
| Validation | Zod (or Joi / class-validator) | Server-side request validation matching the PRD's rules |
| Frontend HTTP client | Axios | Interceptors simplify auth header + 401 handling |
| Frontend routing | React Router | Standard for SPA role-based routing |
| Frontend state | React Context (+ hooks), or Zustand if state grows | Redux would be overengineering at this scope |
| DB | PostgreSQL | Per requirement |
| Migrations | Prisma Migrate (or node-pg-migrate) | Version-controlled schema changes |
| Testing | Jest (+ Supertest for API, React Testing Library for frontend) | Standard, sufficient |

**Deliberately excluded for V1:** Redis/caching layer, message queues (RabbitMQ/Kafka), search engines (Elasticsearch), CDN-backed image storage (no store images in V1), third-party email service (no email flows in V1 per PRD non-goals), Kubernetes/service mesh.

---

## 8. Scalability Considerations

V1 should be built correctly, not built big. The goal is a codebase and schema that scale up cleanly when/if the need arises, without paying that complexity cost now.

**What's already scale-friendly by design:**
- Computing average ratings via SQL `AVG()` with an index on `ratings(store_id)` is fast at moderate scale (tens of thousands of ratings per store is well within Postgres's comfort zone with an index).
- Pagination + backend-driven sort/filter (Section 5) means list endpoints stay fast as row counts grow, instead of shipping entire tables to the client.
- Stateless JWT auth means the backend can be horizontally scaled (multiple instances behind a load balancer) without a shared session store, if traffic grows.
- Clear separation of concerns (controllers/services/repositories) means individual layers can be optimized or extracted later without a full rewrite.

**Deferred until actually needed (with a clear trigger for each):**
- **Denormalized/cached average rating on `stores`:** only if the `AVG()` aggregate query is measured as a hot path bottleneck (e.g., via slow query logs) — add a `average_rating` column updated via a DB trigger or application-level recalculation on write.
- **Read replica for PostgreSQL:** only if read traffic (store browsing) meaningfully outpaces write traffic and single-instance CPU/IO becomes a measured constraint.
- **Caching layer (Redis):** only if specific endpoints (e.g., store listing) show repeated identical reads at high frequency; not justified for V1's expected traffic.
- **Full-text/trigram search:** only if simple `ILIKE`/indexed searches on Name/Address become too slow or too limited for real usage patterns.
- **Splitting the monolith:** only if a specific module (e.g., ratings ingestion) develops load characteristics genuinely different from the rest of the app — not a default assumption.

**Guardrails to build in now (cheap, prevents future pain):**
- Database migrations from day one (never hand-edit schema in prod).
- Indexes on all foreign keys and frequently filtered/sorted columns from the start (listed in Section 4).
- Environment-based config (no hardcoded secrets/connection strings).
- Structured logging (even basic) so future performance issues are diagnosable rather than guessed at.

---

## 9. Open Technical Questions (mirrors PRD §8)

1. Store-owner-to-store cardinality (1:1 vs 1:many) affects whether `owner_id` should carry a uniqueness constraint — needs product decision before schema is finalized.
2. Whether "unassigned" stores are a real state to support, or whether store creation should require an owner — affects `owner_id` nullability.
3. Whether future delete functionality is likely soon after V1 — affects whether to add soft-delete columns now vs. later (currently recommended: skip for V1, per PRD scope).
