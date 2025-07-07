"""
Management command to validate the configuration and environment variables.

This command checks if all required environment variables are set and
validates the configuration for both development and production environments.
"""

import os
import sys
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class Command(BaseCommand):
    help = 'Validate configuration and environment variables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--env',
            type=str,
            choices=['development', 'production'],
            default='development',
            help='Environment to validate (default: development)'
        )
        parser.add_argument(
            '--strict',
            action='store_true',
            help='Strict mode - fail on warnings'
        )

    def handle(self, *args, **options):
        env = options['env']
        strict = options['strict']
        
        self.stdout.write(
            self.style.SUCCESS(f'Validating configuration for {env} environment...')
        )
        
        errors = []
        warnings = []
        
        # Check basic Django settings
        self._check_basic_settings(errors, warnings)
        
        # Check environment-specific settings
        if env == 'production':
            self._check_production_settings(errors, warnings)
        else:
            self._check_development_settings(errors, warnings)
        
        # Check third-party integrations
        self._check_integrations(errors, warnings)
        
        # Check database configuration
        self._check_database_config(errors, warnings, env)
        
        # Check logging configuration
        self._check_logging_config(errors, warnings)
        
        # Report results
        self._report_results(errors, warnings, strict)

    def _check_basic_settings(self, errors, warnings):
        """Check basic Django settings."""
        if not settings.SECRET_KEY:
            errors.append("SECRET_KEY is not set")
        elif len(settings.SECRET_KEY) < 50:
            warnings.append("SECRET_KEY should be at least 50 characters long")
        elif settings.SECRET_KEY.startswith('django-insecure-'):
            warnings.append("SECRET_KEY appears to be a default Django key")
        
        if not settings.ALLOWED_HOSTS:
            warnings.append("ALLOWED_HOSTS is empty")

    def _check_production_settings(self, errors, warnings):
        """Check production-specific settings."""
        if settings.DEBUG:
            errors.append("DEBUG should be False in production")
        
        if not settings.SECURE_SSL_REDIRECT:
            warnings.append("SECURE_SSL_REDIRECT should be True in production")
        
        if not settings.SESSION_COOKIE_SECURE:
            warnings.append("SESSION_COOKIE_SECURE should be True in production")
        
        if not settings.CSRF_COOKIE_SECURE:
            warnings.append("CSRF_COOKIE_SECURE should be True in production")
        
        if settings.SECURE_HSTS_SECONDS < 31536000:
            warnings.append("SECURE_HSTS_SECONDS should be at least 31536000 (1 year)")

    def _check_development_settings(self, errors, warnings):
        """Check development-specific settings."""
        if not settings.DEBUG:
            warnings.append("DEBUG is False in development - this might be intentional")

    def _check_integrations(self, errors, warnings):
        """Check third-party integrations."""
        # Stripe integration
        if not settings.STRIPE_SECRET_KEY:
            warnings.append("STRIPE_SECRET_KEY is not set")
        elif not settings.STRIPE_SECRET_KEY.startswith(('sk_test_', 'sk_live_')):
            warnings.append("STRIPE_SECRET_KEY doesn't appear to be a valid Stripe secret key")
        
        if not settings.STRIPE_PUBLISHABLE_KEY:
            warnings.append("STRIPE_PUBLISHABLE_KEY is not set")
        elif not settings.STRIPE_PUBLISHABLE_KEY.startswith(('pk_test_', 'pk_live_')):
            warnings.append("STRIPE_PUBLISHABLE_KEY doesn't appear to be a valid Stripe publishable key")
        
        # Shippo integration
        if not settings.SHIPPO_API_KEY:
            warnings.append("SHIPPO_API_KEY is not set")

    def _check_database_config(self, errors, warnings, env):
        """Check database configuration."""
        db_config = settings.DATABASES['default']
        
        if env == 'production':
            if db_config['ENGINE'] != 'django.db.backends.postgresql':
                errors.append("PostgreSQL is required for production")
            
            required_fields = ['NAME', 'USER', 'PASSWORD', 'HOST']
            for field in required_fields:
                if not db_config.get(field):
                    errors.append(f"Database {field} is not set")
        else:
            if db_config['ENGINE'] == 'django.db.backends.sqlite3':
                self.stdout.write(
                    self.style.WARNING("Using SQLite for development")
                )

    def _check_logging_config(self, errors, warnings):
        """Check logging configuration."""
        if not hasattr(settings, 'LOGGING'):
            warnings.append("LOGGING configuration is not set")
        else:
            logging_config = settings.LOGGING
            if 'handlers' not in logging_config:
                warnings.append("No logging handlers configured")
            elif 'file' not in logging_config.get('handlers', {}):
                warnings.append("No file logging handler configured")

    def _report_results(self, errors, warnings, strict):
        """Report validation results."""
        if errors:
            self.stdout.write(
                self.style.ERROR(f'\nFound {len(errors)} error(s):')
            )
            for error in errors:
                self.stdout.write(self.style.ERROR(f'  ✗ {error}'))
        
        if warnings:
            self.stdout.write(
                self.style.WARNING(f'\nFound {len(warnings)} warning(s):')
            )
            for warning in warnings:
                self.stdout.write(self.style.WARNING(f'  ⚠ {warning}'))
        
        if not errors and not warnings:
            self.stdout.write(
                self.style.SUCCESS('\n✓ All configuration checks passed!')
            )
        elif not errors:
            self.stdout.write(
                self.style.SUCCESS(f'\n✓ No critical errors found')
            )
        
        if errors or (strict and warnings):
            self.stdout.write(
                self.style.ERROR('\nConfiguration validation failed!')
            )
            sys.exit(1)
        else:
            self.stdout.write(
                self.style.SUCCESS('\nConfiguration validation passed!')
            )