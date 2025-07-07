"""
Configuration and fixtures for end-to-end testing.
This file provides shared test configuration for all test modules.
"""

import os
import django
from django.conf import settings
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from decimal import Decimal
from unittest.mock import patch, MagicMock

# Configure Django settings for testing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pasargadprints.settings')
django.setup()

from store.models import Product, ProductImage, Customer, ShippingAddress, Cart, CartItem, Order, OrderItem


# Test helper functions (removing pytest fixtures for Django compatibility)

def create_api_client():
    """Create an API client for testing REST endpoints."""
    return APIClient()


def create_test_user():
    """Create a test user for authentication."""
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    return user


def create_test_products():
    """Create test products for checkout testing."""
    products = []
    
    # Product 1: 3D Printed Phone Stand
    product1 = Product.objects.create(
        name='3D Printed Phone Stand',
        description='Adjustable phone stand made with PLA plastic',
        price=Decimal('29.99'),
        stock_quantity=50,
        length=Decimal('15.0'),
        width=Decimal('10.0'),
        height=Decimal('8.0'),
        weight=Decimal('0.2'),
        is_active=True
    )
    
    # Product 2: Custom Chess Set
    product2 = Product.objects.create(
        name='Custom Chess Set',
        description='Complete chess set with custom design',
        price=Decimal('89.99'),
        stock_quantity=25,
        length=Decimal('40.0'),
        width=Decimal('40.0'),
        height=Decimal('5.0'),
        weight=Decimal('1.5'),
        is_active=True
    )
    
    products.extend([product1, product2])
    return products


def get_mock_stripe_session():
    """Mock Stripe checkout session for testing."""
    mock_session = MagicMock()
    mock_session.id = 'cs_test_1234567890'
    mock_session.url = 'https://checkout.stripe.com/pay/cs_test_1234567890'
    mock_session.payment_status = 'unpaid'
    mock_session.amount_total = 14998  # $149.98 in cents
    mock_session.metadata = {}
    return mock_session


def get_mock_goshippo_rates():
    """Mock GoShippo shipping rates for testing."""
    return {
        'rates': [
            {
                'id': 'mock_rate_usps_priority',
                'carrier': 'USPS',
                'service': 'Priority Mail',
                'amount': '15.50',
                'currency': 'USD',
                'estimated_days': 3,
                'duration_terms': '3 business days'
            },
            {
                'id': 'mock_rate_ups_ground',
                'carrier': 'UPS',
                'service': 'Ground',
                'amount': '18.75',
                'currency': 'USD',
                'estimated_days': 5,
                'duration_terms': '5 business days'
            }
        ],
        'shipment_id': 'mock_shipment_12345'
    }


class BaseE2ETestCase(TestCase):
    """Base test case for end-to-end testing with common setup."""
    
    def setUp(self):
        """Set up test data for each test."""
        # Create test user and customer
        self.user = User.objects.create_user(
            username='e2etest',
            email='e2e@example.com',
            password='testpass123'
        )
        
        self.customer = Customer.objects.create(
            user=self.user,
            phone='+1-555-999-8888'
        )
        
        # Create test token for API authentication
        self.token = Token.objects.create(user=self.user)
        
        # Create API client
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        
        # Create test products
        self.create_test_products()
        
        # Create test shipping address
        self.shipping_address = ShippingAddress.objects.create(
            customer=self.customer,
            full_name='E2E Test User',
            address_line_1='456 E2E Test Avenue',
            city='San Francisco',
            state='CA',
            postal_code='94105',
            country='US',
            is_default=True
        )
    
    def create_test_products(self):
        """Create test products for checkout testing."""
        self.product1 = Product.objects.create(
            name='E2E Test Product 1',
            description='Test product for end-to-end checkout testing',
            price=Decimal('25.00'),
            stock_quantity=100,
            length=Decimal('10.0'),
            width=Decimal('8.0'),
            height=Decimal('5.0'),
            weight=Decimal('0.3'),
            is_active=True
        )
        
        self.product2 = Product.objects.create(
            name='E2E Test Product 2',
            description='Second test product for cart testing',
            price=Decimal('45.00'),
            stock_quantity=50,
            length=Decimal('20.0'),
            width=Decimal('15.0'),
            height=Decimal('10.0'),
            weight=Decimal('0.8'),
            is_active=True
        )
    
    def create_test_cart(self):
        """Create a cart with test items."""
        # Add items to cart via API
        self.client.post('/api/cart/add/', {
            'product_id': self.product1.id,
            'quantity': 2
        })
        
        self.client.post('/api/cart/add/', {
            'product_id': self.product2.id,
            'quantity': 1
        })
        
        # Return the cart object
        return Cart.objects.get(customer=self.customer)
    
    def mock_external_apis(self):
        """Set up mocks for external API calls."""
        # Mock Stripe API calls
        self.stripe_session_mock = patch('stripe.checkout.Session.create')
        self.stripe_session_create = self.stripe_session_mock.start()
        
        # Mock GoShippo API calls
        self.goshippo_mock = patch('shippo.Shipment.create')
        self.goshippo_create = self.goshippo_mock.start()
        
        return self.stripe_session_create, self.goshippo_create
    
    def tearDown(self):
        """Clean up after each test."""
        # Stop all patches
        if hasattr(self, 'stripe_session_mock'):
            self.stripe_session_mock.stop()
        if hasattr(self, 'goshippo_mock'):
            self.goshippo_mock.stop()


# Test data constants
TEST_STRIPE_CARDS = {
    'visa_success': '4242424242424242',
    'visa_declined': '4000000000000002',
    'visa_3d_secure': '4000000000003220',
    'amex_success': '378282246310005',
    'mastercard_success': '5555555555554444'
}

TEST_SHIPPING_ADDRESSES = {
    'california': {
        'full_name': 'John Doe',
        'address_line_1': '123 Main Street',
        'city': 'San Francisco',
        'state': 'CA',
        'postal_code': '94105',
        'country': 'US'
    },
    'new_york': {
        'full_name': 'Jane Smith',
        'address_line_1': '456 Broadway',
        'city': 'New York',
        'state': 'NY',
        'postal_code': '10013',
        'country': 'US'
    },
    'texas': {
        'full_name': 'Bob Johnson',
        'address_line_1': '789 Texas Ave',
        'city': 'Austin',
        'state': 'TX',
        'postal_code': '73301',
        'country': 'US'
    }
}