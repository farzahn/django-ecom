#!/bin/bash

echo "🚀 Starting Django + React Development Environment"
echo "=================================================="

# Change to the Django project directory
cd "$(dirname "$0")"

# Kill any existing development processes
echo "🧹 Cleaning up existing processes..."
python3 kill_dev_env.py

# Wait for processes to stop
sleep 3

# Start Django backend
echo "🐍 Starting Django backend on port 8000..."
python3 manage.py runserver 8000 &
DJANGO_PID=$!

# Start React frontend
echo "⚛️  Starting React frontend on port 3000..."
cd frontend
npm start &
REACT_PID=$!

# Wait for servers to start
sleep 8

# Check if both servers are running
echo ""
echo "🔍 Checking server status..."

if curl -s http://localhost:8000/admin/ > /dev/null; then
    echo "✅ Django API: http://localhost:8000"
else
    echo "❌ Django server not responding"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ React App: http://localhost:3000"
else
    echo "❌ React server not responding"
fi

echo ""
echo "🎉 Development environment ready!"
echo "📝 To stop servers, run: python3 kill_dev_env.py"
echo ""
echo "Press Ctrl+C to view logs or continue development..."

# Keep script running to show logs
wait