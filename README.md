# 🌟 Store Rating & Management Platform

A modern, full-stack web application designed for store discovery, consumer ratings, store owner reputation tracking, and platform administration. Built with **Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, React 18, Vite, and Tailwind CSS**.

---

## 🚀 Key Features

### 👤 Role-Based Authentication & Access Control
- **Unified Authentication**: Single login gateway supporting three roles:
  - **System Administrator** (`ADMIN`)
  - **Store Owner** (`STORE_OWNER`)
  - **Normal Consumer** (`NORMAL_USER`)
- **Self-Registration**: Public signup for consumers with real-time validation.
- **In-App Password Management**: Modal for authenticated users to update their credentials.
- **Stateless JWT Security**: Protected REST endpoints using Bearer tokens and role guards.

### ⭐ Normal User Experience (Discover & Rate)
- **Store Catalog**: Browse registered stores with calculated overall rating badges and review counts.
- **Search & Filtering**: Live server-side filtering by store name and address.
- **Sorting**: Multi-column sorting by rating, name, address, and date added.
- **1–5 Star Rating Upsert**: Interactive star rating submission that updates store scores in real-time.

### 📊 Store Owner Experience (Reputation Hub)
- **Reputation Overview**: Overall average rating across all owned storefronts.
- **Detailed Customer Feedback**: Table of all consumers who rated their store(s), displaying customer names, emails, star scores, and review dates.
- **Store Performance Metrics**: Total reviews and per-store rating breakdowns.

### 🛡️ System Administrator Experience (Platform Governance)
- **Platform Analytics**: Total users, total stores, and total ratings count.
- **Store Management**: Create stores, assign registered store owners, search/filter stores, and sort records.
- **User Management**: Create accounts for any role, view user directories, and inspect user profiles (including store owner performance metrics).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (Vite) + TypeScript | Single Page Application UI |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive modern styling & icons |
| **Routing** | React Router v6 | Declarative role-based route guards |
| **HTTP Client** | Axios | Intercepted client with automatic token injection |
| **Backend** | Node.js + Express + TypeScript | RESTful API server |
| **Database & ORM**| PostgreSQL 16 + Prisma ORM | Relational schema, migrations & queries |
| **Authentication**| JSON Web Tokens (JWT) + bcryptjs | Stateless auth & password hashing |
| **Validation** | Zod | Strict boundary schema validation |
| **Containerization**| Docker + Docker Compose | PostgreSQL container & multi-stage Docker build |

---

## 📁 Project Structure

```text
store-management-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Relational schema (User, Store, Rating)
│   │   ├── seed.ts                 # Idempotent database seeder
│   │   └── migrations/             # SQL migrations history
│   ├── src/
│   │   ├── config/env.ts           # Strict Zod environment validator
│   │   ├── controllers/            # HTTP request/response handlers
│   │   ├── middleware/             # Auth, role-guard, error, validation
│   │   ├── routes/                 # Express API v1 routers
│   │   ├── services/               # Business logic & database operations
│   │   ├── utils/                  # Password hashing, JWT, response helpers
│   │   ├── validations/            # Zod validation schemas
│   │   ├── db.ts                   # Prisma client singleton instance
│   │   ├── app.ts                  # Express application setup
│   │   └── server.ts               # Server entry point
│   ├── Dockerfile                  # Multi-stage production container
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts           # Axios client with interceptors
│   │   ├── components/             # Reusable UI (Navbar, Modal, StarRating, Layout)
│   │   ├── context/AuthContext.tsx # React AuthContext & session rehydration
│   │   ├── pages/                  # Login, Signup, Stores, Admin, Store Owner
│   │   ├── types/index.ts          # Shared TypeScript interfaces
│   │   ├── App.tsx                 # Route tree & role protection
│   │   └── main.tsx                # React DOM root entry
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
└── docker-compose.yml              # PostgreSQL container service
```

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

---

### 2. Start PostgreSQL Database
From the project root:
```bash
docker compose up -d
```

---

### 3. Setup Backend API
```bash
cd backend

# Install dependencies
npm install

# Apply database migrations
npx prisma migrate dev --name init

# Seed database with demo accounts & stores
npm run seed

# Start development server (running on http://localhost:5000)
npm run dev
```

---

### 4. Setup Frontend Client
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (running on http://localhost:5173)
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Test Accounts

The database seed script initializes the following pre-configured test personas:

| Role | Email | Password | Notes |
|---|---|---|---|
| **System Admin** | `admin@storerating.com` | `AdminPassword@123` | Full admin privileges |
| **Store Owner 1** | `owner1@storerating.com` | `OwnerPassword@123` | Owns Grocery & Coffee stores |
| **Store Owner 2** | `owner2@storerating.com` | `OwnerPassword@123` | Owns Electronics store |
| **Normal User 1** | `user1@storerating.com` | `UserPassword@123` | Consumer account |
| **Normal User 2** | `user2@storerating.com` | `UserPassword@123` | Consumer account |

> 💡 **Tip**: The login page includes 1-click **Quick Fill Demo Buttons** to instantly log in as any role without typing credentials!

---

## 📡 REST API Reference (`/api/v1`)

### Authentication
- `POST /api/v1/auth/signup` — Public consumer registration
- `POST /api/v1/auth/login` — Authenticate across all roles
- `GET  /api/v1/auth/me` — Get current user profile
- `PATCH /api/v1/auth/password` — Update personal password
- `POST /api/v1/auth/logout` — Terminate session

### Stores & Ratings
- `GET  /api/v1/stores` — List stores with filters, sorting, and user-specific ratings
- `POST /api/v1/stores` — Create store *(Admin only)*
- `GET  /api/v1/stores/:id` — Get store details
- `POST /api/v1/stores/:id/ratings` — Submit / modify 1–5 star rating *(Normal User only)*

### User Management *(Admin only)*
- `GET  /api/v1/users` — List and search users with role/address filters
- `POST /api/v1/users` — Create user (`ADMIN`, `STORE_OWNER`, `NORMAL_USER`)
- `GET  /api/v1/users/:id` — View user details and store owner performance metrics

### Dashboards
- `GET /api/v1/dashboard/admin` — Total users, stores, and ratings metrics *(Admin only)*
- `GET /api/v1/dashboard/store-owner` — Average rating and customer review list *(Store Owner only)*

---

## 📄 License
This project is licensed under the MIT License.
