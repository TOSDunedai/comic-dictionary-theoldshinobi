#!/bin/bash

# Comic Dictionary TheOldShinobi - Installation Script
# Run this script after extracting the project

echo "🥷 Installing Comic Dictionary TheOldShinobi..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8+ from https://python.org/"
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install and start MongoDB:"
    echo "https://www.mongodb.com/docs/manual/installation/"
fi

echo "📦 Installing Backend Dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo "🔧 Setup Complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "1. Start Backend:"
echo "   cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo "2. Start Frontend (new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "3. Access the application:"
echo "   http://localhost:3000"
echo ""
echo "📚 For more information, read the README.md file"
echo ""
echo "🥷 Ready for theoldshinobi.site community!"