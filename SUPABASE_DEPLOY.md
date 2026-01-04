# 🚀 Deploy with Supabase - Quick Guide

Complete guide for deploying the Sales Tracker Backend with Supabase database.

---

## **STEP 1: Push to GitHub** (2 minutes)

### A. Create GitHub Repository

1. Go to **[github.com/new](https://github.com/new)**
2. Repository name: `sales-tracker-backend`
3. Keep Public or make Private
4. **Don't** check any initialization options
5. Click **"Create repository"**

### B. Push Your Code

```bash
cd "/Users/edandvora/Documents/Sales Call Tracker/backend"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sales-tracker-backend.git

# Push to GitHub
git push -u origin main
```

✅ **Code is on GitHub!**

---

## **STEP 2: Set Up Supabase Database** (3 minutes)

### A. Create Supabase Project

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"** → **"Sign in"** with GitHub
3. Click **"New project"**

### B. Configure Project

Fill in the form:

- **Name:** `sales-tracker`
- **Database Password:** Create a strong password (SAVE THIS!)
- **Region:** Choose closest to you (e.g., `US West` or `US East`)
- **Pricing Plan:** Free

Click **"Create new project"**

⏱️ Wait 2-3 minutes while Supabase sets up your database...

### C. Get Connection String

Once the project is ready:

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"Database"**
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. **Copy the connection string**

It will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

6. **Replace `[YOUR-PASSWORD]`** with the password you created
7. **Add this to the end:** `?pgbouncer=true&connection_limit=1`

**Final connection string should look like:**
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

**📝 SAVE THIS CONNECTION STRING** - you'll need it in the next step!

---

## **STEP 3: Deploy to Vercel** (5 minutes)

### A. Sign Up & Import

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign up"** → Use GitHub
3. Authorize Vercel
4. Click **"Add New..."** → **"Project"**
5. Find `sales-tracker-backend` → Click **"Import"**

### B. Configure Project

Keep these settings:

- **Framework Preset:** Other
- **Root Directory:** `./`
- **Build Command:** `npm run build`

### C. Add Environment Variables

Click **"Environment Variables"** section.

Add these 5 variables one by one:

#### 1. DATABASE_URL
**Name:** `DATABASE_URL`  
**Value:** Paste your Supabase connection string from Step 2C

Example:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

#### 2. JWT_SECRET
**Name:** `JWT_SECRET`  
**Value:** Generate a random secret

Run this in Terminal to generate:
```bash
openssl rand -base64 32
```

Or use this one:
```
a8f5e9c2b7d4e1a9c6f3b8e5d2a7c4f1e8b5d2a9c6f3e8b5d2a7c4f1e8b5d2a9
```

#### 3. JWT_EXPIRE
**Name:** `JWT_EXPIRE`  
**Value:** `7d`

#### 4. NODE_ENV
**Name:** `NODE_ENV`  
**Value:** `production`

#### 5. CORS_ORIGIN
**Name:** `CORS_ORIGIN`  
**Value:** `*`

(We'll update this to your frontend URL later)

### D. Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes ☕
3. You'll get a URL like: `https://sales-tracker-backend-xxx.vercel.app`

**📝 SAVE YOUR VERCEL URL!**

---

## **STEP 4: Initialize Database** (1 minute)

Now we need to create the database tables.

### A. Get Direct Connection String

We need a different connection string for migrations (without pgbouncer):

1. Go back to **Supabase** → **Settings** → **Database**
2. Find **"Connection string"** → **"URI"** tab
3. Copy it again
4. Replace `[YOUR-PASSWORD]` with your password
5. **This time ADD:** `?sslmode=require`

Should look like:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### B. Run Migrations

In Terminal:

```bash
cd "/Users/edandvora/Documents/Sales Call Tracker/backend"

# Replace with your DIRECT connection string (with sslmode=require, NOT pgbouncer)
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?sslmode=require" npx prisma migrate deploy
```

You should see:
```
✅ Migration applied successfully
```

---

## **STEP 5: Test Your Deployment** (1 minute)

### A. Test Health Endpoint

```bash
# Replace with YOUR Vercel URL
curl https://your-project.vercel.app/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-04T..."
}
```

### B. Test in Browser

Open: `https://your-project.vercel.app/health`

You should see the JSON response above.

### C. Test Registration

```bash
# Replace with YOUR Vercel URL
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      ...
    }
  }
}
```

✅ **Your backend is fully operational!**

---

## **STEP 6: Verify Database** (Optional)

Check that data was created in Supabase:

1. Go to **Supabase Dashboard**
2. Click **"Table Editor"** in left sidebar
3. You should see these tables:
   - users
   - goals
   - weekly_activities
   - organizations

4. Click on **"users"** table
5. You should see your test user!

---

## **📋 Quick Reference**

### Supabase Connection Strings

You need **TWO** different connection strings:

#### For Vercel (Runtime with Connection Pooling):
```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

#### For Migrations (Direct Connection):
```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Important URLs

- **Supabase Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Your Backend API:** `https://your-project.vercel.app`

---

## **🔧 Troubleshooting**

### Issue: "Connection refused"

**Solution:** Make sure you:
1. Replaced `[YOUR-PASSWORD]` with your actual password
2. Used the correct connection string format
3. Added `?pgbouncer=true&connection_limit=1` for Vercel
4. Added `?sslmode=require` for migrations

### Issue: "Too many connections"

**Solution:** You're using the direct connection string in Vercel. Use the pgbouncer version:
```
?pgbouncer=true&connection_limit=1
```

### Issue: "Migration failed"

**Solution:** Make sure you're using the DIRECT connection (without pgbouncer) for migrations:
```
?sslmode=require
```

### Issue: "Table doesn't exist"

**Solution:** Migrations didn't run. Run them again:
```bash
DATABASE_URL="your-direct-connection-string" npx prisma migrate deploy
```

---

## **✅ Success Checklist**

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database password saved
- [ ] Connection strings saved (both versions)
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] All 5 environment variables added
- [ ] Deployed to Vercel
- [ ] Migrations run successfully
- [ ] Health endpoint returns 200 OK
- [ ] Registration endpoint works
- [ ] Test user visible in Supabase Table Editor

---

## **🎯 What's Next?**

Once your backend is deployed and tested:

1. **Update Frontend** to use your backend API
2. **Deploy Frontend** to Vercel
3. **Update CORS_ORIGIN** in backend to match frontend URL
4. **Test Full Integration** end-to-end

---

## **💰 Pricing**

- **GitHub:** Free ✅
- **Vercel:** Free (Hobby) ✅
- **Supabase:** Free (500MB database, 2GB bandwidth) ✅

**Total: $0/month**

Supabase free tier includes:
- Unlimited API requests
- 500MB database space
- 2GB bandwidth
- Social OAuth
- 50,000 monthly active users

---

## **🎊 You're Done!**

Your backend is now:
- ✅ Deployed to Vercel
- ✅ Connected to Supabase
- ✅ Fully tested and working
- ✅ Ready for frontend integration

**Save these URLs:**
- Backend: `https://your-project.vercel.app`
- Supabase: `https://app.supabase.com/project/your-project-id`

---

**Next: Deploy your frontend!** 🚀

