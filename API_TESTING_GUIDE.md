# Zorvyn Finance API — Complete Testing Guide & Reference

> All protected endpoints require: `Authorization: Bearer <token>` header

---

## 1. Authentication Block — Public Endpoints (No Token Needed)

### 1.1 POST `/api/auth/login`
**Description:** Authenticate user and receive JWT token  
**Status:** 200 (success), 400 (validation), 401 (auth failed)  

**Request:**
```json
{
  "email": "admin@zorvyn.io",
  "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ADMIN",
  "userId": "user-uuid-here",
  "email": "admin@zorvyn.io"
}
```

**Test Cases:**
- ✓ Login admin: email=`admin@zorvyn.io`, password=`Admin@123` → 200 + ADMIN role
- ✓ Login analyst: email=`analyst@zorvyn.io`, password=`Analyst@123` → 200 + ANALYST role
- ✓ Login viewer: email=`viewer@zorvyn.io`, password=`Viewer@123` → 200 + VIEWER role
- ✗ Wrong password: password=`wrongpassword` → 401 "Invalid email or password"
- ✗ Invalid email format: email=`notanemail` → 400 "Validation failed"

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Min 8 characters, required

---

### 1.2 POST `/api/auth/register`
**Description:** Create a new user account  
**Access:** Admin only  
**Status:** 201 (created), 400 (validation), 401 (no token), 403 (wrong role)  

**Headers:**
```
Authorization: Bearer <adminToken>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Nidhi Sharma",
  "email": "nidhi@zorvyn.io",
  "password": "Password@123",
  "role": "ANALYST"
}
```

**Success Response (201):**
```json
{
  "id": "new-user-uuid",
  "name": "Nidhi Sharma",
  "email": "nidhi@zorvyn.io",
  "role": "ANALYST",
  "isActive": true,
  "createdAt": "2026-04-03T10:30:00Z"
}
```

**Test Cases:**
- ✓ Register with admin token → 201 user created
- ✗ Register without token → 401 "No token provided" (auth middleware working)
- ✗ Register with viewer token → 403 "Access denied. This action requires: ADMIN" (role guard working)
- ✗ Register with missing fields → 400 validation errors

---

## 2. User Management Block — Admin Only

### 2.1 GET `/api/users`
**Description:** List all users in the system  
**Access:** Admin only  
**Status:** 200, 401, 403  

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "name": "Admin User",
    "email": "admin@zorvyn.io",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-04-01T00:00:00Z"
  },
  {
    "id": "uuid-2",
    "name": "Analyst User",
    "email": "analyst@zorvyn.io",
    "role": "ANALYST",
    "isActive": true,
    "createdAt": "2026-04-02T10:00:00Z"
  }
]
```

**Test:** Compare with analyst token (should fail 403)

---

### 2.2 GET `/api/users/:id`
**Description:** Get a single user  
**Access:** Admin only  
**Status:** 200, 401, 403, 404  

**Example:**
```
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

**Copy any user ID from GET /api/users and paste above**

---

### 2.3 PATCH `/api/users/:id`
**Description:** Update user role or active status  
**Access:** Admin only  

**Update role:**
```json
{
  "role": "VIEWER"
}
```

**Update status:**
```json
{
  "isActive": false
}
```

**Response (200):**
```json
{
  "id": "user-uuid",
  "name": "User Name",
  "role": "VIEWER",
  "isActive": false,
  "updatedAt": "2026-04-03T15:45:00Z"
}
```

---

### 2.4 DELETE `/api/users/:id`
**Description:** Soft-deactivate a user (sets isActive = false)  
**Access:** Admin only  
**Status:** 200, 401, 403, 404  

**Response (200):**
```json
{
  "success": true,
  "message": "User deactivated",
  "userId": "user-uuid"
}
```

---

## 3. Financial Records Block

### 3.1 POST `/api/records`
**Description:** Create a new financial transaction  
**Access:** Admin only  
**Status:** 201, 400 (validation), 401, 403  

**Request:**
```json
{
  "amount": 75000,
  "type": "INCOME",
  "category": "Consulting",
  "date": "2026-04-01",
  "description": "Q2 consulting project"
}
```

**Success Response (201):**
```json
{
  "id": "record-uuid",
  "userId": "admin-uuid",
  "amount": 75000.00,
  "type": "INCOME",
  "category": "Consulting",
  "date": "2026-04-01",
  "description": "Q2 consulting project",
  "isDeleted": false,
  "createdAt": "2026-04-03T10:30:00Z"
}
```

**Validation:**
- `amount`: Must be positive number (> 0)
- `type`: Must be INCOME or EXPENSE
- Negative amounts fail: → 400 validation error
- Wrong enum values fail: → 400 validation error
- Missing required fields fail: → 400 validation errors listed

**Test Cases:**
- ✓ Create with admin token → 201 created (save the id)
- ✗ Create with analyst token → 403 "Access denied. This action requires: ADMIN"
- ✗ Create with negative amount → 400 "Validation failed"
- ✗ Create with wrong type → 400 "Validation failed"

---

### 3.2 GET `/api/records`
**Description:** Get all records with optional filters  
**Access:** All roles (with row-level filtering)  
**Status:** 200, 401  

**Query Parameters (optional):**
- `?type=INCOME` or `?type=EXPENSE`
- `?category=Salary`
- `?startDate=2026-01-01`
- `?endDate=2026-03-31`
- Combine: `?type=INCOME&category=Consulting`

**Examples:**
```
GET /api/records
GET /api/records?type=EXPENSE
GET /api/records?category=Rent
GET /api/records?startDate=2026-01-01&endDate=2026-03-31
GET /api/records?type=INCOME&category=Salary
```

**Response (200):**
```json
[
  {
    "id": "record-uuid",
    "userId": "user-uuid",
    "amount": 50000.00,
    "type": "INCOME",
    "category": "Salary",
    "date": "2026-04-01",
    "description": "Monthly salary",
    "isDeleted": false,
    "createdAt": "2026-04-01T08:00:00Z"
  }
]
```

**⚠️ KEY SECURITY TEST — Row-Level Filtering:**
- Admin with token → sees all records from all users
- Viewer with token → **sees ONLY their own records** (WHERE userId = req.user.userId enforced at DB level)
- This proves the row-level security is working!

---

### 3.3 GET `/api/records/:id`
**Description:** Get a single record  
**Access:** All roles (with ownership check for Viewers)  

**Copy any record ID from GET /api/records:**
```
GET /api/records/PASTE_RECORD_ID_HERE
```

**Response includes user info:**
```json
{
  "id": "record-uuid",
  "userId": "user-uuid",
  "amount": 50000.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-01",
  "description": "Monthly salary",
  "isDeleted": false,
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 3.4 PATCH `/api/records/:id`
**Description:** Update a record (admin only)  
**Access:** Admin only  

**Request (partial update):**
```json
{
  "amount": 80000,
  "description": "Updated consulting amount"
}
```

**Response (200):**
```json
{
  "id": "record-uuid",
  "amount": 80000.00,
  "description": "Updated consulting amount",
  "updatedAt": "2026-04-03T15:45:00Z"
}
```

---

### 3.5 DELETE `/api/records/:id`
**Description:** Soft-delete a record  
**Access:** Admin only  
**Status:** 200, 401, 403, 404  

**Response (200):**
```json
{
  "success": true,
  "message": "Record deleted successfully",
  "recordId": "record-uuid"
}
```

**🔍 Verify Soft Delete Works:**
1. DELETE /api/records/RECORD_ID → 200 deleted
2. Immediately GET /api/records → Record should NOT appear (isDeleted filter removes it)
3. This proves soft delete works correctly!

---

### 3.6 GET `/api/records/fake-id` (Testing 404)
**Test non-existent record:**
```
GET /api/records/fake-id-that-doesnt-exist
```

**Response (404):**
```json
{
  "success": false,
  "message": "Record not found",
  "statusCode": 404
}
```

---

## 4. Dashboard Analytics Block

### 4.1 GET `/api/dashboard/summary`
**Description:** Get financial summary (income, expense, balance)  
**Access:** All roles (role-based data)  
**Status:** 200, 401  

**Response (200):**
```json
{
  "totalIncome": 150000.00,
  "totalExpense": 87500.00,
  "netBalance": 62500.00,
  "period": "all-time",
  "incomeCount": 12,
  "expenseCount": 45
}
```

**Test Role Differences:**
- Admin with token → sees totals of ALL records in system
- Viewer with token → sees totals of ONLY their own records
- Numbers will be different! This proves role-based filtering.

---

### 4.2 GET `/api/dashboard/by-category`
**Description:** Category breakdown (totals grouped by category)  
**Access:** Analyst, Admin only  
**Status:** 200, 401, 403  

**Response (200):**
```json
[
  {
    "category": "Salary",
    "incomeTotal": 100000.00,
    "expenseTotal": 0.00,
    "netByCategory": 100000.00,
    "count": 3
  },
  {
    "category": "Rent",
    "incomeTotal": 0.00,
    "expenseTotal": 30000.00,
    "netByCategory": -30000.00,
    "count": 12
  }
]
```

**Test Cases:**
- ✓ Analyst token → 200 categories listed
- ✓ Admin token → 200 categories listed
- ✗ Viewer token → 403 "Access denied. This action requires: ANALYST, ADMIN"

---

### 4.3 GET `/api/dashboard/monthly-trend`
**Description:** Income vs expense by month  
**Access:** Analyst, Admin only  
**Status:** 200, 401, 403  
**Implementation:** Uses raw SQL with `TO_CHAR(date, 'YYYY-MM')` for performance  

**Response (200):**
```json
[
  {
    "month": "2026-01",
    "type": "INCOME",
    "total": 50000.00,
    "count": 2
  },
  {
    "month": "2026-01",
    "type": "EXPENSE",
    "total": 25000.00,
    "count": 8
  },
  {
    "month": "2026-02",
    "type": "INCOME",
    "total": 75000.00,
    "count": 3
  },
  {
    "month": "2026-02",
    "type": "EXPENSE",
    "total": 40000.00,
    "count": 12
  }
]
```

---

### 4.4 GET `/api/dashboard/recent`
**Description:** Last N transactions (default 10)  
**Access:** All roles  
**Status:** 200, 400 (validation), 401  

**Query Parameters:**
- `?limit=10` (default)
- `?limit=3` (get 3 records)
- `?limit=20` (get 20 records, max 100)

**Examples:**
```
GET /api/dashboard/recent
GET /api/dashboard/recent?limit=5
GET /api/dashboard/recent?limit=3
```

**Response (200):**
```json
[
  {
    "id": "record-uuid-1",
    "userId": "user-uuid",
    "amount": 5000.00,
    "type": "EXPENSE",
    "category": "Food",
    "date": "2026-04-03",
    "createdAt": "2026-04-03T14:30:00Z"
  },
  {
    "id": "record-uuid-2",
    "userId": "user-uuid",
    "amount": 2000.00,
    "type": "INCOME",
    "category": "Freelance",
    "date": "2026-04-02",
    "description": "Project payment",
    "createdAt": "2026-04-02T16:00:00Z"
  }
]
```

**Test Pagination:**
- `GET /api/records/recent` → 10 records
- `GET /api/records/recent?limit=3` → only 3 records

---

## Complete Testing Checklist

### ✅ Authentication Tests (No Token)
- [ ] Test 1.1: Admin login → 200 + token
- [ ] Test 1.2: Analyst login → 200 + token
- [ ] Test 1.3: Viewer login → 200 + token
- [ ] Test 1.4: Wrong password → 401
- [ ] Test 1.5: Invalid email → 400

### ✅ User Management Tests (Admin Token)
- [ ] Test 2.1: Register user → 201
- [ ] Test 2.2: Register without token → 401 (middleware proof)
- [ ] Test 2.3: Register with viewer token → 403 (role guard proof)
- [ ] Test 2.4: Get all users → 200 list
- [ ] Test 2.5: Get users with analyst token → 403
- [ ] Test 2.6: Get single user → 200
- [ ] Test 2.7: Update user role → 200
- [ ] Test 2.8: Deactivate user → 200

### ✅ Records Tests
- [ ] Test 3.1: Create record (admin) → 201
- [ ] Test 3.2: Create record (analyst) → 403
- [ ] Test 3.3: Create with missing fields → 400
- [ ] Test 3.4: Get all records (admin) → 200 all
- [ ] Test 3.5: Get records (viewer) → 200 own only (row-level security!)
- [ ] Test 3.6: Filters work (type, category, dates)
- [ ] Test 3.7: Get single record → 200
- [ ] Test 3.8: Update record → 200
- [ ] Test 3.9: Delete record + verify gone → 200, then filtered out
- [ ] Test 3.10: Non-existent record → 404

### ✅ Dashboard Tests
- [ ] Test 4.1: Summary (admin vs viewer) → different totals
- [ ] Test 4.2: Category breakdown (analyst) → 200
- [ ] Test 4.3: Category breakdown (viewer) → 403
- [ ] Test 4.4: Monthly trend (admin) → 200
- [ ] Test 4.5: Recent transactions → 200
- [ ] Test 4.6: Recent with limit → pagination works

---

## Key Proof Points for Demonstration

1. **Authentication works:** Login endpoints return valid JWT tokens with role embedded
2. **Role-based access control:** 401 and 403 responses prove middleware chain works
3. **Row-level security:** Viewer sees only own records despite admin seeing all (row filter at DB level)
4. **Validation:** 400 errors show input validation working
5. **Soft delete:** Deleted records disappear from queries without being truly erased
6. **Error handling:** Centralized error middleware formats all responses consistently

## Seed Data Summary (from `prisma/seed.js`)

### Users created
- admin@zorvyn.io / Admin@123 → role: ADMIN
- analyst@zorvyn.io / Analyst@123 → role: ANALYST
- viewer@zorvyn.io / Viewer@123 → role: VIEWER

### Sample transactions (8 total)
- Admin:
  - 2026-01-05 INCOME 150000 Salary
  - 2026-01-07 EXPENSE 45000 Rent
  - 2026-01-15 EXPENSE 12000 Marketing
  - 2026-03-20 INCOME 200000 Investment
- Analyst:
  - 2026-02-01 INCOME 80000 Consulting
  - 2026-02-10 EXPENSE 8500 Software
- Viewer:
  - 2026-03-01 INCOME 55000 Salary
  - 2026-03-12 EXPENSE 18000 Travel

### Quick dashboard totals for verification
- System (Admin/Analyst):
  - Income = 485000
  - Expense = 83500
  - Net = 401500
- Viewer-only:
  - Income = 55000
  - Expense = 18000
  - Net = 37000

---