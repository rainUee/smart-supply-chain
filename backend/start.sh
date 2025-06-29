#!/bin/bash

# Smart Supply Chain Backend Startup Script

echo "🚀 Starting Smart Supply Chain Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database configuration before continuing."
    echo "   Press Enter when ready to continue..."
    read
fi

# Check if PostgreSQL is running (optional)
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL is not running. Please start PostgreSQL or use Docker."
        echo "   You can use: docker-compose up -d db"
    fi
fi

# Initialize database
echo "🗄️  Initializing database..."
python init_db.py

# Start the application
echo "🌐 Starting FastAPI application..."
echo "   API will be available at: http://localhost:8000"
echo "   API docs will be available at: http://localhost:8000/docs"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

python run.py 