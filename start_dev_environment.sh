#!/bin/bash

# Django E-commerce Development Environment Startup Script
# This script ensures both backend and frontend are running correctly

set -e

echo "🚀 Starting Django E-commerce Development Environment..."

# Change to project directory
cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        print_warning "Please edit .env file with your configuration before continuing"
        exit 1
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

# Function to check if PostgreSQL is available
check_postgres() {
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            return 0
        fi
    fi
    return 1
}

# Function to configure database
configure_database() {
    print_status "Configuring database..."
    
    # Check if PostgreSQL environment variables are set
    if grep -q "^DB_NAME=" .env && grep -q "^DB_USER=" .env && grep -q "^DB_PASSWORD=" .env; then
        print_status "PostgreSQL configuration found in .env"
        
        if check_postgres; then
            print_status "PostgreSQL is available and running"
        else
            print_warning "PostgreSQL configuration found but server is not running"
            print_warning "Switching to SQLite for development..."
            
            # Comment out PostgreSQL settings in .env
            sed -i.bak 's/^DB_NAME=/#DB_NAME=/' .env
            sed -i.bak 's/^DB_USER=/#DB_USER=/' .env
            sed -i.bak 's/^DB_PASSWORD=/#DB_PASSWORD=/' .env
            sed -i.bak 's/^DB_HOST=/#DB_HOST=/' .env
            sed -i.bak 's/^DB_PORT=/#DB_PORT=/' .env
            
            print_status "PostgreSQL settings commented out. Using SQLite for development."
        fi
    else
        print_status "No PostgreSQL configuration found. Using SQLite for development."
    fi
}

# Function to start Django backend
start_backend() {
    print_status "Starting Django backend..."
    
    # Check if Django is available
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 not found. Please install Python3."
        exit 1
    fi
    
    # Install/check requirements
    if [ -f "requirements.txt" ]; then
        print_status "Checking Python dependencies..."
        pip3 install -r requirements.txt --quiet || {
            print_error "Failed to install Python dependencies"
            exit 1
        }
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    python3 manage.py migrate || {
        print_error "Database migration failed"
        exit 1
    }
    
    # Start Django development server
    print_status "Starting Django development server on http://localhost:8000"
    python3 manage.py runserver 8000 > django.log 2>&1 &
    DJANGO_PID=$!
    
    # Wait for Django to start
    sleep 3
    
    # Test if Django is responding
    if curl -s http://localhost:8000/ > /dev/null; then
        print_status "✅ Django backend is running successfully"
    else
        print_error "Django backend failed to start properly"
        kill $DJANGO_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to start React frontend
start_frontend() {
    print_status "Starting React frontend..."
    
    cd frontend
    
    # Check if Node.js is available
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js and npm."
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install || {
            print_error "Failed to install Node.js dependencies"
            exit 1
        }
    fi
    
    # Start React development server
    print_status "Starting React development server on http://localhost:3000"
    npm start > ../react.log 2>&1 &
    REACT_PID=$!
    
    cd ..
    
    # Wait for React to start
    sleep 10
    
    # Test if React is responding
    if curl -s http://localhost:3000/ > /dev/null; then
        print_status "✅ React frontend is running successfully"
    else
        print_warning "React frontend may still be starting. Check http://localhost:3000 in a few moments."
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down development servers..."
    
    # Kill Django server
    if [ ! -z "$DJANGO_PID" ]; then
        kill $DJANGO_PID 2>/dev/null || true
    fi
    
    # Kill React server
    if [ ! -z "$REACT_PID" ]; then
        kill $REACT_PID 2>/dev/null || true
    fi
    
    # Kill any remaining Django processes
    pkill -f "manage.py runserver" 2>/dev/null || true
    
    # Kill any remaining React processes
    pkill -f "react-scripts start" 2>/dev/null || true
    
    print_status "Development environment stopped."
}

# Trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Main execution
main() {
    configure_database
    start_backend
    start_frontend
    
    print_status "🎉 Development environment is ready!"
    print_status "📱 Frontend: http://localhost:3000"
    print_status "🔧 Backend: http://localhost:8000"
    print_status "📊 Admin: http://localhost:8000/admin"
    print_status ""
    print_status "Press Ctrl+C to stop all servers"
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Check for flags
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Django E-commerce Development Environment Startup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo "  --backend-only Start only the Django backend"
    echo "  --frontend-only Start only the React frontend"
    echo ""
    echo "This script will:"
    echo "  1. Check and configure database settings"
    echo "  2. Start Django development server on port 8000"
    echo "  3. Start React development server on port 3000"
    echo "  4. Handle graceful shutdown when stopped"
    exit 0
elif [ "$1" = "--backend-only" ]; then
    configure_database
    start_backend
    print_status "🎉 Backend is ready at http://localhost:8000"
    print_status "Press Ctrl+C to stop the server"
    while true; do sleep 1; done
elif [ "$1" = "--frontend-only" ]; then
    start_frontend
    print_status "🎉 Frontend is ready at http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    while true; do sleep 1; done
else
    main
fi