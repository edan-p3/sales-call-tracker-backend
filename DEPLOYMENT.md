# Deployment Guide

Complete guide for deploying the Sales Tracker Backend API to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested with Postman
- [ ] CORS configured for production frontend URL
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Error logging configured
- [ ] Rate limiting tested

## Option 1: Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed
- Git repository initialized

### Step 1: Install Heroku CLI

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Windows:**
Download from [heroku.com/downloads](https://devcenter.heroku.com/articles/heroku-cli)

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Login to Heroku

```bash
heroku login
```

### Step 3: Create Heroku App

```bash
# Navigate to backend directory
cd backend

# Create app
heroku create sales-tracker-backend

# Or with custom name
heroku create your-custom-name
```

### Step 4: Add PostgreSQL Database

```bash
# Add mini PostgreSQL (free tier)
heroku addons:create heroku-postgresql:mini

# Verify it was added
heroku config:get DATABASE_URL
```

### Step 5: Set Environment Variables

```bash
# JWT Secret (generate strong secret)
heroku config:set JWT_SECRET="your-super-secret-production-key-min-32-chars"

# Environment
heroku config:set NODE_ENV=production

# CORS (your frontend URL)
heroku config:set CORS_ORIGIN="https://your-frontend-url.vercel.app"

# JWT Expiration
heroku config:set JWT_EXPIRE=7d

# View all config
heroku config
```

### Step 6: Create Procfile

Create `Procfile` in backend root:

```
web: npm start
release: npx prisma migrate deploy
```

### Step 7: Deploy to Heroku

```bash
# Add files
git add .
git commit -m "Prepare for Heroku deployment"

# Deploy
git push heroku main

# Or if you're on a different branch
git push heroku your-branch:main
```

### Step 8: Run Database Migrations

```bash
# Generate Prisma client
heroku run npx prisma generate

# Run migrations
heroku run npx prisma migrate deploy
```

### Step 9: Check Logs

```bash
# View recent logs
heroku logs --tail

# View specific number of lines
heroku logs -n 200
```

### Step 10: Open App

```bash
heroku open
# Or visit: https://your-app-name.herokuapp.com/health
```

### Heroku Commands Reference

```bash
# Restart app
heroku restart

# Run bash in Heroku
heroku run bash

# View database info
heroku pg:info

# Access database
heroku pg:psql

# View environment variables
heroku config

# Set environment variable
heroku config:set KEY=value

# Remove environment variable
heroku config:unset KEY
```

---

## Option 2: Railway.app Deployment

### Prerequisites
- Railway.app account
- GitHub account
- Git repository

### Step 1: Sign Up

Visit [railway.app](https://railway.app) and sign up with GitHub.

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your backend repository
4. Railway will auto-detect Node.js

### Step 3: Add PostgreSQL Database

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically sets DATABASE_URL

### Step 4: Configure Environment Variables

1. Click on your service
2. Go to "Variables" tab
3. Add variables:
   - `NODE_ENV`: production
   - `JWT_SECRET`: your-secret-here
   - `JWT_EXPIRE`: 7d
   - `CORS_ORIGIN`: your-frontend-url
   - `PORT`: 5000

### Step 5: Configure Build Settings

1. Go to "Settings" tab
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Root Directory: `/backend` (if backend is in subdirectory)

### Step 6: Deploy

Railway automatically deploys on git push to main branch.

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### Step 7: Run Migrations

1. Go to your service in Railway
2. Click "..." → "Open Terminal"
3. Run:
```bash
npx prisma generate
npx prisma migrate deploy
```

### Step 8: Get Public URL

1. Go to "Settings"
2. Click "Generate Domain"
3. Your API will be available at: `https://your-project.railway.app`

---

## Option 3: Render.com Deployment

### Prerequisites
- Render.com account
- Git repository

### Step 1: Sign Up

Visit [render.com](https://render.com) and create account.

### Step 2: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repository and branch

### Step 3: Configure Service

**Basic Settings:**
- Name: sales-tracker-backend
- Environment: Node
- Region: Choose closest to users
- Branch: main
- Root Directory: backend (if in subdirectory)
- Build Command: `npm install && npx prisma generate`
- Start Command: `npm start`

### Step 4: Add PostgreSQL Database

1. Go to Dashboard → "New +" → "PostgreSQL"
2. Name: sales-tracker-db
3. Copy "Internal Database URL"

### Step 5: Set Environment Variables

In your web service, go to "Environment" tab:

```
NODE_ENV=production
DATABASE_URL=[paste internal database URL]
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-url.com
PORT=5000
```

### Step 6: Deploy

Render automatically deploys on git push.

### Step 7: Run Migrations

1. Go to "Shell" tab in your web service
2. Run:
```bash
npx prisma migrate deploy
```

Or add to build command:
```
npm install && npx prisma generate && npx prisma migrate deploy
```

### Step 8: Access Your API

Your API will be at: `https://your-service-name.onrender.com`

---

## Option 4: DigitalOcean App Platform

### Step 1: Create Account

Sign up at [digitalocean.com](https://www.digitalocean.com/)

### Step 2: Create App

1. Go to Apps → "Create App"
2. Choose GitHub and select repository
3. Select branch (main)

### Step 3: Add Database

1. Add Component → Database → PostgreSQL
2. Choose plan (Dev database is free)

### Step 4: Configure Environment

```
NODE_ENV=production
JWT_SECRET=your-secret-here
JWT_EXPIRE=7d
CORS_ORIGIN=your-frontend-url
DATABASE_URL=${db.DATABASE_URL}
```

### Step 5: Deploy

App Platform auto-deploys on push.

---

## Option 5: AWS Elastic Beanstalk

### Prerequisites
- AWS account
- EB CLI installed

### Installation

```bash
pip install awsebcli --upgrade --user
```

### Setup

```bash
# Initialize
eb init -p node.js sales-tracker-backend --region us-east-1

# Create environment
eb create sales-tracker-env

# Deploy
eb deploy

# Open app
eb open
```

---

## Post-Deployment

### 1. Test Health Endpoint

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-04T..."
}
```

### 2. Test Authentication

```bash
# Register
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Update Frontend

Update frontend `.env`:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 4. Monitor Logs

**Heroku:**
```bash
heroku logs --tail
```

**Railway:**
Dashboard → Your Service → Logs

**Render:**
Dashboard → Your Service → Logs

### 5. Set Up Monitoring (Optional)

Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **New Relic** for performance monitoring
- **Datadog** for infrastructure monitoring

---

## Database Management

### Backup Database (Heroku)

```bash
# Create backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download

# Schedule automatic backups
heroku pg:backups:schedule --at '02:00 America/Los_Angeles'
```

### Access Production Database

**Heroku:**
```bash
heroku pg:psql
```

**Railway:**
```bash
# Get connection string
railway variables
# Use with any PostgreSQL client
```

**Render:**
```bash
# Copy External Database URL from dashboard
# Use with psql or any PostgreSQL client
psql [EXTERNAL_DATABASE_URL]
```

### Run Migrations

```bash
# Heroku
heroku run npx prisma migrate deploy

# Railway (in terminal)
npx prisma migrate deploy

# Render (in shell)
npx prisma migrate deploy
```

---

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` to git
- Use different secrets for dev/production
- Rotate JWT_SECRET periodically

### 2. Database

- Use connection pooling
- Enable SSL for database connections
- Regular backups

### 3. CORS

- Only allow specific frontend URLs
- Never use `*` in production

### 4. Rate Limiting

- Monitor rate limit hits
- Adjust limits based on usage
- Consider API keys for heavy users

### 5. Logging

- Never log passwords or tokens
- Use structured logging
- Set up log rotation
- Monitor error rates

---

## Troubleshooting

### Application Crashes

**Check logs:**
```bash
heroku logs --tail
```

**Common issues:**
- Missing environment variables
- Database connection errors
- Out of memory
- Port binding issues

### Database Connection Errors

**Verify DATABASE_URL:**
```bash
heroku config:get DATABASE_URL
```

**Test connection:**
```bash
heroku run npx prisma db push
```

### Migration Errors

**Reset database (⚠️ deletes all data):**
```bash
heroku run npx prisma migrate reset
```

**Force deploy migrations:**
```bash
heroku run npx prisma migrate deploy --force
```

### CORS Errors

Verify CORS_ORIGIN matches your frontend URL exactly:
```bash
heroku config:get CORS_ORIGIN
```

Update if needed:
```bash
heroku config:set CORS_ORIGIN=https://correct-frontend-url.com
```

---

## Scaling

### Heroku

```bash
# Scale to 2 dynos
heroku ps:scale web=2

# Upgrade to Standard-1X
heroku ps:type web=Standard-1X

# Enable auto-scaling (Performance dynos)
heroku ps:autoscale:enable web --min 1 --max 5
```

### Railway

1. Go to Service Settings
2. Adjust Memory/CPU allocation
3. Enable auto-scaling

### Render

1. Go to Service Settings
2. Upgrade plan
3. Adjust instance count

---

## Cost Estimates

### Heroku
- Eco Dynos: $5/month (can sleep)
- Basic Dynos: $7/month (no sleep)
- Mini PostgreSQL: $5/month
- **Total:** ~$10-12/month

### Railway
- $5/month + usage
- Typically $10-15/month for small apps

### Render
- Free tier available (with limitations)
- Starter: $7/month
- PostgreSQL: $7/month
- **Total:** ~$14/month

### DigitalOcean
- Basic App: $5/month
- Dev Database: Free
- **Total:** ~$5/month

---

## Continuous Deployment

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
          appdir: "backend"
```

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Test locally first
- Verify all environment variables

---

**Your backend is now deployed and ready for production! 🚀**

