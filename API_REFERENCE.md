# Sales Tracker Backend - API Reference

Complete API endpoint reference with request/response examples.

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://your-domain.com/api`

## Response Format

All responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional error details */ }
  }
}
```

---

## Authentication

### Register New User

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Validation Rules:**
- email: Valid email format
- password: Min 8 chars, 1 uppercase, 1 number
- firstName: Required, non-empty
- lastName: Required, non-empty

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "sales_rep"
    }
  }
}
```

**Error Responses:**
- 400: Email already exists
- 400: Invalid email format
- 400: Password too weak

---

### Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "sales_rep"
    }
  }
}
```

**Error Responses:**
- 401: Invalid credentials
- 404: User not found

---

### Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "sales_rep",
    "organizationId": null
  }
}
```

**Error Responses:**
- 401: Missing or invalid token
- 404: User not found

---

## Goals Management

### Get User Goals

**Endpoint:** `GET /goals`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "callsPerDay": 25,
    "emailsPerDay": 30,
    "contactsPerDay": 10,
    "responsesPerDay": 5,
    "callsPerWeek": 125,
    "emailsPerWeek": 150,
    "contactsPerWeek": 50,
    "responsesPerWeek": 25
  }
}
```

**Notes:**
- Returns user-specific goals if available
- Falls back to organization goals if no user goals
- Creates default goals if none exist

---

### Update Goals

**Endpoint:** `PUT /goals`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "callsPerDay": 30,
  "emailsPerDay": 35,
  "contactsPerDay": 12,
  "responsesPerDay": 6,
  "callsPerWeek": 150,
  "emailsPerWeek": 175,
  "contactsPerWeek": 60,
  "responsesPerWeek": 30
}
```

**Validation:**
- All fields are optional
- All values must be non-negative integers

**Success Response (200):**
```json
{
  "success": true,
  "message": "Goals updated successfully",
  "data": {
    "callsPerDay": 30,
    "emailsPerDay": 35,
    "contactsPerDay": 12,
    "responsesPerDay": 6,
    "callsPerWeek": 150,
    "emailsPerWeek": 175,
    "contactsPerWeek": 60,
    "responsesPerWeek": 30
  }
}
```

**Error Responses:**
- 400: Invalid metrics (negative values)

---

## Weekly Activity

### Get Week Activity

**Endpoint:** `GET /activity/week/:weekStartDate`

**Parameters:**
- weekStartDate: ISO date (YYYY-MM-DD), must be a Monday

**Headers:**
```
Authorization: Bearer <token>
```

**Example:** `GET /activity/week/2026-01-06`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "weekStartDate": "2026-01-06",
    "monday": {
      "calls": 30,
      "emails": 35,
      "contacts": 12,
      "responses": 6
    },
    "tuesday": {
      "calls": 28,
      "emails": 32,
      "contacts": 10,
      "responses": 5
    },
    "wednesday": {
      "calls": 25,
      "emails": 30,
      "contacts": 11,
      "responses": 4
    },
    "thursday": {
      "calls": 27,
      "emails": 33,
      "contacts": 9,
      "responses": 7
    },
    "friday": {
      "calls": 29,
      "emails": 31,
      "contacts": 13,
      "responses": 6
    }
  }
}
```

**Not Found Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "No activity found for this week"
}
```

**Error Responses:**
- 400: Invalid date format
- 400: Date is not a Monday

---

### Save Week Activity

**Endpoint:** `POST /activity/week`

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "weekStartDate": "2026-01-06",
  "monday": {
    "calls": 30,
    "emails": 35,
    "contacts": 12,
    "responses": 6
  },
  "tuesday": {
    "calls": 28,
    "emails": 32,
    "contacts": 10,
    "responses": 5
  },
  "wednesday": {
    "calls": 25,
    "emails": 30,
    "contacts": 11,
    "responses": 4
  },
  "thursday": {
    "calls": 27,
    "emails": 33,
    "contacts": 9,
    "responses": 7
  },
  "friday": {
    "calls": 29,
    "emails": 31,
    "contacts": 13,
    "responses": 6
  }
}
```

**Validation:**
- weekStartDate: Required, YYYY-MM-DD format, must be Monday
- All day data is optional
- All numeric values must be non-negative
- Missing values default to 0

**Success Response (200):**
```json
{
  "success": true,
  "message": "Weekly activity saved successfully",
  "data": {
    "weekStartDate": "2026-01-06",
    "monday": { ... },
    "tuesday": { ... },
    "wednesday": { ... },
    "thursday": { ... },
    "friday": { ... }
  }
}
```

**Error Responses:**
- 400: Invalid date format
- 400: Date is not a Monday
- 400: Invalid numeric values (negative)

**Notes:**
- Uses upsert: creates new record or updates existing
- Partial updates supported

---

### Get All Activities

**Endpoint:** `GET /activity/all`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (optional):**
- startDate: ISO date (YYYY-MM-DD)
- endDate: ISO date (YYYY-MM-DD)

**Examples:**
- `GET /activity/all` - Get all activities
- `GET /activity/all?startDate=2026-01-01` - From date onward
- `GET /activity/all?endDate=2026-01-31` - Up to date
- `GET /activity/all?startDate=2026-01-01&endDate=2026-01-31` - Date range

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "weekStartDate": "2026-01-06",
      "monday": { ... },
      "tuesday": { ... },
      "wednesday": { ... },
      "thursday": { ... },
      "friday": { ... }
    },
    {
      "weekStartDate": "2025-12-30",
      "monday": { ... },
      "tuesday": { ... },
      "wednesday": { ... },
      "thursday": { ... },
      "friday": { ... }
    }
  ]
}
```

**Notes:**
- Results sorted by weekStartDate descending (newest first)
- Empty array if no activities found

---

## User Management (Admin/Manager Only)

### Get All Users

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** admin or manager

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "sales_rep",
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "jane@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "sales_rep",
      "createdAt": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- 401: Not authenticated
- 403: Insufficient permissions

---

### Get User's Week Activity

**Endpoint:** `GET /users/:userId/activity/week/:weekStartDate`

**Parameters:**
- userId: UUID of target user
- weekStartDate: ISO date (YYYY-MM-DD), must be Monday

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** admin or manager

**Example:** `GET /users/550e8400-e29b-41d4-a716-446655440000/activity/week/2026-01-06`

**Success Response (200):**
Same format as `GET /activity/week/:weekStartDate`

**Error Responses:**
- 400: Invalid date format
- 400: Date is not a Monday
- 403: Insufficient permissions
- 404: User not found

---

### Get User's All Activities

**Endpoint:** `GET /users/:userId/activity/all`

**Parameters:**
- userId: UUID of target user

**Query Parameters (optional):**
- startDate: ISO date (YYYY-MM-DD)
- endDate: ISO date (YYYY-MM-DD)

**Headers:**
```
Authorization: Bearer <token>
```

**Required Role:** admin or manager

**Example:** `GET /users/550e8400-e29b-41d4-a716-446655440000/activity/all?startDate=2026-01-01`

**Success Response (200):**
Same format as `GET /activity/all`

**Error Responses:**
- 403: Insufficient permissions
- 404: User not found

---

## Error Codes

### Authentication Errors
- `NO_TOKEN`: Authorization header missing
- `INVALID_TOKEN`: Token is invalid or malformed
- `TOKEN_EXPIRED`: Token has expired
- `INVALID_CREDENTIALS`: Email/password incorrect
- `USER_NOT_FOUND`: User account doesn't exist

### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `INVALID_EMAIL`: Email format is invalid
- `WEAK_PASSWORD`: Password doesn't meet requirements
- `INVALID_DATE`: Date format is invalid
- `NOT_MONDAY`: Week start date is not a Monday
- `INVALID_METRICS`: Metric values are invalid

### Authorization Errors
- `FORBIDDEN`: User lacks required permissions
- `UNAUTHORIZED`: Authentication required

### Data Errors
- `EMAIL_EXISTS`: Email already registered
- `DUPLICATE_ENTRY`: Record already exists
- `NOT_FOUND`: Resource not found

### System Errors
- `INTERNAL_ERROR`: Server error
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AUTH_RATE_LIMIT`: Too many auth attempts

---

## HTTP Status Codes

- **200**: Success
- **201**: Created (registration)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (auth required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate)
- **429**: Too Many Requests (rate limit)
- **500**: Internal Server Error

---

## Rate Limits

### General API
- 100 requests per 15 minutes
- Per IP address

### Authentication Endpoints
- 5 requests per 15 minutes
- Per IP address
- Applies to `/auth/login` and `/auth/register`

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

---

## Date Formats

All dates must be in ISO 8601 format: `YYYY-MM-DD`

**Examples:**
- ✅ `2026-01-06`
- ✅ `2025-12-30`
- ❌ `01/06/2026`
- ❌ `2026-1-6`

**Week Start Dates:**
- Must be a Monday
- Use ISO week date system

---

## Authentication

Include JWT token in all protected requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 7 days (default)

**Token Payload:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "sales_rep",
  "iat": 1609459200,
  "exp": 1610064000
}
```

---

## Testing

Use curl to test endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","firstName":"Test","lastName":"User"}'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' \
  | jq -r '.data.token')

# Get Goals
curl -X GET http://localhost:5000/api/goals \
  -H "Authorization: Bearer $TOKEN"
```

---

For more examples, see [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md)

