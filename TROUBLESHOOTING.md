# Troubleshooting Guide

## Common Development Issues and Solutions

### Registration Failed: Network Error

**Problem:** Users receive "Network Error" when trying to register, with console showing:
```
POST http://localhost:8000/api/register/ net::ERR_CONNECTION_REFUSED
```

**Root Cause:** Django backend server is not running or cannot connect to the database.

**Solutions:**

#### Quick Fix:
1. **Use the automated startup script:**
   ```bash
   ./start_dev_environment.sh
   ```

#### Manual Fix:
1. **Check if Django server is running:**
   ```bash
   ps aux | grep "manage.py runserver"
   ```

2. **If not running, check database configuration:**
   - Open `.env` file
   - If PostgreSQL variables are set but PostgreSQL isn't running, comment them out:
     ```bash
     # DB_NAME=pasargadprints
     # DB_USER=postgres
     # DB_PASSWORD=password
     # DB_HOST=localhost
     # DB_PORT=5432
     ```

3. **Run migrations and start Django:**
   ```bash
   python3 manage.py migrate
   python3 manage.py runserver 8000
   ```

4. **Test the API:**
   ```bash
   curl -X POST http://localhost:8000/api/register/ \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@test.com","password":"test123","first_name":"Test","last_name":"User"}'
   ```

### Database Connection Issues

**Problem:** Django fails to start with PostgreSQL connection errors.

**Solutions:**

#### Option 1: Use SQLite for Development (Recommended)
1. Edit `.env` file and comment out PostgreSQL settings:
   ```bash
   # DB_NAME=pasargadprints
   # DB_USER=postgres
   # DB_PASSWORD=password
   ```

2. Django will automatically fall back to SQLite

#### Option 2: Start PostgreSQL
1. **macOS with Homebrew:**
   ```bash
   brew services start postgresql
   ```

2. **Docker:**
   ```bash
   docker run --name postgres-dev -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres
   ```

3. **Create database:**
   ```bash
   createdb pasargadprints
   ```

### CORS Issues

**Problem:** Frontend cannot connect to backend due to CORS errors.

**Solution:**
1. Ensure Django server is running on port 8000
2. Check CORS settings in Django settings.py
3. Verify FRONTEND_URL in .env matches your React dev server

### Port Already in Use

**Problem:** "Port 8000 is already in use" or "Port 3000 is already in use"

**Solutions:**

1. **Kill existing processes:**
   ```bash
   # Kill Django server
   pkill -f "manage.py runserver"
   
   # Kill React server
   pkill -f "react-scripts start"
   ```

2. **Find and kill specific processes:**
   ```bash
   # Find what's using port 8000
   lsof -i :8000
   
   # Kill specific process
   kill -9 <PID>
   ```

### Frontend Build Issues

**Problem:** React frontend fails to start or shows compilation errors.

**Solutions:**

1. **Clear node_modules and reinstall:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear React cache:**
   ```bash
   npm start -- --reset-cache
   ```

### API Endpoint 404 Errors

**Problem:** API calls return 404 Not Found.

**Common Issues:**
1. **Trailing slash issues:** Django router uses `/api/products` not `/api/products/`
2. **Server not running:** Check if Django is actually responding
3. **Wrong URL configuration:** Verify URLs in `store/urls.py`

**Test endpoints:**
```bash
# Products (no trailing slash)
curl http://localhost:8000/api/products

# Registration
curl -X POST http://localhost:8000/api/register/ -H "Content-Type: application/json" -d '{}'

# API info
curl http://localhost:8000/
```

## Development Commands

### Backend (Django)
```bash
# Run migrations
python3 manage.py migrate

# Create superuser
python3 manage.py createsuperuser

# Start development server
python3 manage.py runserver 8000

# Django shell
python3 manage.py shell

# Check configuration
python3 manage.py check
```

### Frontend (React)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Log Files

Check these log files for debugging:
- `django.log` - Django server logs
- `react.log` - React development server logs

## Quick Health Check

Run this command to verify everything is working:
```bash
# Test Django API
curl -s http://localhost:8000/api/products && echo "✅ Django OK" || echo "❌ Django Failed"

# Test React frontend
curl -s http://localhost:3000/ | grep -q "React" && echo "✅ React OK" || echo "❌ React Failed"
```

## Getting Help

1. Check the logs first: `tail -f django.log` or `tail -f react.log`
2. Verify environment variables in `.env`
3. Test API endpoints directly with curl
4. Use the automated startup script: `./start_dev_environment.sh`

For more detailed debugging, run Django with verbose output:
```bash
python3 manage.py runserver 8000 --verbosity=2
```