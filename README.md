# Zorvyn Finance Dashboard Backend

A role-based finance data processing and access control backend built with Express, Prisma, and MongoDB.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (stored in HTTP-only cookies)
- **Password Hashing**: bcryptjs

## Roles

| Role    | Permissions                                             |
|---------|---------------------------------------------------------|
| ADMIN   | Full access: manage users, create/update/delete records |
| ANALYST | View records and access dashboard summaries             |
| VIEWER  | View dashboard data only                                |

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run generate
```

### 3. Seed Database
```bash
npm run seed
```
**Note**: Run this separately before starting the server.

### 4. Start Server
```bash
npm run dev
```
Server runs on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint         | Access   | Description              |
|--------|------------------|----------|--------------------------|
| POST   | /user/signUp     | Public   | Register new user        |
| POST   | /user/login      | Public   | Login user               |
| POST   | /user/logout     | Auth     | Logout user              |

**Request Body - SignUp**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Request Body - Login**
```json
{
  "email": "string",
  "password": "string"
}
```

### User Management

| Method | Endpoint              | Access  | Description                  |
|--------|----------------------|---------|------------------------------|
| GET    | /user                | ADMIN   | Get all users                |
| POST   | /user/updateRole/:id | ADMIN   | Update user role             |
| PATCH  | /user/users/:id/status | ADMIN | Toggle user active status  |

**Request Body - Update Role**
```json
{
  "role": "VIEWER" | "ANALYST" | "ADMIN"
}
```

**Request Body - Toggle Status**
```json
{
  "isActive": boolean
}
```

### Transactions

| Method | Endpoint           | Access      | Description                    |
|--------|--------------------|-------------|--------------------------------|
| GET    | /transaction       | ANALYST, ADMIN | Get all transactions (paginated) |
| POST   | /transaction/new   | ADMIN       | Create new transaction         |
| PATCH  | /transaction/:id   | ADMIN      | Update transaction             |
| DELETE | /transaction/:id   | ADMIN      | Delete (soft delete) transaction |

**Query Params (GET)**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by INCOME or EXPENSE
- `category` - Filter by category
- `startDate` - Filter from date (ISO string)
- `endDate` - Filter to date (ISO string)

**Request Body - Create/Update**
```json
{
  "amount": number,
  "type": "INCOME" | "EXPENSE",
  "category": "string",
  "date": "ISO date string",
  "notes": "string (optional)"
}
```

### Dashboard

| Method | Endpoint                 | Access              | Description              |
|--------|--------------------------|---------------------|--------------------------|
| GET    | /dashboard/financeOverview | VIEWER, ANALYST, ADMIN | Total income/expenses/balance |
| GET    | /dashboard/categoryTotals | VIEWER, ANALYST, ADMIN | Totals by category      |
| GET    | /dashboard/recentActivity | VIEWER, ANALYST, ADMIN | Recent transactions     |
| GET    | /dashboard/monthlyTrends  | VIEWER, ANALYST, ADMIN | Monthly trends          |

**Query Params**
- `recentActivity`: `limit` (default: 5)
- `monthlyTrends`: `months` (default: 3)

## Authentication

- JWT token is stored in an HTTP-only cookie (`access-token`)
- Include cookie with requests for authenticated endpoints
- Token expires after 1 hour (login)

## Tradeoffs

1. **No refresh tokens** - Since there is no frontend, refresh token flow was not implemented.

## Default Admin User

After seeding:
- **Email**: admin@zorvyn.in
- **Password**: admin123
- **Role**: ADMIN

## Error Responses

All errors return a JSON response with a `message` field. Common status codes:
- 400 - Bad Request (validation errors)
- 401 - Unauthorized (invalid/missing token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 409 - Conflict (duplicate entry)
- 500 - Internal Server Error