#!/bin/bash

# Quick Deployment Helper Script
# This script helps you deploy to GitHub and Vercel

echo "🚀 Sales Tracker Backend - Deployment Helper"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from the backend directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized"
    echo "   Please run: git init"
    exit 1
fi

# Check if there are commits
if ! git log &> /dev/null; then
    echo "❌ Error: No commits found"
    echo "   Please run: git add . && git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Git repository ready"
echo ""

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo "📝 GitHub Remote Not Set"
    echo ""
    echo "Next steps:"
    echo "1. Create a new repository on GitHub:"
    echo "   → https://github.com/new"
    echo ""
    echo "2. After creating, run this command with YOUR repository URL:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/sales-tracker-backend.git"
    echo ""
    echo "3. Then push to GitHub:"
    echo "   git push -u origin main"
    echo ""
else
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ GitHub remote configured: $REMOTE_URL"
    echo ""
    
    # Check if pushed
    if git branch -r | grep -q 'origin/main'; then
        echo "✅ Code already pushed to GitHub"
    else
        echo "📤 Ready to push to GitHub"
        echo ""
        read -p "Push to GitHub now? (y/N): " PUSH_NOW
        if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
            git push -u origin main
            echo ""
            echo "✅ Code pushed to GitHub!"
        fi
    fi
fi

echo ""
echo "=============================================="
echo "📋 Deployment Checklist"
echo "=============================================="
echo ""

# Check each step
GITHUB_DONE=false
if git remote get-url origin &> /dev/null && git branch -r | grep -q 'origin/main'; then
    echo "✅ Code pushed to GitHub"
    GITHUB_DONE=true
else
    echo "⬜ Push code to GitHub"
fi

echo "⬜ Set up database (Neon/Supabase/Railway)"
echo "⬜ Create Vercel account"
echo "⬜ Import GitHub repo to Vercel"
echo "⬜ Add environment variables"
echo "⬜ Deploy to Vercel"
echo "⬜ Run database migrations"
echo "⬜ Test deployment"

echo ""
echo "=============================================="
echo "🎯 Next Steps"
echo "=============================================="
echo ""

if [ "$GITHUB_DONE" = true ]; then
    echo "Great! Your code is on GitHub."
    echo ""
    echo "Next: Set up your database"
    echo ""
    echo "Option A - Neon (Recommended, Free):"
    echo "  1. Go to https://neon.tech"
    echo "  2. Sign up with GitHub"
    echo "  3. Create new project: sales-tracker"
    echo "  4. Copy connection string"
    echo ""
    echo "Option B - Supabase (Free):"
    echo "  1. Go to https://supabase.com"
    echo "  2. Sign up with GitHub"
    echo "  3. Create new project: sales-tracker"
    echo "  4. Copy connection string from Settings → Database"
    echo ""
    echo "Then: Deploy to Vercel"
    echo "  1. Go to https://vercel.com"
    echo "  2. Import your GitHub repository"
    echo "  3. Add environment variables (see DEPLOY_NOW.md)"
    echo "  4. Click Deploy"
    echo ""
    echo "📚 Full instructions: open DEPLOY_NOW.md"
else
    echo "Next: Push your code to GitHub"
    echo ""
    echo "1. Create repository: https://github.com/new"
    echo "2. Add remote: git remote add origin <your-repo-url>"
    echo "3. Push: git push -u origin main"
    echo ""
    echo "📚 Full instructions: open DEPLOY_NOW.md"
fi

echo ""
echo "🔗 Quick Links:"
echo "  • Create GitHub Repo: https://github.com/new"
echo "  • Neon Database: https://neon.tech"
echo "  • Supabase: https://supabase.com"
echo "  • Vercel Deploy: https://vercel.com/new"
echo ""
echo "📚 Detailed guide: cat DEPLOY_NOW.md"
echo ""

