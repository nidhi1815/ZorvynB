# Zorvyn Finance Dashboard — Project Documentation

---

## Table of Contents

- [Zorvyn Finance Dashboard — Project Documentation](#zorvyn-finance-dashboard--project-documentation)
  - [Table of Contents](#table-of-contents)
  - [1. Project Overview](#1-project-overview)
  - [2. Tech Stack](#2-tech-stack)
    - [Backend](#backend)
    - [Why PostgreSQL(relational) over MongoDB(non relational)](#why-postgresqlrelational-over-mongodbnon-relational)
  - [3. High Level Design](#3-high-level-design)
  - [4. Detailed System Design](#4-detailed-system-design)
    - [4.1 Authentication Flow](#41-authentication-flow)
    - [4.2 Role Based Access Control](#42-role-based-access-control)
    - [4.3 Middleware Pipeline](#43-middleware-pipeline)
  - [5. Database Design](#5-database-design)
    - [5.1 Tables](#51-tables)
      - [`users`](#users)
      - [`transactions`](#transactions)
    - [5.2 Relationships](#52-relationships)
  - [6. API Reference](#6-api-reference)
    - [Auth](#auth)
    - [Users](#users-1)
    - [Financial Records](#financial-records)
    - [Dashboard](#dashboard)
  - [7. Folder Structure](#7-folder-structure)
  - [8. Setup and Installation](#8-setup-and-installation)
    - [Prerequisites](#prerequisites)
    - [Backend Setup](#backend-setup)
  - [9. Assumptions and Tradeoffs](#9-assumptions-and-tradeoffs)

---

## 1. Project Overview

Zorvyn Finance Dashboard is a RESTful backend API service that enables organizations to manage and monitor financial records through a role-aware system with JWT authentication and granular access control.

Three user roles interact with the system, each with distinct permissions:

| Role | Capabilities |
|---|---|
| **Viewer** | View own financial records and balance summary |
| **Analyst** | View all records across the organization, access aggregated analytics and trends |
| **Admin** | Full CRUD access to records and users, all analytics endpoints |

The API is built on Express.js with Prisma ORM, JWT-based authentication, role-based access control enforced at the middleware layer, and PostgreSQL for persistent data storage.

---

## 2. Tech Stack

### Backend
| Layer | Technology | Reason |
|---|---|---|
| Runtime | Node.js | Fast, non-blocking, ideal for API servers |
| Framework | Express.js | Lightweight,  great for RESTful APIs |
| Database | PostgreSQL | ACID compliant, relational and industry standard for financial data |
| ORM | Prisma | Type-safe DB queries, clean schema definition, auto-migrations |
| Authentication | JWT (jsonwebtoken) | Stateless, secure, role payload baked into token |
| Password Hashing | bcrypt | One-way hashing so passwords will never be stored in plain text |
| Validation | Zod | Schema-based input validation with clear error messages |
| Environment | dotenv | Keeps secrets out of source code |

---

## 3. High Level Design

```
┌──────────────────────────────────────────────────────────────┐
│                    HTTP/S CLIENT                             │
│                                                              │
│              Authorization: Bearer <JWT token>               │
└──────────────────────────┬───────────────────────────────--──┘
                           │
┌──────────────────────────▼───────────────────────────────-──┐
│                     EXPRESS SERVER                          │
│                                                             │
│   ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│   │ auth.routes  │   │record.routes │   │dashboard.routes│  │
│   └──────┬───────┘   └──────┬───────┘   └────────┬───────┘  │
│          │                  │                    │          │
│   ┌──────▼──────────────────▼────────────────────▼────────┐ │
│   │              MIDDLEWARE PIPELINE                      │ │
│   │ authMiddleware → roleMiddleware → validateMiddleware  │ │
│   └──────────────────────────┬────────────────────────────| │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │                    CONTROLLERS                      │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │                     SERVICES                        │   │
│   │              (all business logic)                   │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │               PRISMA ORM                            │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────|
                           │
┌──────────────────────────▼───────────────────────────────┐
│                  POSTGRESQL DATABASE                     │
│            users table | transactions table              │
└──────────────────────────────────────────────────────── ─┘
```

---

## 4. Detailed System Design

### 4.1 Authentication Flow

Authentication happens in two distinct phases. These are completely separate concerns.

**Phase 1 — Login (happens once)**

```
User submits { email, password }
        │
        ▼
Backend looks up email in users table
        │
        ├── Not found ──► 401 Unauthorized
        │
        ▼
bcrypt.compare(enteredPassword, storedHash)
        │
        ├── No match ──► 401 Unauthorized
        │
        ▼
Read role from DB row  ← role comes from DB, NOT from user input
        │
        ▼
jwt.sign({ userId, role, email }, SECRET_KEY, { expiresIn: '24h' })
        │
        ▼
Return { token, role } to client
        │
        ▼
Client receives token and includes it in Authorization header
for all subsequent API requests
```

**Why role is read from DB, not from the request:**
If the user could specify `role: "admin"` in the request and the backend trusted it, anyone could escalate their own privileges. The backend always reads the authoritative role from the database and encodes it into the JWT.

**Phase 2 — Every subsequent request**

Every subsequent API call goes through the middleware pipeline. The backend verifies the token once and never queries the database again for auth — all needed claims are inside the JWT.

```
Request arrives with Authorization: Bearer <token>
        │
        ▼
auth.middleware — is token present and valid?
        │
        ├── Missing or invalid ──► 401 Unauthorized
        │
        ▼
role.middleware — does this role have permission?
        │
        ├── Role not allowed ──► 403 Forbidden
        │
        ▼
req.user = { userId, role } attached to request object
        │
        ▼
Controller executes with authenticated context
```
---

### 4.2 Role Based Access Control

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View own transactions | yes | yes | yes |
| View all transactions | no | yes | yes |
| Create transaction | no | no | yes |
| Update transaction | no | no | yes |
| Delete transaction | no | no | yes |
| View dashboard summary | own only | all records | all records |
| View category trends | no | yes | yes |
| View monthly charts | no | yes | yes |
| Create users | no | no | yes |
| Manage user roles | no | no | yes |
| Deactivate users | no | no | yes |

**Row-level filtering for Viewers:**
When a Viewer calls `GET /api/records`, the service layer automatically adds `WHERE userId = req.user.userId` to the query. Viewers physically cannot retrieve another user's records — access control is enforced at the database query level, not in the API response.

---

### 4.3 Middleware Pipeline

Every request to a protected route passes through this chain before reaching the controller:

```
auth.middleware.js
  Reads JWT from Authorization header
  Verifies signature using SECRET_KEY
  Attaches decoded user to req.user
  Next() or 401

role.middleware.js
  Factory function: authorize('admin', 'analyst')
  Checks req.user.role against allowed roles
  Next() or 403

validate.middleware.js
  Runs Zod schema against req.body
  Returns structured 400 errors if invalid
  Next() if valid

error.middleware.js  ← registered last in app.js
  Catches all errors thrown anywhere in the app
  Formats { success: false, message, statusCode }
  Prevents stack traces leaking to client
```

**asyncHandler utility:**
All controller functions are wrapped in `asyncHandler` — a higher-order function that catches async errors and passes them to the error middleware automatically. This eliminates try-catch boilerplate in every controller.

```js
// Without asyncHandler — repeated try-catch everywhere
export const getRecords = async (req, res) => {
  try {
    const records = await recordService.getAll();
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// With asyncHandler — clean
export const getRecords = asyncHandler(async (req, res) => {
  const records = await recordService.getAll();
  res.json(records);
});
```

---

## 5. Database Design

### 5.1 Tables

#### `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, default uuid | Auto-generated |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier |
| `password` | VARCHAR(255) | NOT NULL | bcrypt hash — never plain text |
| `role` | ENUM | NOT NULL, default 'viewer' | viewer / analyst / admin |
| `isActive` | BOOLEAN | NOT NULL, default true | Soft disable without deleting |
| `createdAt` | TIMESTAMP | default now() | Auto-set by Prisma |
| `updatedAt` | TIMESTAMP | auto-updated | Auto-set by Prisma |

#### `transactions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Auto-generated |
| `userId` | UUID | FOREIGN KEY → users.id | Who created this record |
| `amount` | DECIMAL(12,2) | NOT NULL, > 0 | Stored as positive number always |
| `type` | ENUM | NOT NULL | income / expense |
| `category` | VARCHAR(100) | NOT NULL | e.g. Salary, Rent, Marketing |
| `date` | DATE | NOT NULL | Transaction date (not created date) |
| `description` | TEXT | nullable | Optional notes |
| `isDeleted` | BOOLEAN | default false | Soft delete — record stays in DB |
| `createdAt` | TIMESTAMP | default now() | |
| `updatedAt` | TIMESTAMP | auto-updated | |


**Soft delete:**
`isDeleted = true` instead of `DELETE FROM transactions`. This means records are never truly gone — the admin can review deletion history, and financial auditing is preserved. All queries add `WHERE isDeleted = false` by default via Prisma middleware.

---

### 5.2 Relationships

```
users (1) ──────────────── (many) transactions
  │
  └── One user can have many transactions
      Each transaction belongs to exactly one user
      If a user is deactivated (isActive = false),
      their transactions remain — data is never lost
```

## 6. API Reference

> Complete testing guide with all test cases, request/response examples, and status codes available in [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)

- Summary: Viewer sees own totals, Analyst/Admin see system-wide totals
- Category/Monthly: Analyst/Admin only (Viewer returns 403)
- Recent: Viewer sees own recent, Analyst/Admin see system-wide recent

---

## 7. Folder Structure

```
zorvyn/backend/
│
├── prisma/
│   ├── schema.prisma                    # Prisma schema — User & Transaction models
│   ├── migrations/
│   │   └── 20260402155415_init/         # Database initialization migration
│   │       └── migration.sql
│   └── seed.js                          # Seeds first Admin user
│
├── src/
│   ├── config/
│   │   └── db.js                        # Prisma client singleton
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js           # JWT verification, sets req.user
│   │   ├── role.middleware.js           # authorize('admin','analyst','viewer')
│   │   ├── validate.middleware.js       # Zod request validation
│   │   └── error.middleware.js          # Global error handler
│   │
│   ├── routes/
│   │   ├── auth.routes.js               # POST /api/auth/login, /api/auth/register
│   │   ├── user.routes.js               # Admin: GET, PATCH, DELETE users
│   │   ├── record.routes.js             # CRUD financial records
│   │   └── dashboard.routes.js          # Analytics: summary, trends, categories
│   │
│   ├── controllers/
│   │   ├── auth.controller.js           # login(), register()
│   │   ├── user.controller.js           # getUsers(), getUser(), updateUserById(), deleteUser()
│   │   ├── record.controller.js         # getAllRecords(), getRecord(), addRecord(), editRecord(), removeRecord()
│   │   └── dashboard.controller.js      # getSummary(), getByCategory(), getMonthlyTrend(), getRecent()
│   │
│   ├── services/
│   │   ├── auth.service.js              # Authentication business logic
│   │   ├── user.service.js              # User management queries
│   │   ├── record.service.js            # Transaction CRUD with filtering
│   │   └── dashboard.service.js         # Analytics aggregations
│   │
│   ├── validators/
│   │   ├── auth.validator.js            # Zod schemas for login/register
│   │   └── record.validator.js          # Zod schemas for transaction data
│   │
│   ├── utils/
│   │   ├── AppError.js                  # Custom error class with statusCode
│   │   └── asyncHandler.js              # Async error wrapper for controllers
│   │
│   └── app.js                           # Express setup, middleware registration, routes
│
├── .env                                 # Environment variables
├── server.js                            # Server entry point
└── package.json                         # Dependencies and scripts
```

---

## 8. Setup and Installation

### Prerequisites
- Node.js v18+
- PostgreSQL v12+ (running locally or remote connection string)
- npm or yarn

### Backend Setup

```bash
#clone the repo
git clone https://github.com/nidhi1815/ZorvynB.git

cd ZorvynB/backend
npm install

# Create .env file with required variables
cp .env.example .env

# Edit .env and fill in:
# DATABASE_URL=postgresql://user:password@localhost:5432/zorvyn_db
# JWT_SECRET=your-secret-key-here
# PORT=5000

# Migrate database schema and apply migrations
npx prisma migrate dev

# Seed first Admin user
node prisma/seed.js

# Start development server
npm run dev

# Server runs at http://localhost:5000
# API accessible at http://localhost:5000/api
```


**Default Admin Credentials (created by seed script):**

```
Email:    admin@zorvyn.io
Password: Admin@123
```


---

## 9. Assumptions and Tradeoffs

| Decision | Choice Made | Reason |
|---|---|---|
| Token format | JWT payload: userId, role, email | Stateless authentication, no backend session storage required |
| Token expiry | 24 hours | Balance between security (short-lived) and UX (reasonable duration) |
| Password hashing | bcrypt with salt | Industry standard, one-way hashing, passwords never stored in plain text |
| Password policy | Minimum 8 characters, Zod validated | Enforced server-side at login/register endpoints |
| Soft delete strategy | `isDeleted` boolean flag (not DROP) | Records preserved for audit history, compliance, financial integrity trails |
| Transaction amounts | Always positive, type carries sign meaning | Simplifies aggregation queries: `SUM(amount) WHERE type='INCOME'` unambiguous |
| Refresh tokens | Not implemented | Single JWT per session; acceptable for 24h expiry; re-login required after |
| Admin bootstrapping | One hardcoded admin via seed.js | Solves bootstrap problem: first admin created during setup, others via API |
| Analyst role | Read-only access, no write endpoints | Principle of least privilege—analysts analyze, admins make changes |
| Viewer access control | Row-level filtering at service layer | `WHERE userId = req.user.userId` added automatically in all Prisma queries |
| Database column naming | Quoted identifiers in migrations | PostgreSQL treats unquoted identifiers as lowercase; "isDeleted" preserves case |
| Complex aggregations | Raw SQL ($queryRaw) for dashboard | Prisma groupBy doesn't support DATE truncation; raw SQL more efficient for analytics |
| Error handling | Centralized middleware pipeline | Single point of error formatting, prevents stack traces leaking to client |
| Input validation | Zod schemas before service layer | Type-safe validation with structured error messages, prevents invalid data at DB |
| Middleware execution order | auth → role → validate → controller | Defense in depth: 401 (unknown) before 403 (forbidden) before 400 (bad request) |

---
