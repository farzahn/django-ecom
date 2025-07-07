"""
Enhanced webhook security utilities for stripe webhooks.
Implements OWASP security guidelines for webhook handling.
"""

import hashlib
import hmac
import json
import logging
import time
from typing import Dict, Optional, Tuple, Any
from django.conf import settings
from django.utils import timezone
from django.db import transaction
from .models import WebhookEvent, WebhookSecurityLog

logger = logging.getLogger(__name__)


class WebhookSecurityError(Exception):
    """Custom exception for webhook security errors"""
    def __init__(self, message: str, error_code: str = None, severity: str = 'medium'):
        super().__init__(message)
        self.error_code = error_code
        self.severity = severity


class WebhookSecurityManager:
    """Centralized webhook security management"""
    
    def __init__(self):
        self.max_payload_size = getattr(settings, 'WEBHOOK_MAX_PAYLOAD_SIZE', 1024 * 1024)  # 1MB default
        self.signature_tolerance = getattr(settings, 'WEBHOOK_SIGNATURE_TOLERANCE', 300)  # 5 minutes
        self.max_processing_attempts = getattr(settings, 'WEBHOOK_MAX_PROCESSING_ATTEMPTS', 3)
        
    def extract_request_info(self, request) -> Dict[str, Any]:
        """Extract request information for security logging"""
        return {
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'request_method': request.method,
            'request_path': request.path,
            'content_length': request.META.get('CONTENT_LENGTH', 0),
        }
    
    def _get_client_ip(self, request) -> Optional[str]:
        """Get client IP address from request headers"""
        # Check for forwarded headers first (proxy/load balancer scenarios)
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            # Take the first IP in the chain
            ip = forwarded_for.split(',')[0].strip()
            return ip if ip else None
        
        # Check for other proxy headers
        real_ip = request.META.get('HTTP_X_REAL_IP')
        if real_ip:
            return real_ip.strip()
        
        # Fall back to remote address
        return request.META.get('REMOTE_ADDR')
    
    def compute_payload_hash(self, payload: bytes) -> str:
        """Compute SHA256 hash of payload for integrity checking"""
        return hashlib.sha256(payload).hexdigest()
    
    def validate_payload_size(self, payload: bytes) -> bool:
        """Validate payload size is within acceptable limits"""
        return len(payload) <= self.max_payload_size
    
    def verify_stripe_signature(self, payload: bytes, signature: str, secret: str) -> Tuple[bool, Optional[str]]:
        """
        Verify Stripe webhook signature with enhanced security
        Returns (is_valid, error_message)
        """
        try:
            if not signature:
                return False, "Missing signature header"
            
            if not secret:
                return False, "Webhook secret not configured"
            
            # Parse signature header
            elements = signature.split(',')
            signature_dict = {}
            
            for element in elements:
                if '=' in element:
                    key, value = element.split('=', 1)
                    signature_dict[key] = value
            
            # Extract timestamp and signature
            timestamp = signature_dict.get('t')
            v1_signature = signature_dict.get('v1')
            
            if not timestamp or not v1_signature:
                return False, "Invalid signature format"
            
            # Validate timestamp (prevent replay attacks)
            try:
                event_time = int(timestamp)
                current_time = int(time.time())
                
                if abs(current_time - event_time) > self.signature_tolerance:
                    return False, f"Timestamp outside tolerance window: {abs(current_time - event_time)}s"
            except ValueError:
                return False, "Invalid timestamp in signature"
            
            # Compute expected signature
            signed_payload = timestamp.encode() + b'.' + payload
            expected_signature = hmac.new(
                secret.encode(),
                signed_payload,
                hashlib.sha256
            ).hexdigest()
            
            # Use constant-time comparison to prevent timing attacks
            if not hmac.compare_digest(expected_signature, v1_signature):
                return False, "Signature verification failed"
            
            return True, None
            
        except Exception as e:
            return False, f"Signature verification error: {str(e)}"
    
    def validate_event_structure(self, event_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate basic event structure"""
        try:
            # Check required fields
            required_fields = ['id', 'type', 'data', 'object']
            for field in required_fields:
                if field not in event_data:
                    return False, f"Missing required field: {field}"
            
            # Validate event ID format
            event_id = event_data.get('id', '')
            if not event_id or not event_id.startswith('evt_'):
                return False, "Invalid event ID format"
            
            # Validate object type
            if event_data.get('object') != 'event':
                return False, "Invalid object type"
            
            return True, None
            
        except Exception as e:
            return False, f"Event structure validation error: {str(e)}"
    
    def check_for_duplicate_event(self, event_id: str, payload_hash: str) -> Tuple[bool, Optional[WebhookEvent]]:
        """
        Check if event has already been processed
        Returns (is_duplicate, existing_event)
        """
        try:
            # Check by event ID first
            existing_event = WebhookEvent.objects.filter(event_id=event_id).first()
            if existing_event:
                return True, existing_event
            
            # Check by payload hash (catches potential ID manipulation)
            existing_by_hash = WebhookEvent.objects.filter(payload_hash=payload_hash).first()
            if existing_by_hash:
                return True, existing_by_hash
            
            return False, None
            
        except Exception as e:
            logger.error(f"Error checking for duplicate event: {str(e)}")
            return False, None
    
    def create_webhook_event(self, event_data: Dict[str, Any], payload_hash: str, 
                           payload_size: int, request_info: Dict[str, Any]) -> WebhookEvent:
        """Create a new webhook event record"""
        try:
            webhook_event = WebhookEvent.objects.create(
                event_id=event_data['id'],
                event_type=event_data['type'],
                source='stripe',
                payload_hash=payload_hash,
                payload_size=payload_size,
                api_version=event_data.get('api_version', ''),
                status='pending'
            )
            
            # Log successful event creation
            WebhookSecurityLog.log_security_event(
                event_type='success',
                severity='low',
                ip_address=request_info.get('ip_address'),
                user_agent=request_info.get('user_agent'),
                webhook_event_id=webhook_event.event_id,
                webhook_event_type=webhook_event.event_type,
                payload_size=payload_size,
                payload_hash=payload_hash,
                signature_valid=True,
                metadata={'action': 'event_created'}
            )
            
            return webhook_event
            
        except Exception as e:
            logger.error(f"Error creating webhook event: {str(e)}")
            raise WebhookSecurityError(f"Failed to create webhook event: {str(e)}", 'creation_error')
    
    def process_webhook_securely(self, request, webhook_secret: str) -> Tuple[Dict[str, Any], WebhookEvent]:
        """
        Main security processing function for webhooks
        Returns (event_data, webhook_event)
        """
        request_info = self.extract_request_info(request)
        payload = request.body
        signature = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        try:
            # Step 1: Validate payload size
            if not self.validate_payload_size(payload):
                WebhookSecurityLog.log_security_event(
                    event_type='invalid_payload',
                    severity='high',
                    ip_address=request_info.get('ip_address'),
                    user_agent=request_info.get('user_agent'),
                    payload_size=len(payload),
                    error_message=f"Payload size exceeds limit: {len(payload)} bytes"
                )
                raise WebhookSecurityError("Payload size exceeds maximum limit", 'payload_too_large', 'high')
            
            # Step 2: Compute payload hash
            payload_hash = self.compute_payload_hash(payload)
            
            # Step 3: Verify signature
            is_valid, error_message = self.verify_stripe_signature(payload, signature, webhook_secret)
            if not is_valid:
                WebhookSecurityLog.log_signature_failure(
                    ip_address=request_info.get('ip_address'),
                    user_agent=request_info.get('user_agent'),
                    error_message=error_message,
                    payload_size=len(payload),
                    payload_hash=payload_hash
                )
                raise WebhookSecurityError(f"Signature verification failed: {error_message}", 'signature_invalid', 'high')
            
            # Step 4: Parse and validate event structure
            try:
                event_data = json.loads(payload.decode('utf-8'))
            except json.JSONDecodeError as e:
                WebhookSecurityLog.log_security_event(
                    event_type='malformed_request',
                    severity='medium',
                    ip_address=request_info.get('ip_address'),
                    user_agent=request_info.get('user_agent'),
                    payload_size=len(payload),
                    payload_hash=payload_hash,
                    error_message=f"JSON decode error: {str(e)}"
                )
                raise WebhookSecurityError("Invalid JSON payload", 'invalid_json', 'medium')
            
            is_valid_structure, structure_error = self.validate_event_structure(event_data)
            if not is_valid_structure:
                WebhookSecurityLog.log_security_event(
                    event_type='invalid_payload',
                    severity='medium',
                    ip_address=request_info.get('ip_address'),
                    user_agent=request_info.get('user_agent'),
                    payload_size=len(payload),
                    payload_hash=payload_hash,
                    error_message=structure_error
                )
                raise WebhookSecurityError(f"Invalid event structure: {structure_error}", 'invalid_structure', 'medium')
            
            # Step 5: Check for duplicate events
            is_duplicate, existing_event = self.check_for_duplicate_event(event_data['id'], payload_hash)
            if is_duplicate:
                WebhookSecurityLog.log_duplicate_event(
                    ip_address=request_info.get('ip_address'),
                    user_agent=request_info.get('user_agent'),
                    webhook_event_id=event_data['id'],
                    webhook_event_type=event_data['type'],
                    payload_hash=payload_hash
                )
                existing_event.mark_as_duplicate()
                raise WebhookSecurityError("Duplicate event detected", 'duplicate_event', 'medium')
            
            # Step 6: Create webhook event record
            webhook_event = self.create_webhook_event(event_data, payload_hash, len(payload), request_info)
            
            return event_data, webhook_event
            
        except WebhookSecurityError:
            raise
        except Exception as e:
            # Log unexpected errors
            WebhookSecurityLog.log_security_event(
                event_type='processing_error',
                severity='high',
                ip_address=request_info.get('ip_address'),
                user_agent=request_info.get('user_agent'),
                payload_size=len(payload) if payload else 0,
                error_message=str(e),
                metadata={'exception_type': type(e).__name__}
            )
            raise WebhookSecurityError(f"Unexpected processing error", 'processing_error', 'high')
    
    def sanitize_error_message(self, error_message: str) -> str:
        """Sanitize error message to prevent information disclosure"""
        # Remove sensitive information patterns
        sensitive_patterns = [
            r'stripe_[a-zA-Z0-9_]+',  # Stripe IDs
            r'sk_[a-zA-Z0-9_]+',      # Stripe secret keys
            r'pk_[a-zA-Z0-9_]+',      # Stripe publishable keys
            r'whsec_[a-zA-Z0-9_]+',   # Stripe webhook secrets
            r'\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b',  # Credit card numbers
            r'\b\d{3}[-\s]\d{2}[-\s]\d{4}\b',  # SSN
        ]
        
        sanitized = error_message
        for pattern in sensitive_patterns:
            import re
            sanitized = re.sub(pattern, '[REDACTED]', sanitized, flags=re.IGNORECASE)
        
        return sanitized


# Global instance
webhook_security_manager = WebhookSecurityManager()