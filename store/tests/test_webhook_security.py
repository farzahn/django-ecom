"""
Test cases for webhook security functionality
"""

import json
import hashlib
import hmac
import time
from unittest.mock import patch, MagicMock
from django.test import TestCase, RequestFactory
from django.contrib.auth.models import User
from django.conf import settings
from django.http import HttpResponse

from store.models import Customer, WebhookEvent, WebhookSecurityLog, Product, Cart, CartItem, ShippingAddress
from store.webhook_security import WebhookSecurityManager, WebhookSecurityError
from store.stripe_views import stripe_webhook


class WebhookSecurityTest(TestCase):
    def setUp(self):
        """Set up test data"""
        self.factory = RequestFactory()
        self.security_manager = WebhookSecurityManager()
        
        # Create test user and customer
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.customer = Customer.objects.create(user=self.user)
        
        # Create test product
        self.product = Product.objects.create(
            name='Test Product',
            description='Test description',
            price=25.99,
            stock_quantity=10,
            length=10,
            width=10,
            height=10,
            weight=500
        )
        
        # Create test cart and items
        self.cart = Cart.objects.create(customer=self.customer)
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2
        )
        
        # Create test shipping address
        self.shipping_address = ShippingAddress.objects.create(
            customer=self.customer,
            full_name='Test User',
            address_line_1='123 Test St',
            city='Test City',
            state='CA',
            postal_code='12345',
            country='United States'
        )
        
        # Test webhook secret
        self.webhook_secret = 'whsec_test_secret_key'
        
    def create_valid_stripe_event(self, event_type='checkout.session.completed'):
        """Create a valid Stripe event payload"""
        event_data = {
            'id': 'evt_test_webhook_123',
            'object': 'event',
            'api_version': '2020-08-27',
            'created': int(time.time()),
            'type': event_type,
            'data': {
                'object': {
                    'id': 'cs_test_session_123',
                    'object': 'checkout.session',
                    'payment_status': 'paid',
                    'metadata': {
                        'customer_id': str(self.customer.id),
                        'shipping_address_id': str(self.shipping_address.id)
                    }
                }
            }
        }
        return event_data
    
    def create_stripe_signature(self, payload, secret, timestamp=None):
        """Create a valid Stripe signature"""
        if timestamp is None:
            timestamp = int(time.time())
        
        signed_payload = f"{timestamp}.{payload}".encode()
        signature = hmac.new(
            secret.encode(),
            signed_payload,
            hashlib.sha256
        ).hexdigest()
        
        return f"t={timestamp},v1={signature}"
    
    def test_payload_size_validation(self):
        """Test payload size validation"""
        # Test valid payload size
        small_payload = b'{"test": "data"}'
        self.assertTrue(self.security_manager.validate_payload_size(small_payload))
        
        # Test oversized payload
        large_payload = b'x' * (self.security_manager.max_payload_size + 1)
        self.assertFalse(self.security_manager.validate_payload_size(large_payload))
    
    def test_payload_hash_computation(self):
        """Test payload hash computation"""
        payload = b'{"test": "data"}'
        hash1 = self.security_manager.compute_payload_hash(payload)
        hash2 = self.security_manager.compute_payload_hash(payload)
        
        # Same payload should produce same hash
        self.assertEqual(hash1, hash2)
        
        # Different payload should produce different hash
        different_payload = b'{"test": "different"}'
        hash3 = self.security_manager.compute_payload_hash(different_payload)
        self.assertNotEqual(hash1, hash3)
    
    def test_stripe_signature_verification(self):
        """Test Stripe signature verification"""
        payload = b'{"test": "data"}'
        
        # Test valid signature
        valid_signature = self.create_stripe_signature(payload.decode(), self.webhook_secret)
        is_valid, error = self.security_manager.verify_stripe_signature(
            payload, valid_signature, self.webhook_secret
        )
        self.assertTrue(is_valid)
        self.assertIsNone(error)
        
        # Test invalid signature
        invalid_signature = "t=123,v1=invalid"
        is_valid, error = self.security_manager.verify_stripe_signature(
            payload, invalid_signature, self.webhook_secret
        )
        self.assertFalse(is_valid)
        self.assertIsNotNone(error)
        
        # Test missing signature
        is_valid, error = self.security_manager.verify_stripe_signature(
            payload, "", self.webhook_secret
        )
        self.assertFalse(is_valid)
        self.assertEqual(error, "Missing signature header")
    
    def test_event_structure_validation(self):
        """Test event structure validation"""
        # Valid event structure
        valid_event = self.create_valid_stripe_event()
        is_valid, error = self.security_manager.validate_event_structure(valid_event)
        self.assertTrue(is_valid)
        self.assertIsNone(error)
        
        # Invalid event structure - missing required field
        invalid_event = {'id': 'evt_test'}
        is_valid, error = self.security_manager.validate_event_structure(invalid_event)
        self.assertFalse(is_valid)
        self.assertIn("Missing required field", error)
        
        # Invalid event ID format
        invalid_id_event = valid_event.copy()
        invalid_id_event['id'] = 'invalid_id'
        is_valid, error = self.security_manager.validate_event_structure(invalid_id_event)
        self.assertFalse(is_valid)
        self.assertIn("Invalid event ID format", error)
    
    def test_duplicate_event_detection(self):
        """Test duplicate event detection"""
        event_data = self.create_valid_stripe_event()
        payload_hash = self.security_manager.compute_payload_hash(json.dumps(event_data).encode())
        
        # First event should not be duplicate
        is_duplicate, existing_event = self.security_manager.check_for_duplicate_event(
            event_data['id'], payload_hash
        )
        self.assertFalse(is_duplicate)
        self.assertIsNone(existing_event)
        
        # Create webhook event
        webhook_event = WebhookEvent.objects.create(
            event_id=event_data['id'],
            event_type=event_data['type'],
            payload_hash=payload_hash,
            payload_size=100,
            status='processed'
        )
        
        # Second event with same ID should be duplicate
        is_duplicate, existing_event = self.security_manager.check_for_duplicate_event(
            event_data['id'], payload_hash
        )
        self.assertTrue(is_duplicate)
        self.assertEqual(existing_event.id, webhook_event.id)
    
    def test_webhook_event_creation(self):
        """Test webhook event creation"""
        event_data = self.create_valid_stripe_event()
        payload_hash = self.security_manager.compute_payload_hash(json.dumps(event_data).encode())
        request_info = {
            'ip_address': '127.0.0.1',
            'user_agent': 'Test Agent'
        }
        
        webhook_event = self.security_manager.create_webhook_event(
            event_data, payload_hash, 100, request_info
        )
        
        self.assertEqual(webhook_event.event_id, event_data['id'])
        self.assertEqual(webhook_event.event_type, event_data['type'])
        self.assertEqual(webhook_event.payload_hash, payload_hash)
        self.assertEqual(webhook_event.status, 'pending')
    
    def test_error_message_sanitization(self):
        """Test error message sanitization"""
        sensitive_message = "Error with sk_test_secret_key and credit card 1234-5678-9012-3456"
        sanitized = self.security_manager.sanitize_error_message(sensitive_message)
        
        self.assertNotIn('sk_test_secret_key', sanitized)
        self.assertNotIn('1234-5678-9012-3456', sanitized)
        self.assertIn('[REDACTED]', sanitized)
    
    @patch('store.stripe_views.settings.STRIPE_WEBHOOK_SECRET', 'whsec_test_secret')
    def test_webhook_endpoint_valid_request(self):
        """Test webhook endpoint with valid request"""
        event_data = self.create_valid_stripe_event()
        payload = json.dumps(event_data).encode()
        signature = self.create_stripe_signature(payload.decode(), 'whsec_test_secret')
        
        request = self.factory.post(
            '/webhook/',
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE=signature
        )
        
        response = stripe_webhook(request)
        self.assertEqual(response.status_code, 200)
        
        # Check that webhook event was created
        webhook_event = WebhookEvent.objects.get(event_id=event_data['id'])
        self.assertEqual(webhook_event.status, 'processed')
    
    @patch('store.stripe_views.settings.STRIPE_WEBHOOK_SECRET', 'whsec_test_secret')
    def test_webhook_endpoint_invalid_signature(self):
        """Test webhook endpoint with invalid signature"""
        event_data = self.create_valid_stripe_event()
        payload = json.dumps(event_data).encode()
        
        request = self.factory.post(
            '/webhook/',
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE='invalid_signature'
        )
        
        response = stripe_webhook(request)
        self.assertEqual(response.status_code, 400)
        
        # Check that security log was created
        security_logs = WebhookSecurityLog.objects.filter(
            event_type='signature_verification_failed'
        )
        self.assertTrue(security_logs.exists())
    
    @patch('store.stripe_views.settings.STRIPE_WEBHOOK_SECRET', 'whsec_test_secret')
    def test_webhook_endpoint_duplicate_event(self):
        """Test webhook endpoint with duplicate event"""
        event_data = self.create_valid_stripe_event()
        payload = json.dumps(event_data).encode()
        signature = self.create_stripe_signature(payload.decode(), 'whsec_test_secret')
        
        # Create existing webhook event
        payload_hash = self.security_manager.compute_payload_hash(payload)
        WebhookEvent.objects.create(
            event_id=event_data['id'],
            event_type=event_data['type'],
            payload_hash=payload_hash,
            payload_size=len(payload),
            status='processed'
        )
        
        request = self.factory.post(
            '/webhook/',
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE=signature
        )
        
        response = stripe_webhook(request)
        self.assertEqual(response.status_code, 200)  # Duplicates return 200
        
        # Check that duplicate event was logged
        security_logs = WebhookSecurityLog.objects.filter(
            event_type='duplicate_event'
        )
        self.assertTrue(security_logs.exists())
    
    def test_webhook_event_status_transitions(self):
        """Test webhook event status transitions"""
        event_data = self.create_valid_stripe_event()
        payload_hash = self.security_manager.compute_payload_hash(json.dumps(event_data).encode())
        
        webhook_event = WebhookEvent.objects.create(
            event_id=event_data['id'],
            event_type=event_data['type'],
            payload_hash=payload_hash,
            payload_size=100,
            status='pending'
        )
        
        # Test mark as processing
        webhook_event.mark_as_processing()
        webhook_event.refresh_from_db()
        self.assertEqual(webhook_event.status, 'processing')
        self.assertEqual(webhook_event.processing_attempts, 1)
        self.assertIsNotNone(webhook_event.first_attempt_at)
        
        # Test mark as processed
        webhook_event.mark_as_processed()
        webhook_event.refresh_from_db()
        self.assertEqual(webhook_event.status, 'processed')
        self.assertIsNotNone(webhook_event.processed_at)
        
        # Test mark as failed
        webhook_event.mark_as_failed('Test error')
        webhook_event.refresh_from_db()
        self.assertEqual(webhook_event.status, 'failed')
        self.assertEqual(webhook_event.error_message, 'Test error')
        self.assertEqual(webhook_event.error_count, 1)
    
    def test_security_log_creation(self):
        """Test security log creation"""
        # Test success log
        success_log = WebhookSecurityLog.log_success(
            ip_address='127.0.0.1',
            user_agent='Test Agent',
            webhook_event_id='evt_test_123',
            webhook_event_type='checkout.session.completed'
        )
        
        self.assertEqual(success_log.event_type, 'success')
        self.assertEqual(success_log.severity, 'low')
        self.assertTrue(success_log.signature_valid)
        
        # Test signature failure log
        failure_log = WebhookSecurityLog.log_signature_failure(
            ip_address='127.0.0.1',
            error_message='Invalid signature'
        )
        
        self.assertEqual(failure_log.event_type, 'signature_verification_failed')
        self.assertEqual(failure_log.severity, 'high')
        self.assertFalse(failure_log.signature_valid)
    
    def test_webhook_security_manager_integration(self):
        """Test full webhook security manager integration"""
        event_data = self.create_valid_stripe_event()
        payload = json.dumps(event_data).encode()
        signature = self.create_stripe_signature(payload.decode(), self.webhook_secret)
        
        request = self.factory.post(
            '/webhook/',
            data=payload,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE=signature
        )
        
        # Process webhook securely
        processed_event_data, webhook_event = self.security_manager.process_webhook_securely(
            request, self.webhook_secret
        )
        
        self.assertEqual(processed_event_data['id'], event_data['id'])
        self.assertEqual(webhook_event.event_id, event_data['id'])
        self.assertEqual(webhook_event.status, 'pending')
        
        # Check that success log was created
        success_logs = WebhookSecurityLog.objects.filter(
            event_type='success',
            webhook_event_id=event_data['id']
        )
        self.assertTrue(success_logs.exists())