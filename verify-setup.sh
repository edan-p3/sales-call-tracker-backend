#!/bin/bash

# Backend Installation Verification Script
# Run this after setup to verify everything is working

echo "🔍 Sales Tracker Backend - Installation Verification"
echo "===================================================="
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js $NODE_VERSION installed"
else
    echo "   ❌ Node.js not found"
    ERRORS=$((ERRORS+1))
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm $NPM_VERSION installed"
else
    echo "   ❌ npm not found"
    ERRORS=$((ERRORS+1))
fi

# Check PostgreSQL
echo "🗄️  Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    echo "   ✅ PostgreSQL $PSQL_VERSION installed"
else
    echo "   ⚠️  PostgreSQL not found"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# Check if node_modules exists
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules directory exists"
    
    # Check key dependencies
    DEPS=("express" "prisma" "@prisma/client" "jsonwebtoken" "bcryptjs")
    for dep in "${DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo "   ✅ $dep installed"
        else
            echo "   ❌ $dep not found"
            ERRORS=$((ERRORS+1))
        fi
    done
else
    echo "   ❌ node_modules not found - run 'npm install'"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Check .env file
echo "⚙️  Checking configuration..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    # Check required variables
    if grep -q "DATABASE_URL=" .env; then
        echo "   ✅ DATABASE_URL configured"
    else
        echo "   ❌ DATABASE_URL not set in .env"
        ERRORS=$((ERRORS+1))
    fi
    
    if grep -q "JWT_SECRET=" .env; then
        echo "   ✅ JWT_SECRET configured"
    else
        echo "   ❌ JWT_SECRET not set in .env"
        ERRORS=$((ERRORS+1))
    fi
else
    echo "   ❌ .env file not found - copy from .env.example"
    ERRORS=$((ERRORS+1))
fi

echo ""

# Check Prisma
echo "🔧 Checking Prisma..."
if [ -d "node_modules/.prisma/client" ]; then
    echo "   ✅ Prisma client generated"
else
    echo "   ⚠️  Prisma client not generated - run 'npx prisma generate'"
    WARNINGS=$((WARNINGS+1))
fi

if [ -d "prisma/migrations" ]; then
    echo "   ✅ Prisma migrations exist"
else
    echo "   ⚠️  No migrations found - run 'npx prisma migrate dev'"
    WARNINGS=$((WARNINGS+1))
fi

echo ""

# Check file structure
echo "📁 Checking file structure..."
REQUIRED_DIRS=("src" "src/config" "src/controllers" "src/middleware" "src/routes" "src/utils" "prisma")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir/ exists"
    else
        echo "   ❌ $dir/ not found"
        ERRORS=$((ERRORS+1))
    fi
done

echo ""

# Check key files
echo "📄 Checking key files..."
REQUIRED_FILES=(
    "src/server.js"
    "src/config/database.js"
    "src/config/jwt.js"
    "prisma/schema.prisma"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file exists"
    else
        echo "   ❌ $file not found"
        ERRORS=$((ERRORS+1))
    fi
done

echo ""

# Try to connect to database (if .env exists)
if [ -f ".env" ] && [ -d "node_modules" ]; then
    echo "🗄️  Testing database connection..."
    if npx prisma db push --skip-generate &> /dev/null; then
        echo "   ✅ Database connection successful"
    else
        echo "   ⚠️  Database connection failed - check DATABASE_URL"
        WARNINGS=$((WARNINGS+1))
    fi
fi

echo ""

# Summary
echo "===================================================="
echo "📊 Verification Summary"
echo "===================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Perfect! Everything is set up correctly."
    echo ""
    echo "Next steps:"
    echo "  1. Start the server: npm run dev"
    echo "  2. Test health endpoint: curl http://localhost:5000/health"
    echo "  3. Review API docs: cat API_REFERENCE.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Setup complete with $WARNINGS warning(s)"
    echo ""
    echo "You can proceed but may want to address warnings."
    echo ""
    echo "Start the server: npm run dev"
    exit 0
else
    echo "❌ Found $ERRORS error(s) and $WARNINGS warning(s)"
    echo ""
    echo "Please fix errors before starting the server."
    echo ""
    echo "Common fixes:"
    echo "  - Run: npm install"
    echo "  - Create .env from .env.example"
    echo "  - Run: npx prisma generate"
    echo "  - Run: npx prisma migrate dev"
    exit 1
fi

