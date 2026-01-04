# Quick Start Guide

Get the Sales Tracker Backend up and running in 5 minutes.

## Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ installed
- Terminal access

## 1. Install Dependencies

```bash
cd backend
npm install
```

## 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update:

```bash
# Minimum required changes:
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/sales_tracker
JWT_SECRET=your-super-secret-key-change-this-now
```

## 3. Create Database

```bash
# macOS/Linux
createdb sales_tracker

# Or using psql
psql
CREATE DATABASE sales_tracker;
\q
```

## 4. Run Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

## 5. Start Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
🚀 Server running on port 5000
📝 Environment: development
```

## 6. Test the API

Open another terminal:

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Quick Troubleshooting

### Port 5000 already in use

Change PORT in `.env`:
```bash
PORT=3001
```

### Database connection failed

Check DATABASE_URL format:
```
postgresql://username:password@host:port/database
```

### Prisma errors

Reset and retry:
```bash
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

## Using Automated Setup (macOS/Linux)

```bash
chmod +x setup.sh
./setup.sh
```

## Next Steps

- ✅ Read [README.md](README.md) for full documentation
- ✅ Test endpoints with [POSTMAN_COLLECTION.md](POSTMAN_COLLECTION.md)
- ✅ Connect frontend using [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
- ✅ Deploy with [DEPLOYMENT.md](DEPLOYMENT.md)

## Common Commands

```bash
# Development server
npm run dev

# Production server
npm start

# Database migrations
npm run migrate

# Prisma Studio (database GUI)
npx prisma studio

# View logs
tail -f logs/combined.log
```

## Support

If you encounter issues:
1. Check logs in `logs/` directory
2. Verify PostgreSQL is running: `pg_isready`
3. Check all environment variables are set
4. Review [README.md](README.md) troubleshooting section

---

**Ready to go! 🚀**

