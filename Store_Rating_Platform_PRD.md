# Product Requirement Document: Store Rating Platform

**Version:** 1.0
**Status:** Draft for V1 (MVP)
**Owner:** Product

---

## 1. Problem Statement

Consumers currently have no centralized, trustworthy way to rate and discover stores registered on a single platform, and store owners have no simple mechanism to understand how their store is perceived through structured feedback. Store discovery and reputation tracking today is fragmented, informal, or nonexistent for this platform's ecosystem.

We need a single web application where:
- Normal users can discover stores and leave a 1–5 rating.
- Store owners can see how their store is rated and by whom.
- A system administrator can manage the platform's users and stores, and monitor overall platform health.

Without this, there is no shared source of truth for store quality, no accountability loop for store owners, and no easy way for the platform operator to manage growth (new stores, new users) in one place.

---

## 2. Target Users

| Role | Description | Primary Need |
|---|---|---|
| **System Administrator** | Platform operator managing the ecosystem | Add/manage stores and users; monitor platform-wide activity |
| **Normal User** | End consumer browsing and rating stores | Find stores, submit/update honest 1–5 ratings |
| **Store Owner** | Owner/manager of a store listed on the platform | Understand store reputation via aggregated rating and rater list |

All three roles share a single login system, with functionality gated by role after authentication.

---

## 3. Core User Flows

### 3.1 Authentication & Onboarding
- **Normal User Signup:** User lands on signup page → enters Name, Email, Address, Password → validation passes → account created with role "Normal User" → redirected to login.
- **Login (all roles):** User enters Email + Password → system authenticates → redirected to role-specific home (Admin Dashboard / Store Listing / Store Owner Dashboard).
- **Password Update (Normal User & Store Owner):** Logged-in user goes to account settings → enters current + new password (meeting validation rules) → password updated → confirmation shown.
- **Logout (all roles):** Available from any authenticated screen → session ends → redirected to login.

### 3.2 Normal User: Discover & Rate
1. User logs in → lands on Store Listing page.
2. User searches/filters stores by Name and/or Address.
3. User views store cards/rows showing: Store Name, Address, Overall Rating, their own Submitted Rating (if any).
4. User clicks "Rate" on a store they haven't rated → selects 1–5 → submits → overall rating recalculates.
5. User clicks "Modify" on a store they've already rated → updates rating → overall rating recalculates.

### 3.3 System Administrator: Platform Management
1. Admin logs in → lands on Dashboard showing: Total Users, Total Stores, Total Ratings.
2. Admin navigates to "Stores" → views list (Name, Email, Address, Rating) → applies filters (Name/Email/Address) → sorts columns.
3. Admin clicks "Add Store" → enters store details → store created.
4. Admin navigates to "Users" → views list (Name, Email, Address, Role) → applies filters (Name/Email/Address/Role) → sorts columns.
5. Admin clicks "Add User" → enters Name, Email, Password, Address, selects Role (Normal User or Admin) → user created.
6. Admin clicks into any user's detail view → sees Name, Email, Address, Role (+ Rating, if the user is a Store Owner).

### 3.4 Store Owner: Reputation Tracking
1. Store Owner logs in → lands on Dashboard.
2. Dashboard displays: Average Rating of their store, and a list of users who have rated their store (with individual ratings).

---

## 4. Feature List

### 4.1 MVP (V1 — build now)

**Authentication & Account**
- Single login for all roles (email + password)
- Normal user self-signup (Name, Email, Address, Password)
- Password update for logged-in Normal Users and Store Owners
- Logout for all roles
- Server-side session/token-based auth

**System Administrator**
- Dashboard: total users, total stores, total ratings (simple counts)
- Add new store (Name, Email, Address; assign Store Owner)
- Add new user (Normal User or Admin) with Name, Email, Password, Address
- Store list view: Name, Email, Address, Rating — sortable, filterable (Name/Email/Address)
- User list view: Name, Email, Address, Role — sortable, filterable (Name/Email/Address/Role)
- User detail view (includes Rating if Store Owner)

**Normal User**
- Browse all registered stores
- Search/filter stores by Name and Address
- View: Store Name, Address, Overall Rating, own submitted rating
- Submit a rating (1–5) for a store
- Modify a previously submitted rating
- Sortable store listing (by Name, Rating, etc.)

**Store Owner**
- Dashboard: average store rating
- List of users who rated their store, with each user's rating

**Cross-cutting**
- Form validation exactly as specified:
  - Name: 20–60 characters
  - Address: max 400 characters
  - Password: 8–16 characters, ≥1 uppercase, ≥1 special character
  - Email: standard email format validation
- Sorting (asc/desc) on key list columns (Name, Email, Rating, etc.)
- Role-based access control (route/API guarding by role)
- Basic responsive layout (usable on desktop and mobile browsers)

### 4.2 Future (Post-V1 — explicitly out of scope for now)

- Store owner replies to ratings / reviews with text comments
- Rating history / audit trail per user per store
- Email notifications (new rating received, password reset via email link)
- "Forgot password" / self-service password reset flow
- Store categories, tags, or geolocation-based discovery
- Pagination beyond basic page controls (advanced infinite scroll, etc.)
- Analytics/reporting exports (CSV/PDF) for admin
- Bulk user/store import
- Multi-language support
- Store images/photo uploads
- Admin ability to edit/delete existing users or stores
- Rate limiting / anti-fraud detection on ratings
- Social login (Google/Facebook OAuth)

---

## 5. Edge Cases

| Area | Edge Case | Expected Behavior |
|---|---|---|
| Signup | Email already registered | Reject with clear error; no duplicate accounts |
| Signup/Add User | Name/Address/Password fails validation | Inline field-level error, block submission |
| Rating | User tries to rate the same store twice | Second action treated as "modify," not a duplicate row |
| Rating | User submits rating outside 1–5 | Rejected client- and server-side |
| Rating | Store has zero ratings | Overall Rating displays as "No ratings yet" (not 0 or error) |
| Store Owner | Store owner account has no associated store yet | Dashboard shows empty state, not an error |
| Admin | Admin tries to add a user with an existing email | Rejected with clear error |
| Admin | Admin adds a store without assigning a valid Store Owner | Block creation, or explicitly support "unassigned" store with a defined behavior (must be decided before build) |
| Search/Filter | No results match filter/search | Show empty state, not a blank screen |
| Auth | Expired/invalid session | Redirect to login with a session-expired message |
| Auth | Role-mismatched access (e.g., Normal User hits admin route directly) | Blocked at both frontend routing and backend API level (403) |
| Password Update | New password same as old | Allow (unless product later decides to block it) — not blocking for V1 |
| Sorting | Sorting on columns with ties (e.g., equal ratings) | Stable, deterministic secondary sort (e.g., by Name) |

---

## 6. Non-Goals (V1)

- This is **not** a review platform with free-text reviews — only numeric 1–5 ratings.
- This is **not** a multi-tenant SaaS — single platform instance, single admin role tier (no "super admin" hierarchy).
- This is **not** a public-facing store discovery engine (e.g., no SEO-optimized public pages, no anonymous/guest rating).
- Store owners **cannot** self-register — only admins create Store Owner accounts (implied by "Admin can add new stores... and admin users," and store owners have no signup flow specified).
- No payment, subscription, or monetization features.
- No mobile native app — responsive web only.
- No real-time notifications or live updates (e.g., no websockets for live rating counts).

---

## 7. Success Metrics

Since this is an internal/managed platform (not organic public growth), success is measured by adoption and engagement quality rather than viral growth:

**Adoption**
- Number of stores onboarded by admin (target: baseline TBD by business)
- Number of normal users registered
- % of registered normal users who submit at least one rating within 30 days

**Engagement**
- Average number of ratings submitted per active user per month
- % of stores with at least 5 ratings (signal of "meaningful" rating data)
- Rating modification rate (indicates users are engaging thoughtfully, not just click-once)

**Platform Health**
- Admin task completion time (time to add a store/user) — proxy for backend usability
- Error rate on signup/login (validation failures, failed logins) — should trend down as UX improves
- % of store owners who log in and view their dashboard at least once/month

**Data Quality**
- Ratio of ratings-per-store distribution — flags stores with 0 or 1 rating for admin follow-up

---

## 8. Open Questions for Stakeholders

1. Can an admin edit or delete stores/users, or is V1 strictly create + view? (Currently scoped as create + view only, per source requirements.)
2. When admin creates a store, is a Store Owner assigned at creation time, or can a store exist "unassigned" until a Store Owner account is created and linked?
3. Should Normal Users be able to delete their own account or rating?
4. Is there a maximum number of stores a single Store Owner can own (1:1 vs 1:many)?
