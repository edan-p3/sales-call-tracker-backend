# 🚀 GitHub & Vercel Deployment - Quick Start

Your backend is ready to push to GitHub and deploy to Vercel!

## ✅ What's Already Done

- ✅ Git repository initialized
- ✅ All files committed
- ✅ `.gitignore` configured
- ✅ `vercel.json` created for Vercel deployment
- ✅ Package.json updated with Vercel scripts
- ✅ Complete documentation ready

**Commit:** `Initial backend setup with Express, Prisma, JWT auth, and complete API`
**Files:** 34 files, 6,561 lines committed

---

## 📋 Next Steps (5 Minutes)

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `sales-tracker-backend` (or your choice)
3. Description: "Backend API for Sales Activity Tracker"
4. **Keep it Public** or Private (your choice)
5. **DON'T** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push to GitHub

Copy your new repository URL (looks like: `https://github.com/YOUR_USERNAME/sales-tracker-backend.git`)

Run these commands in Terminal:

```bash
cd "/Users/edandvora/Documents/Sales Call Tracker/backend"

# Add GitHub as remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/sales-tracker-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**✅ Your code is now on GitHub!**

---

## 🎯 Step 3: Set Up Database (Choose One)

Before deploying to Vercel, you need a PostgreSQL database:

### **Option A: Neon (Recommended - Free)** ⭐

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Click "Create Project"
4. Project name: `sales-tracker`
5. Region: Choose closest to you
6. Click "Create Project"
7. **Copy the connection string** (looks like: `postgresql://user:pass@host/db`)
8. **Save it** - you'll need it for Vercel

### **Option B: Supabase (Free)**

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. New Project → Name: `sales-tracker`
4. Choose region and password
5. Wait for setup (2-3 minutes)
6. Go to Settings → Database
7. **Copy "Connection string" (URI format)**
8. **Save it** - you'll need it for Vercel

### **Option C: Railway (Paid - $5/month)**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy PostgreSQL
4. Copy the connection string
5. **Save it** - you'll need it for Vercel

---

## 🚀 Step 4: Deploy to Vercel

### A. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### B. Import Project

1. Click "Add New..." → "Project"
2. Import your `sales-tracker-backend` repository
3. Click "Import"

### C. Configure Project

**Framework Preset:** Other

**Root Directory:** `./` (leave as is)

**Build & Development Settings:**
- Build Command: `npm run build`
- Output Directory: (leave empty)
- Install Command: `npm install`
- Development Command: `npm run dev`

### D. Add Environment Variables

Click "Environment Variables" and add these:

#### Required Variables:

```bash
DATABASE_URL
# Paste your database connection string from Neon/Supabase
# Example: postgresql://user:pass@host.neon.tech/sales_tracker?sslmode=require

JWT_SECRET
# Generate a random 32+ character string
# Example: use this command in terminal: openssl rand -base64 32
# Or use: a8f5e9c2b7d4e1a9c6f3b8e5d2a7c4f1e8b5d2a9c6f3e8b5d2a7c4f1e8b5d2a9

JWT_EXPIRE
7d

NODE_ENV
production

CORS_ORIGIN
https://your-frontend-name.vercel.app
# You'll update this after deploying frontend
# For now use: *
```

**To generate JWT_SECRET in Terminal:**
```bash
openssl rand -base64 32
```

### E. Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes for build and deployment
3. You'll get a URL like: `https://sales-tracker-backend-xxx.vercel.app`

---

## ✅ Step 5: Run Database Migrations

After deployment, you need to initialize the database:

### Option A: Via Terminal (Easiest)

```bash
cd "/Users/edandvora/Documents/Sales Call Tracker/backend"

# Pull production environment variables
npx vercel env pull .env.production

# Run migrations
npx prisma migrate deploy

# Alternative: Use your database URL directly
DATABASE_URL="your-connection-string-here" npx prisma migrate deploy
```

### Option B: Via Vercel Dashboard

1. Go to your Vercel project
2. Settings → Environment Variables
3. The migrations will run automatically on next deployment

---

## 🧪 Step 6: Test Your Deployment

### Test Health Endpoint

```bash
curl https://your-project.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### Test Registration

```bash
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test in Browser

Open: `https://your-project.vercel.app/health`

---

## 📝 Step 7: Save Your URLs

**GitHub Repository:**
```
https://github.com/YOUR_USERNAME/sales-tracker-backend
```

**Vercel Backend URL:**
```
https://your-project.vercel.app
```

**Database Connection String:** (saved securely)

---

## 🎨 Next: Deploy Frontend

Once your backend is live, deploy your frontend:

1. Update frontend `.env`:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```

2. Push frontend to GitHub

3. Deploy frontend to Vercel

4. Update backend `CORS_ORIGIN`:
   ```bash
   # In Vercel dashboard → Environment Variables
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. Redeploy backend (Vercel dashboard → Deployments → ... → Redeploy)

---

## 🔧 Troubleshooting

### Issue: "Prisma Client not found"

**Solution:** Add to `package.json`:
```json
"postinstall": "npx prisma generate"
```
Already added! ✅

### Issue: Database connection failed

**Solution:** Ensure connection string includes `?sslmode=require`:
```
postgresql://user:pass@host/db?sslmode=require
```

### Issue: CORS errors

**Solution:** Update `CORS_ORIGIN` in Vercel to match frontend URL exactly.

### Issue: Can't run migrations

**Solution:** Use Vercel CLI:
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull
npx prisma migrate deploy
```

---

## 📊 Monitoring

### View Logs

1. Vercel Dashboard → Your Project
2. Click on a deployment
3. View "Runtime Logs"

### Check Function Invocations

1. Vercel Dashboard → Your Project
2. Analytics tab

---

## 🎯 Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Database created (Neon/Supabase/Railway)
- [ ] Vercel account created
- [ ] Project deployed to Vercel
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health endpoint tested (✅ 200 OK)
- [ ] API endpoint tested (✅ registration works)
- [ ] Backend URL saved

---

## 💰 Cost Summary

- **GitHub:** Free
- **Vercel:** Free (Hobby tier)
- **Database:** 
  - Neon: Free
  - Supabase: Free
  - Railway: $5/month

**Total: $0-5/month**

---

## 🆘 Need Help?

### Quick Commands

```bash
# Check git status
git status

# View git log
git log --oneline

# Check Vercel deployment
vercel logs

# Test locally
npm run dev
curl http://localhost:5000/health
```

### Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [GitHub Documentation](https://docs.github.com)

---

## 🎉 You're Ready!

Follow the steps above to:
1. ✅ Push to GitHub (2 minutes)
2. ✅ Set up database (3 minutes)
3. ✅ Deploy to Vercel (5 minutes)
4. ✅ Test deployment (2 minutes)

**Total time: ~12 minutes**

---

## 🔄 Making Changes

After initial deployment, to make updates:

```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push origin main

# Vercel automatically deploys! 🚀
```

---

**Let's deploy! Start with Step 1 above.** 🚀

