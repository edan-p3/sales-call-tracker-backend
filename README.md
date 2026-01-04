# Sales Activity Tracker - Backend API

A robust Node.js/Express backend API for the Sales Activity Tracker application, featuring JWT authentication, PostgreSQL database, and RESTful endpoints for managing sales activities, goals, and user data.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Goals Management**: Personalized daily and weekly sales goals
- **Activity Tracking**: Track calls, emails, contacts, and responses by week
- **Multi-User Support**: Role-based access control (admin, manager, sales_rep)
- **Security**: Rate limiting, helmet security headers, input validation
- **Database**: PostgreSQL with Prisma ORM
- **Error Handling**: Comprehensive error handling with standardized responses
- **Logging**: Winston logger for production-grade logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sales_tracker

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Set Up Database

Create a PostgreSQL database:

```bash
createdb sales_tracker
```

Or using psql:

```sql
CREATE DATABASE sales_tracker;
```

### 5. Run Prisma Migrations

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run migrate
```

### 6. Start the Server

**Development mode with auto-reload:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Base URL

- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "sales_rep"
    }
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Goals Endpoints

#### Get User Goals

```http
GET /api/goals
Authorization: Bearer <token>
```

#### Update Goals

```http
PUT /api/goals
Authorization: Bearer <token>
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

### Activity Endpoints

#### Get Week Activity

```http
GET /api/activity/week/2026-01-06
Authorization: Bearer <token>
```

**Note:** Week start date must be a Monday in YYYY-MM-DD format.

#### Save Week Activity

```http
POST /api/activity/week
Authorization: Bearer <token>
Content-Type: application/json

{
  "weekStartDate": "2026-01-06",
  "monday": { "calls": 30, "emails": 35, "contacts": 12, "responses": 6 },
  "tuesday": { "calls": 28, "emails": 32, "contacts": 10, "responses": 5 },
  "wednesday": { "calls": 25, "emails": 30, "contacts": 11, "responses": 4 },
  "thursday": { "calls": 27, "emails": 33, "contacts": 9, "responses": 7 },
  "friday": { "calls": 29, "emails": 31, "contacts": 13, "responses": 6 }
}
```

#### Get All Activities

```http
GET /api/activity/all?startDate=2025-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

### User Management Endpoints (Admin/Manager Only)

#### Get All Users

```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User's Week Activity

```http
GET /api/users/:userId/activity/week/2026-01-06
Authorization: Bearer <token>
```

#### Get User's All Activities

```http
GET /api/users/:userId/activity/all?startDate=2025-01-01
Authorization: Bearer <token>
```

## 🔐 Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

### Token Expiration

- Default: 7 days
- Configurable via `JWT_EXPIRE` environment variable

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes
- **Password Hashing**: bcrypt with 10 salt rounds
- **Input Validation**: express-validator on all inputs
- **SQL Injection Protection**: Prisma parameterized queries

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Prisma database connection
│   │   ├── jwt.js            # JWT configuration
│   │   └── logger.js         # Winston logger setup
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication & authorization
│   │   ├── errorHandler.js   # Global error handling
│   │   └── validate.js       # Request validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── goalsController.js
│   │   ├── activityController.js
│   │   └── usersController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── activity.js
│   │   └── users.js
│   ├── utils/
│   │   ├── dateHelpers.js     # Date validation utilities
│   │   ├── responseHandler.js # Standardized API responses
│   │   └── validators.js      # Custom validators
│   └── server.js              # Express app entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── logs/                      # Log files (auto-generated)
├── .env                       # Environment variables (not in git)
├── .env.example              # Example environment file
├── .gitignore
├── package.json
└── README.md
```

## 🚢 Deployment

### Heroku Deployment

1. Install Heroku CLI and login:
```bash
heroku login
```

2. Create Heroku app:
```bash
heroku create sales-tracker-backend
```

3. Add PostgreSQL:
```bash
heroku addons:create heroku-postgresql:mini
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your-production-secret-here
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend-url.com
```

5. Deploy:
```bash
git push heroku main
```

6. Run migrations:
```bash
heroku run npm run migrate:deploy
```

### Railway.app Deployment

1. Sign up at [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add PostgreSQL database from Railway dashboard
4. Set environment variables in dashboard
5. Deploy automatically on git push

### Render.com Deployment

1. Sign up at [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

## 🧪 Testing

### Health Check

Test if the server is running:

```bash
curl http://localhost:5000/health
```

### API Testing Tools

- **Postman**: Import the provided collection (see `POSTMAN_COLLECTION.md`)
- **Thunder Client**: VS Code extension for API testing
- **curl**: Command-line testing

### Example curl Requests

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

## 🐛 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure database exists: `psql -l`

### Port Already in Use

Change PORT in `.env` or kill process:
```bash
# Find process using port 5000
lsof -ti:5000
# Kill process
kill -9 <PID>
```

### Prisma Migration Errors

Reset database (⚠️ deletes all data):
```bash
npx prisma migrate reset
```

### JWT Token Errors

- Ensure JWT_SECRET is at least 32 characters
- Check token expiration hasn't passed
- Verify Authorization header format: `Bearer <token>`

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `JWT_SECRET` | Secret for JWT signing | - | Yes |
| `JWT_EXPIRE` | Token expiration time | 7d | No |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Check existing documentation
- Review API endpoint specifications

## 🎯 Next Steps

1. ✅ Backend API is complete
2. Update frontend to use API instead of localStorage
3. Add login/register pages to frontend
4. Deploy both frontend and backend
5. Test full integration

---

**Built with ❤️ using Node.js, Express, and PostgreSQL**

