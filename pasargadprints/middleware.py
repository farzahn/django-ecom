"""
Custom middleware for PasargadPrints project.

This module contains custom middleware classes for security headers
and other production-ready features.
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseServerError
from django.conf import settings

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Custom middleware to add security headers to all responses.
    
    This middleware adds additional security headers that are not
    covered by Django's built-in security middleware.
    """
    
    def process_response(self, request, response):
        """Add security headers to the response."""
        
        # Content Security Policy
        if not hasattr(settings, 'CSP_DEFAULT_SRC'):
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' https://js.stripe.com; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https://api.stripe.com; "
                "frame-src 'self' https://js.stripe.com;"
            )
        
        # Permissions Policy (formerly Feature Policy)
        response['Permissions-Policy'] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "speaker=(), "
            "vibrate=(), "
            "fullscreen=(self), "
            "payment=(self)"
        )
        
        # Additional security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Cache control for sensitive pages
        if request.path.startswith('/admin/') or request.path.startswith('/api/'):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
        
        return response


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all requests for monitoring and debugging.
    
    This middleware logs request details for production monitoring.
    """
    
    def process_request(self, request):
        """Log incoming requests."""
        if settings.DEBUG:
            logger.debug(f"Request: {request.method} {request.get_full_path()}")
        return None
    
    def process_response(self, request, response):
        """Log response details."""
        if settings.DEBUG:
            logger.debug(f"Response: {response.status_code} for {request.get_full_path()}")
        elif response.status_code >= 400:
            logger.warning(f"HTTP {response.status_code}: {request.method} {request.get_full_path()}")
        return response
    
    def process_exception(self, request, exception):
        """Log exceptions."""
        logger.error(f"Exception in {request.get_full_path()}: {exception}")
        return None


class HealthCheckMiddleware(MiddlewareMixin):
    """
    Middleware to handle health check requests.
    
    This middleware provides a simple health check endpoint for
    load balancers and monitoring systems.
    """
    
    def process_request(self, request):
        """Handle health check requests."""
        if request.path in ['/health/', '/health', '/healthz']:
            from django.http import JsonResponse
            return JsonResponse({
                'status': 'healthy',
                'service': 'pasargadprints',
                'version': '1.0.0'
            })
        return None


class RateLimitMiddleware(MiddlewareMixin):
    """
    Basic rate limiting middleware.
    
    This middleware provides simple rate limiting to prevent abuse.
    For production, consider using a more sophisticated solution like
    django-ratelimit or implementing rate limiting at the reverse proxy level.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_cache = {}
        super().__init__(get_response)
    
    def process_request(self, request):
        """Check rate limits for the request."""
        if not settings.DEBUG:
            client_ip = self.get_client_ip(request)
            
            # Simple rate limiting: 100 requests per minute per IP
            current_time = int(time.time())
            minute_key = f"{client_ip}:{current_time // 60}"
            
            if minute_key in self.rate_limit_cache:
                self.rate_limit_cache[minute_key] += 1
                if self.rate_limit_cache[minute_key] > 100:
                    from django.http import HttpResponseTooManyRequests
                    return HttpResponseTooManyRequests("Rate limit exceeded")
            else:
                self.rate_limit_cache[minute_key] = 1
                
                # Clean up old entries
                for key in list(self.rate_limit_cache.keys()):
                    if int(key.split(':')[1]) < current_time // 60 - 5:
                        del self.rate_limit_cache[key]
        
        return None
    
    def get_client_ip(self, request):
        """Get the client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


import time