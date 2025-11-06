#!/bin/bash
# VitalVibe Quick Start Script

echo "🚀 VitalVibe Quick Start"
echo "========================"
echo ""

# Check if we're in server directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this from the server directory"
    echo "   cd server && bash setup.sh"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "🚀 Starting VitalVibe Server..."
echo ""
echo "The server will start on: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
