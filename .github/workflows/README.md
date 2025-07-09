# CI/CD Pipeline Documentation

This repository contains a comprehensive CI/CD pipeline setup for the PasargadPrints e-commerce platform using GitHub Actions.

## 🔄 Workflow Overview

### 1. **ci.yml** - Main CI/CD Pipeline
**Triggers:** Push to main/develop, Pull requests to main
- **Backend Tests**: Django tests with PostgreSQL
- **Frontend Tests**: React/TypeScript tests with coverage
- **Build & Security**: Security scans and build validation
- **E2E Tests**: End-to-end testing (main branch only)
- **Deploy**: Production deployment (main branch only)

### 2. **pull-request.yml** - PR Validation
**Triggers:** Pull requests to main/develop
- Quick validation and linting
- Fast feedback for developers
- Automated PR status comments

### 3. **deploy.yml** - Production Deployment
**Triggers:** Push to main, Version tags, Manual dispatch
- **Build**: Create deployment artifacts
- **Staging**: Deploy to staging environment
- **Production**: Deploy to production (tags only)
- **Rollback**: Automatic rollback on failure

### 4. **security.yml** - Security Scanning
**Triggers:** Weekly schedule, Push to main, PRs
- **Python Security**: Bandit, Safety, pip-audit
- **Node.js Security**: npm audit
- **SAST**: CodeQL static analysis
- **Docker Security**: Trivy vulnerability scanning
- **Dependency Updates**: Automated dependency updates

### 5. **monitoring.yml** - Performance & Health
**Triggers:** Every 6 hours, Push to main
- **Performance Tests**: Locust load testing
- **Frontend Performance**: Lighthouse CI
- **Health Checks**: Production/staging monitoring
- **Database Monitoring**: Performance and backup checks

## 🚀 Getting Started

### 1. Repository Setup
```bash
# Ensure you have the GitHub CLI installed
gh auth login

# Clone the repository
git clone https://github.com/yourusername/django-ecom.git
cd django-ecom

# Set up the workflows
git add .github/workflows/
git commit -m "feat: Add comprehensive CI/CD pipeline"
git push origin main
```

### 2. Required Secrets
Configure these secrets in your GitHub repository settings:

#### Production Secrets
- `PRODUCTION_DATABASE_URL`: Production database connection string
- `PRODUCTION_SECRET_KEY`: Django secret key for production
- `STRIPE_LIVE_SECRET_KEY`: Stripe production secret key
- `STRIPE_LIVE_WEBHOOK_SECRET`: Stripe production webhook secret
- `GOSHIPPO_LIVE_API_TOKEN`: GoShippo production API token

#### Deployment Secrets
- `DEPLOY_HOST`: Production server hostname
- `DEPLOY_USER`: Production server username
- `DEPLOY_SSH_KEY`: SSH private key for deployment
- `DOCKER_HUB_USERNAME`: Docker Hub username (if using Docker)
- `DOCKER_HUB_TOKEN`: Docker Hub access token

#### Notification Secrets (Optional)
- `SLACK_WEBHOOK_URL`: Slack webhook for notifications
- `DISCORD_WEBHOOK_URL`: Discord webhook for notifications

### 3. Environment Configuration
Create environment-specific configuration files:

#### `.env.staging`
```env
DEBUG=False
SECRET_KEY=your-staging-secret-key
DATABASE_URL=postgresql://user:password@staging-db:5432/pasargadprints
STRIPE_PUBLISHABLE_KEY=pk_test_your_staging_key
STRIPE_SECRET_KEY=sk_test_your_staging_key
STRIPE_WEBHOOK_SECRET=whsec_your_staging_secret
GOSHIPPO_API_TOKEN=shippo_test_your_staging_token
ALLOWED_HOSTS=staging.pasargadprints.com
CORS_ALLOWED_ORIGINS=https://staging.pasargadprints.com
```

#### `.env.production`
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:password@prod-db:5432/pasargadprints
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
GOSHIPPO_API_TOKEN=shippo_live_your_production_token
ALLOWED_HOSTS=pasargadprints.com,www.pasargadprints.com
CORS_ALLOWED_ORIGINS=https://pasargadprints.com
```

## 🔧 Customization

### Deployment Configuration
Edit the deployment steps in `.github/workflows/deploy.yml`:

```yaml
- name: Deploy to production
  run: |
    # Option 1: Docker deployment
    docker build -t pasargadprints:latest .
    docker push your-registry/pasargadprints:latest
    docker-compose -f docker-compose.prod.yml up -d
    
    # Option 2: VPS deployment
    scp deployment.tar.gz user@your-server:/path/to/app/
    ssh user@your-server 'cd /path/to/app && tar -xzf deployment.tar.gz'
    ssh user@your-server 'cd /path/to/app && ./deploy.sh'
    
    # Option 3: Cloud deployment (AWS, GCP, Azure)
    # Add your cloud-specific deployment commands here
```

### Health Check URLs
Update health check URLs in workflows:

```yaml
- name: Run production health checks
  run: |
    curl -f https://pasargadprints.com/health/
    curl -f https://pasargadprints.com/api/health/
```

### Notification Setup
Configure Slack notifications in workflows:

```yaml
- name: Notify deployment success
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"🎉 PasargadPrints deployed successfully!"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 📊 Monitoring and Metrics

### Performance Metrics
- **Backend**: Response time, throughput, error rates
- **Frontend**: Lighthouse scores, Core Web Vitals
- **Database**: Query performance, connection pool usage
- **Infrastructure**: CPU, memory, disk usage

### Alerts and Notifications
- **Deployment Success/Failure**: Immediate notifications
- **Security Vulnerabilities**: Weekly security reports
- **Performance Degradation**: Automated alerts
- **Health Check Failures**: Immediate notifications

## 🛡️ Security Features

### Code Security
- **Bandit**: Python code security analysis
- **Safety**: Python dependency vulnerability scanning
- **CodeQL**: Static application security testing
- **npm audit**: Node.js dependency vulnerability scanning

### Infrastructure Security
- **Docker Security**: Trivy container scanning
- **Dependency Updates**: Automated security updates
- **Secrets Management**: GitHub secrets for sensitive data
- **Environment Isolation**: Separate staging/production environments

## 🐛 Troubleshooting

### Common Issues

#### 1. Test Failures
```bash
# Check test logs in GitHub Actions
# Run tests locally:
python manage.py test --verbosity=2
cd frontend && npm test
```

#### 2. Deployment Failures
```bash
# Check deployment logs
# Verify environment variables
# Test deployment locally:
./deploy.sh
```

#### 3. Security Scan Failures
```bash
# Run security scans locally:
bandit -r .
safety check
npm audit
```

### Debugging Steps
1. Check GitHub Actions logs for detailed error messages
2. Verify all required secrets are configured
3. Test deployment scripts locally
4. Review environment configuration
5. Check database connectivity and permissions

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Django Deployment Guide](https://docs.djangoproject.com/en/4.2/howto/deployment/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

### Tools and Services
- [CodeQL](https://codeql.github.com/): Code analysis
- [Bandit](https://bandit.readthedocs.io/): Python security linter
- [Safety](https://pyup.io/safety/): Python dependency scanner
- [Trivy](https://trivy.dev/): Container vulnerability scanner
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci): Performance monitoring

## 🤝 Contributing

### Adding New Workflows
1. Create a new workflow file in `.github/workflows/`
2. Follow the existing naming convention
3. Add appropriate triggers and conditions
4. Test thoroughly before merging

### Modifying Existing Workflows
1. Test changes in a feature branch
2. Ensure all existing functionality remains intact
3. Update documentation if needed
4. Get approval from team leads

### Best Practices
- Use descriptive workflow and job names
- Add comments for complex logic
- Use environment variables for configuration
- Implement proper error handling
- Monitor workflow performance and costs

## 📧 Support

For issues related to the CI/CD pipeline:
1. Check existing GitHub Issues
2. Create a new issue with detailed description
3. Include workflow logs and error messages
4. Tag relevant team members

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Maintainer:** PasargadPrints Development Team