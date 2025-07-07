# PasargadPrints Production Deployment Guide

This document provides comprehensive instructions for deploying the PasargadPrints e-commerce platform to production.

## 🚀 Quick Start

### Prerequisites

1. **Server Requirements:**
   - Ubuntu 20.04+ or similar Linux distribution
   - Docker and Docker Compose installed
   - Domain name with SSL certificate
   - Minimum 2GB RAM, 2 CPU cores

2. **External Services:**
   - PostgreSQL database (can be containerized)
   - Redis server (can be containerized)
   - SMTP server for email notifications
   - Stripe account for payments
   - GoShippo account for shipping

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd django-ecom
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` file with your production values:
   ```bash
   # Required production variables
   SECRET_KEY=your-long-secret-key-minimum-50-characters
   DJANGO_ENV=production
   DEBUG=False
   
   # Database
   DB_NAME=pasargadprints_db
   DB_USER=your_db_user
   DB_PASSWORD=your_secure_password
   DB_HOST=db
   
   # Domain configuration
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   
   # API Keys
   STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   SHIPPO_API_KEY=your_shippo_key
   
   # Email configuration
   EMAIL_HOST=smtp.your-provider.com
   EMAIL_HOST_USER=your-email@domain.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

## 🛠 Deployment Methods

### Method 1: Docker Compose (Recommended)

1. **Start services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Run migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec web python manage.py migrate
   ```

3. **Create superuser:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
   ```

### Method 2: Traditional Deployment

1. **Run deployment script:**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

2. **Start with systemd:**
   Create `/etc/systemd/system/pasargadprints.service`:
   ```ini
   [Unit]
   Description=PasargadPrints Django Application
   After=network.target
   
   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/path/to/your/app
   Environment=DJANGO_SETTINGS_MODULE=pasargadprints.settings_production
   ExecStart=/path/to/venv/bin/gunicorn --bind 0.0.0.0:8000 pasargadprints.wsgi:application
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

## 🔧 Configuration Validation

Before deployment, validate your configuration:

```bash
# Development validation
python manage.py validate_config --env development

# Production validation
python manage.py validate_config --env production --strict
```

## 🔒 Security Features

### Implemented Security Measures

1. **Security Headers:**
   - Content Security Policy (CSP)
   - HTTP Strict Transport Security (HSTS)
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer Policy

2. **Rate Limiting:**
   - API endpoints: 10 requests/second
   - Admin interface: 5 requests/minute
   - Nginx-level rate limiting

3. **SSL/TLS:**
   - Automatic HTTP to HTTPS redirect
   - Modern TLS configuration
   - SSL session optimization

4. **Database Security:**
   - Connection pooling
   - SSL connections required in production
   - Connection timeouts

### SSL Certificate Setup

For production, place your SSL certificates in `nginx/ssl/`:
```
nginx/ssl/
├── cert.pem
└── key.pem
```

Or use Let's Encrypt with Certbot:
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 📊 Monitoring and Logging

### Log Files

- **Application logs:** `logs/django.log`
- **Error logs:** `logs/django_errors.log`
- **Nginx logs:** Docker volume or `/var/log/nginx/`

### Health Checks

- **Application health:** `https://yourdomain.com/health/`
- **Docker health checks:** Automatic container monitoring
- **Database health:** PostgreSQL built-in health checks

### Monitoring Commands

```bash
# Check application status
docker-compose -f docker-compose.prod.yml ps

# View application logs
docker-compose -f docker-compose.prod.yml logs web

# Monitor real-time logs
docker-compose -f docker-compose.prod.yml logs -f web

# Check system resources
docker stats
```

## 🔄 Maintenance

### Database Backups

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U $DB_USER $DB_NAME > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U $DB_USER $DB_NAME < backup.sql
```

### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec web python manage.py migrate
```

### Log Rotation

Logs are automatically rotated when they exceed 10MB, keeping 5 backup files.

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Check PostgreSQL is running
   - Verify database credentials
   - Check network connectivity

2. **Static Files Not Loading:**
   - Run `collectstatic` command
   - Check Nginx configuration
   - Verify file permissions

3. **SSL Certificate Issues:**
   - Check certificate validity
   - Verify certificate paths
   - Check Nginx SSL configuration

### Debug Commands

```bash
# Check Django configuration
python manage.py check --deploy

# Validate custom configuration
python manage.py validate_config --env production

# Test database connection
python manage.py dbshell

# Check static files
python manage.py collectstatic --dry-run
```

## 📞 Support

For deployment issues:

1. Check logs: `docker-compose logs web`
2. Validate configuration: `python manage.py validate_config`
3. Review health checks: `curl https://yourdomain.com/health/`
4. Monitor system resources: `docker stats`

## 🔐 Security Checklist

Before going live:

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure proper ALLOWED_HOSTS
- [ ] Set up SSL certificates
- [ ] Configure database with strong password
- [ ] Set up email for error notifications
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting
- [ ] Test backup and restore procedures
- [ ] Review security headers
- [ ] Test all payment flows
- [ ] Verify shipping integrations

## 📈 Performance Optimization

### Implemented Optimizations

1. **Caching:**
   - Redis for session storage
   - Static file caching with long expires
   - Database connection pooling

2. **Compression:**
   - Gzip compression for text assets
   - Optimized static file serving
   - Efficient image handling

3. **Database:**
   - Connection pooling
   - Optimized queries
   - Index optimization

### Performance Monitoring

```bash
# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/

# Check database performance
docker-compose exec db psql -U $DB_USER -c "SELECT * FROM pg_stat_activity;"

# Monitor Redis
docker-compose exec redis redis-cli info memory
```