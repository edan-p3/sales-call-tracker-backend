#!/bin/bash

# Sales Tracker Backend - Setup Script
# This script helps set up the backend for local development

echo "🚀 Sales Tracker Backend Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL 12+ to continue."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

echo "✅ PostgreSQL detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your configuration:"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
    echo "   - JWT_SECRET: Generate a strong secret (32+ characters)"
    echo ""
    read -p "Press enter to continue after updating .env..."
else
    echo "✅ .env file already exists"
fi

echo ""

# Create database
echo "🗄️  Setting up database..."
read -p "Enter database name (default: sales_tracker): " DB_NAME
DB_NAME=${DB_NAME:-sales_tracker}

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Drop and recreate? (y/N): " DROP_DB
    if [ "$DROP_DB" = "y" ] || [ "$DROP_DB" = "Y" ]; then
        dropdb $DB_NAME
        createdb $DB_NAME
        echo "✅ Database recreated"
    else
        echo "Using existing database"
    fi
else
    createdb $DB_NAME
    echo "✅ Database '$DB_NAME' created"
fi

echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✅ Migrations completed"
echo ""

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"
echo ""

# Success message
echo "================================"
echo "🎉 Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Review your .env configuration"
echo "  2. Start the development server:"
echo "     npm run dev"
echo ""
echo "  3. Test the API:"
echo "     curl http://localhost:5000/health"
echo ""
echo "  4. View Prisma Studio (database GUI):"
echo "     npx prisma studio"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete documentation"
echo "   - POSTMAN_COLLECTION.md - API testing examples"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - FRONTEND_INTEGRATION.md - Connect to frontend"
echo ""
echo "Happy coding! 🚀"

