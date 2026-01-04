# Sales Tracker Backend - Vercel Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub account
- Backend code pushed to GitHub

---

## Step 1: Push to GitHub

The backend is already initialized with git. Now push to GitHub:

```bash
# In the backend directory
cd backend

# Add all files
git add .

# Commit
git commit -m "Initial backend setup"

# Create GitHub repo and push (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/sales-tracker-backend.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Database

Vercel doesn't provide PostgreSQL directly, but you have several options:

### Option A: Use Vercel Postgres (Recommended)

1. Go to your Vercel project
2. Navigate to "Storage" tab
3. Click "Create Database" → "Postgres"
4. Copy the connection string

### Option B: Use Neon (Free Serverless Postgres)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use in Vercel environment variables

### Option C: Use Railway.app Postgres

1. Sign up at [railway.app](https://railway.app)
2. Create PostgreSQL database
3. Copy connection string
4. Use in Vercel environment variables

### Option D: Use Supabase (Free Postgres)

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Use in Vercel environment variables

---

## Step 3: Deploy to Vercel

### Via Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the project
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (if backend is in root) or `backend/` (if in subdirectory)
   - **Build Command:** `npm install && npx prisma generate`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

5. Add Environment Variables:
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```

6. Click "Deploy"

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? sales-tracker-backend
# - In which directory is your code located? ./

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CORS_ORIGIN

# Deploy to production
vercel --prod
```

---

## Step 4: Run Database Migrations

After deploying, you need to run Prisma migrations:

### Option A: Via Vercel CLI

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### Option B: Add to Build Command

Update `vercel.json` or project settings:

```json
{
  "buildCommand": "npm install && npx prisma generate && npx prisma migrate deploy"
}
```

### Option C: Use Vercel Build Hook

Create a separate script that runs after deployment:

```bash
# In package.json, add:
"scripts": {
  "vercel-build": "npx prisma generate && npx prisma migrate deploy"
}
```

---

## Step 5: Test Deployment

```bash
# Get your Vercel URL
https://your-project.vercel.app

# Test health endpoint
curl https://your-project.vercel.app/health

# Test API
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## Step 6: Configure Custom Domain (Optional)

1. Go to your Vercel project
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update CORS_ORIGIN environment variable

---

## Environment Variables Reference

Required environment variables for Vercel:

```bash
# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# JWT (Required)
JWT_SECRET=your-32-character-minimum-secret-key-here
JWT_EXPIRE=7d

# CORS (Required)
CORS_ORIGIN=https://your-frontend.vercel.app

# Server (Required)
NODE_ENV=production

# Optional
PORT=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Vercel-Specific Configuration

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### package.json Scripts

Add these scripts for Vercel:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "npx prisma generate",
    "vercel-build": "npx prisma generate && npx prisma migrate deploy",
    "postinstall": "npx prisma generate"
  }
}
```

---

## Troubleshooting

### Issue: Prisma Client not generated

**Solution:** Add postinstall script:
```json
"postinstall": "npx prisma generate"
```

### Issue: Database connection failed

**Solution:** Ensure connection string includes `?sslmode=require` for cloud databases:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Issue: CORS errors

**Solution:** Update CORS_ORIGIN to match your frontend URL:
```bash
vercel env add CORS_ORIGIN production
# Enter: https://your-frontend.vercel.app
```

### Issue: Function timeout

**Solution:** Vercel has 10s timeout on Hobby plan, 60s on Pro. Optimize queries or upgrade.

### Issue: Cold starts

**Solution:** This is normal for serverless. Consider:
- Upgrading to Pro for better performance
- Using connection pooling (Prisma Data Proxy)
- Implementing warming strategy

---

## Connection Pooling (Recommended)

For better database performance on Vercel, use connection pooling:

### Option 1: PgBouncer

Many providers (Neon, Supabase) offer built-in PgBouncer connection pooling:

```bash
# Use the pooled connection string
DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true
```

### Option 2: Prisma Data Proxy

```bash
# Set up Prisma Data Proxy
npx prisma generate --data-proxy

# Update DATABASE_URL to use proxy
DATABASE_URL=prisma://aws-us-east-1.prisma-data.com/?api_key=your-api-key
```

---

## Auto-Deploy on Git Push

Vercel automatically deploys on every push to main:

```bash
git add .
git commit -m "Update backend"
git push origin main
# Vercel automatically deploys!
```

---

## Preview Deployments

Every branch and PR gets a preview URL:

```bash
git checkout -b feature-branch
git add .
git commit -m "New feature"
git push origin feature-branch
# Vercel creates preview URL
```

---

## Monitoring & Logs

### View Logs

1. Go to Vercel dashboard
2. Select your project
3. Click on a deployment
4. View "Runtime Logs"

### Set Up Monitoring

Consider adding:
- **Sentry:** Error tracking
- **LogRocket:** Session replay
- **New Relic:** Performance monitoring

---

## Cost Considerations

### Vercel Pricing
- **Hobby:** Free
  - 100 GB bandwidth
  - Serverless function execution
  - Limited build time

- **Pro:** $20/month
  - More bandwidth
  - Better performance
  - Priority support

### Database Pricing
- **Neon:** Free tier available
- **Supabase:** Free tier available
- **Railway:** $5/month minimum
- **Vercel Postgres:** Varies by usage

---

## Complete Deployment Checklist

- [ ] Backend code pushed to GitHub
- [ ] Database created (Neon/Supabase/Railway/Vercel Postgres)
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Prisma migrations run
- [ ] Health endpoint tested
- [ ] API endpoints tested
- [ ] CORS configured for frontend
- [ ] Frontend REACT_APP_API_URL updated
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)

---

## Next Steps After Deployment

1. **Update Frontend:**
   ```bash
   # In frontend .env
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

2. **Test Integration:**
   - Register a user
   - Login
   - Create goals
   - Save activities
   - Test all features

3. **Monitor:**
   - Check Vercel logs
   - Watch for errors
   - Monitor database usage

4. **Optimize:**
   - Enable connection pooling
   - Add caching if needed
   - Optimize database queries

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Your backend is ready for Vercel! 🚀**

Follow the steps above to deploy to production.

