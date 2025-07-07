"""
Test module for enhanced Stripe integration (2025 best practices)
"""
import json
from decimal import Decimal
from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import Product, Customer, ShippingAddress, Cart, CartItem


class StripeEnhancedIntegrationTest(APITestCase):
    """Test enhanced Stripe checkout integration with 2025 best practices"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.customer = Customer.objects.create(user=self.user)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        # Create test product
        self.product = Product.objects.create(
            name="Enhanced 3D Print",
            description="Test 3D printed item with enhanced checkout",
            price=Decimal('29.99'),
            stock_quantity=10,
            length=Decimal('10.0'),
            width=Decimal('10.0'),
            height=Decimal('10.0'),
            weight=Decimal('200.0'),
            is_active=True
        )
        
        # Create shipping address
        self.shipping_address = ShippingAddress.objects.create(
            customer=self.customer,
            full_name='Test User',
            address_line_1='123 Test St',
            city='Test City',
            state='CA',
            postal_code='12345',
            country='US'
        )
        
        # Create cart with items
        self.cart = Cart.objects.create(customer=self.customer)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

    @patch('stripe.Customer.create')
    @patch('stripe.Customer.retrieve')
    @patch('stripe.checkout.Session.create')
    def test_enhanced_checkout_session_creation(self, mock_session_create, mock_customer_retrieve, mock_customer_create):
        """Test that enhanced checkout session is created with 2025 best practices"""
        
        # Mock Stripe customer creation
        mock_stripe_customer = MagicMock()
        mock_stripe_customer.id = 'cus_test123'
        mock_customer_create.return_value = mock_stripe_customer
        
        # Mock Stripe checkout session creation
        mock_checkout_session = MagicMock()
        mock_checkout_session.url = 'https://checkout.stripe.com/test'
        mock_checkout_session.id = 'cs_test123'
        mock_session_create.return_value = mock_checkout_session
        
        # Make request to create checkout session
        url = '/api/checkout/'
        data = {
            'shipping_address_id': self.shipping_address.id
        }
        response = self.client.post(url, data)
        
        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('checkout_url', response.data)
        self.assertIn('session_id', response.data)
        
        # Verify Stripe customer was created
        mock_customer_create.assert_called_once()
        customer_call_args = mock_customer_create.call_args[1]
        self.assertEqual(customer_call_args['email'], 'test@example.com')
        self.assertEqual(customer_call_args['name'], 'Test User')
        self.assertIn('customer_id', customer_call_args['metadata'])
        
        # Verify enhanced checkout session was created
        mock_session_create.assert_called_once()
        session_call_args = mock_session_create.call_args[1]
        
        # Check enhanced line items
        line_items = session_call_args['line_items']
        self.assertEqual(len(line_items), 1)
        line_item = line_items[0]
        
        # Verify enhanced product data
        product_data = line_item['price_data']['product_data']
        self.assertIn('metadata', product_data)
        self.assertEqual(product_data['metadata']['product_id'], str(self.product.id))
        self.assertEqual(product_data['metadata']['product_slug'], self.product.slug)
        self.assertEqual(product_data['metadata']['weight'], '200.00')
        
        # Verify 2025 best practices
        self.assertEqual(line_item['price_data']['tax_behavior'], 'exclusive')
        self.assertEqual(line_item['quantity'], 2)
        
        # Check enhanced metadata
        metadata = session_call_args['metadata']
        self.assertEqual(metadata['customer_id'], str(self.customer.id))
        self.assertEqual(metadata['shipping_address_id'], str(self.shipping_address.id))
        self.assertEqual(metadata['order_type'], '3d_print_products')
        self.assertEqual(metadata['source'], 'web_checkout')
        
        # Check enhanced features
        self.assertIn('shipping_address_collection', session_call_args)
        self.assertIn('shipping_options', session_call_args)
        self.assertIn('phone_number_collection', session_call_args)
        self.assertIn('custom_text', session_call_args)
        self.assertIn('invoice_creation', session_call_args)
        self.assertIn('consent_collection', session_call_args)
        
        # Verify shipping options
        shipping_options = session_call_args['shipping_options']
        self.assertEqual(len(shipping_options), 2)  # Standard and Express
        
        # Check standard shipping
        standard_shipping = shipping_options[0]
        self.assertEqual(standard_shipping['shipping_rate_data']['display_name'], 'Standard Shipping')
        self.assertEqual(standard_shipping['shipping_rate_data']['fixed_amount']['amount'], 999)
        
        # Check express shipping
        express_shipping = shipping_options[1]
        self.assertEqual(express_shipping['shipping_rate_data']['display_name'], 'Express Shipping')
        self.assertEqual(express_shipping['shipping_rate_data']['fixed_amount']['amount'], 1999)
        
        # Check custom text
        custom_text = session_call_args['custom_text']
        self.assertIn('shipping_address', custom_text)
        self.assertIn('submit', custom_text)
        
        # Check invoice creation
        invoice_creation = session_call_args['invoice_creation']
        self.assertTrue(invoice_creation['enabled'])
        self.assertIn('PasargadPrints Order', invoice_creation['invoice_data']['description'])
        
        # Verify customer was updated with Stripe ID
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.stripe_customer_id, 'cus_test123')

    def test_empty_cart_checkout_fails(self):
        """Test that checkout fails gracefully with empty cart"""
        # Clear cart
        self.cart.items.all().delete()
        
        url = '/api/checkout/'
        data = {
            'shipping_address_id': self.shipping_address.id
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Cart is empty')

    def test_insufficient_stock_checkout_fails(self):
        """Test that checkout fails when product has insufficient stock"""
        # Reduce product stock below cart quantity
        self.product.stock_quantity = 1
        self.product.save()
        
        url = '/api/checkout/'
        data = {
            'shipping_address_id': self.shipping_address.id
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('Not enough stock', response.data['error'])

    def test_invalid_shipping_address_checkout_fails(self):
        """Test that checkout fails with invalid shipping address"""
        url = '/api/checkout/'
        data = {
            'shipping_address_id': 99999  # Non-existent address
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class StripeCustomerManagementTest(TestCase):
    """Test Stripe customer management features"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.customer = Customer.objects.create(user=self.user)

    def test_customer_stripe_id_field(self):
        """Test that customer model has Stripe customer ID field"""
        self.assertIsNone(self.customer.stripe_customer_id)
        
        # Set Stripe customer ID
        self.customer.stripe_customer_id = 'cus_test123'
        self.customer.save()
        
        # Verify it's saved
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.stripe_customer_id, 'cus_test123')

    def test_customer_full_name_generation(self):
        """Test customer full name generation for Stripe"""
        # Test with first and last name
        full_name = f"{self.customer.user.first_name} {self.customer.user.last_name}".strip()
        self.assertEqual(full_name, "Test User")
        
        # Test with no last name
        self.user.last_name = ""
        self.user.save()
        full_name = f"{self.customer.user.first_name} {self.customer.user.last_name}".strip()
        self.assertEqual(full_name, "Test")