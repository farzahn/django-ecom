#!/bin/bash

# Production deployment script for PasargadPrints
# This script handles production deployment with proper configuration validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_DIR/venv"
REQUIREMENTS_FILE="$PROJECT_DIR/requirements.txt"
SETTINGS_MODULE="pasargadprints.settings_production"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check if .env file exists
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log_error ".env file not found. Please create one based on .env.example"
        exit 1
    fi
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check if virtual environment exists
    if [ ! -d "$VENV_DIR" ]; then
        log_warn "Virtual environment not found. Creating one..."
        python3 -m venv "$VENV_DIR"
    fi
    
    log_info "Requirements check passed"
}

activate_venv() {
    log_info "Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
}

install_dependencies() {
    log_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r "$REQUIREMENTS_FILE"
}

validate_configuration() {
    log_info "Validating production configuration..."
    
    # Set production environment
    export DJANGO_SETTINGS_MODULE="$SETTINGS_MODULE"
    export DJANGO_ENV="production"
    
    # Run Django system checks
    python manage.py check --deploy
    
    # Run our custom validation
    python manage.py validate_config --env production
    
    log_info "Configuration validation passed"
}

prepare_static_files() {
    log_info "Collecting static files..."
    
    # Create staticfiles directory if it doesn't exist
    mkdir -p "$PROJECT_DIR/staticfiles"
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    log_info "Static files collected"
}

prepare_database() {
    log_info "Preparing database..."
    
    # Run database migrations
    python manage.py migrate --noinput
    
    log_info "Database migrations applied"
}

create_superuser() {
    log_info "Checking for superuser..."
    
    # Check if superuser already exists
    if python manage.py shell -c "from django.contrib.auth.models import User; exit(0 if User.objects.filter(is_superuser=True).exists() else 1)"; then
        log_info "Superuser already exists"
    else
        log_warn "No superuser found. You may want to create one with: python manage.py createsuperuser"
    fi
}

setup_logging() {
    log_info "Setting up logging directories..."
    
    # Create logs directory
    mkdir -p "$PROJECT_DIR/logs"
    
    # Set proper permissions
    chmod 755 "$PROJECT_DIR/logs"
    
    log_info "Logging setup complete"
}

run_tests() {
    log_info "Running tests..."
    
    # Run Django tests
    python manage.py test --verbosity=2
    
    log_info "Tests passed"
}

main() {
    log_info "Starting production deployment for PasargadPrints..."
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Run deployment steps
    check_requirements
    activate_venv
    install_dependencies
    validate_configuration
    setup_logging
    prepare_static_files
    prepare_database
    create_superuser
    
    # Optional: Run tests
    if [ "$1" = "--with-tests" ]; then
        run_tests
    fi
    
    log_info "Deployment completed successfully!"
    log_info "You can now start the production server with:"
    log_info "  gunicorn --env DJANGO_SETTINGS_MODULE=$SETTINGS_MODULE pasargadprints.wsgi:application"
}

# Help message
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Production deployment script for PasargadPrints"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --with-tests    Run tests as part of deployment"
    echo "  --help, -h      Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - .env file with production configuration"
    echo "  - PostgreSQL database configured"
    echo "  - Redis server running (for caching)"
    echo ""
    exit 0
fi

# Run main deployment
main "$@"