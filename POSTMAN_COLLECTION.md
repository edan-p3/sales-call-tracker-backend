# Postman API Collection

This document provides example API requests for testing the Sales Tracker Backend API.

## Setup

1. Create a new collection in Postman called "Sales Tracker API"
2. Add a collection variable:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (will be set after login)

## 1. Authentication

### 1.1 Register User

**Request:**
```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "john.smith@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("token", response.data.token);
    pm.collectionVariables.set("userId", response.data.user.id);
}
```

### 1.2 Login

**Request:**
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john.smith@example.com",
  "password": "SecurePass123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("token", response.data.token);
    pm.collectionVariables.set("userId", response.data.user.id);
}
```

### 1.3 Get Current User

**Request:**
```
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}
```

## 2. Goals

### 2.1 Get Goals

**Request:**
```
GET {{baseUrl}}/goals
Authorization: Bearer {{token}}
```

### 2.2 Update Goals

**Request:**
```
PUT {{baseUrl}}/goals
Authorization: Bearer {{token}}
Content-Type: application/json

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

## 3. Weekly Activity

### 3.1 Get Week Activity

**Request:**
```
GET {{baseUrl}}/activity/week/2026-01-06
Authorization: Bearer {{token}}
```

**Note:** Replace `2026-01-06` with any Monday in YYYY-MM-DD format.

### 3.2 Save Week Activity

**Request:**
```
POST {{baseUrl}}/activity/week
Authorization: Bearer {{token}}
Content-Type: application/json

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

### 3.3 Get All Activities

**Request:**
```
GET {{baseUrl}}/activity/all
Authorization: Bearer {{token}}
```

**With date filters:**
```
GET {{baseUrl}}/activity/all?startDate=2025-12-30&endDate=2026-01-31
Authorization: Bearer {{token}}
```

## 4. User Management (Admin/Manager Only)

### 4.1 Get All Users

**Request:**
```
GET {{baseUrl}}/users
Authorization: Bearer {{token}}
```

**Note:** Requires admin or manager role.

### 4.2 Get User's Week Activity

**Request:**
```
GET {{baseUrl}}/users/{{userId}}/activity/week/2026-01-06
Authorization: Bearer {{token}}
```

### 4.3 Get User's All Activities

**Request:**
```
GET {{baseUrl}}/users/{{userId}}/activity/all
Authorization: Bearer {{token}}
```

**With filters:**
```
GET {{baseUrl}}/users/{{userId}}/activity/all?startDate=2026-01-01
Authorization: Bearer {{token}}
```

## 5. Utility Endpoints

### 5.1 Health Check

**Request:**
```
GET http://localhost:5000/health
```

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "Access token is required"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already exists"
  }
}
```

## Testing Workflow

1. **Register** a new user (saves token automatically)
2. **Get Current User** to verify authentication
3. **Get Goals** to see default goals
4. **Update Goals** with custom values
5. **Save Week Activity** for current week
6. **Get Week Activity** to verify save
7. **Get All Activities** to see all weeks

## Admin Testing

To test admin endpoints:

1. Manually update user role in database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'john.smith@example.com';
```

2. Login again to get new token with admin role
3. Test **Get All Users** endpoint
4. Test **Get User's Activity** endpoints

## Notes

- All dates must be in YYYY-MM-DD format
- Week start dates must be Mondays
- All numeric values must be non-negative
- Tokens expire after 7 days (default)
- Rate limiting: 5 requests per 15 minutes for auth, 100 for others

