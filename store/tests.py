from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from rest_framework import status
from decimal import Decimal
from .models import Product, Customer, Order, OrderItem, ShippingAddress, Cart, CartItem, ProductImage


class ProductModelTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Test 3D Print",
            description="A test 3D printed item",
            price=Decimal('29.99'),
            stock_quantity=10,
            length=Decimal('10.5'),
            width=Decimal('5.2'),
            height=Decimal('3.1'),
            weight=Decimal('50.0')
        )

    def test_product_creation(self):
        self.assertEqual(self.product.name, "Test 3D Print")
        self.assertEqual(self.product.price, Decimal('29.99'))
        self.assertEqual(self.product.stock_quantity, 10)
        self.assertTrue(self.product.slug)
        self.assertTrue(self.product.in_stock())

    def test_product_slug_generation(self):
        self.assertEqual(self.product.slug, "test-3d-print")

    def test_out_of_stock(self):
        self.product.stock_quantity = 0
        self.product.save()
        self.assertFalse(self.product.in_stock())

    def test_product_str(self):
        self.assertEqual(str(self.product), "Test 3D Print")


class CustomerModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.customer = Customer.objects.create(
            user=self.user,
            phone='555-123-4567'
        )

    def test_customer_creation(self):
        self.assertEqual(self.customer.user.username, 'testuser')
        self.assertEqual(self.customer.phone, '555-123-4567')

    def test_customer_str(self):
        self.assertEqual(str(self.customer), "Test User")


class OrderModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.customer = Customer.objects.create(user=self.user)
        self.product = Product.objects.create(
            name="Test Product",
            description="Test description",
            price=Decimal('19.99'),
            stock_quantity=5,
            length=Decimal('5.0'),
            width=Decimal('5.0'),
            height=Decimal('5.0'),
            weight=Decimal('100.0')
        )
        self.order = Order.objects.create(
            customer=self.customer,
            total_price=Decimal('39.98')
        )

    def test_order_creation(self):
        self.assertEqual(self.order.customer, self.customer)
        self.assertEqual(self.order.total_price, Decimal('39.98'))
        self.assertTrue(self.order.order_id)
        self.assertEqual(self.order.status, 'pending')

    def test_order_id_generation(self):
        self.assertEqual(len(self.order.order_id), 8)
        self.assertTrue(self.order.order_id.isupper())

    def test_order_str(self):
        self.assertEqual(str(self.order), f"Order {self.order.order_id}")


class CartModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.customer = Customer.objects.create(user=self.user)
        self.product1 = Product.objects.create(
            name="Product 1",
            description="Test description 1",
            price=Decimal('10.00'),
            stock_quantity=5,
            length=Decimal('5.0'),
            width=Decimal('5.0'),
            height=Decimal('5.0'),
            weight=Decimal('100.0')
        )
        self.product2 = Product.objects.create(
            name="Product 2",
            description="Test description 2",
            price=Decimal('15.00'),
            stock_quantity=3,
            length=Decimal('5.0'),
            width=Decimal('5.0'),
            height=Decimal('5.0'),
            weight=Decimal('150.0')
        )
        self.cart = Cart.objects.create(customer=self.customer)

    def test_cart_creation(self):
        self.assertEqual(self.cart.customer, self.customer)
        self.assertEqual(self.cart.total_items, 0)
        self.assertEqual(self.cart.total_price, 0)

    def test_cart_with_items(self):
        CartItem.objects.create(cart=self.cart, product=self.product1, quantity=2)
        CartItem.objects.create(cart=self.cart, product=self.product2, quantity=1)
        
        self.assertEqual(self.cart.total_items, 3)
        self.assertEqual(self.cart.total_price, Decimal('35.00'))

    def test_cart_item_total_price(self):
        cart_item = CartItem.objects.create(cart=self.cart, product=self.product1, quantity=3)
        self.assertEqual(cart_item.total_price, Decimal('30.00'))


class ProductAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.customer = Customer.objects.create(user=self.user)
        self.token = Token.objects.create(user=self.user)
        
        self.product1 = Product.objects.create(
            name="Active Product",
            description="An active product",
            price=Decimal('25.99'),
            stock_quantity=10,
            length=Decimal('10.0'),
            width=Decimal('10.0'),
            height=Decimal('10.0'),
            weight=Decimal('200.0'),
            is_active=True
        )
        self.product2 = Product.objects.create(
            name="Inactive Product",
            description="An inactive product",
            price=Decimal('35.99'),
            stock_quantity=5,
            length=Decimal('15.0'),
            width=Decimal('15.0'),
            height=Decimal('15.0'),
            weight=Decimal('300.0'),
            is_active=False
        )

    def test_get_products_list(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only return active products
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Active Product")

    def test_get_product_detail(self):
        url = reverse('product-detail', args=[self.product1.slug])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Active Product")
        self.assertEqual(response.data['price'], '25.99')

    def test_get_inactive_product_detail(self):
        url = reverse('product-detail', args=[self.product2.slug])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AuthAPITest(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        
        # Check if customer was created
        user = User.objects.get(username='testuser')
        self.assertTrue(Customer.objects.filter(user=user).exists())

    def test_user_login(self):
        # First create a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        Customer.objects.create(user=user)
        
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_invalid_login(self):
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpass'
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CartAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.customer = Customer.objects.create(user=self.user)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        self.product = Product.objects.create(
            name="Test Product",
            description="Test description",
            price=Decimal('19.99'),
            stock_quantity=10,
            length=Decimal('5.0'),
            width=Decimal('5.0'),
            height=Decimal('5.0'),
            weight=Decimal('100.0'),
            is_active=True
        )

    def test_get_cart(self):
        url = reverse('cart')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_items'], 0)

    def test_add_to_cart(self):
        url = reverse('add_to_cart')
        data = {
            'product_id': self.product.id,
            'quantity': 2
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check cart after adding
        cart_url = reverse('cart')
        cart_response = self.client.get(cart_url)
        self.assertEqual(cart_response.data['total_items'], 2)

    def test_add_to_cart_insufficient_stock(self):
        url = reverse('add_to_cart')
        data = {
            'product_id': self.product.id,
            'quantity': 15  # More than stock
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_update_cart_item(self):
        # First add an item
        cart = Cart.objects.create(customer=self.customer)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        
        url = reverse('update_cart_item', args=[cart_item.id])
        data = {'quantity': 3}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        cart_item.refresh_from_db()
        self.assertEqual(cart_item.quantity, 3)

    def test_remove_from_cart(self):
        # First add an item
        cart = Cart.objects.create(customer=self.customer)
        cart_item = CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        
        url = reverse('remove_from_cart', args=[cart_item.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check item was removed
        self.assertFalse(CartItem.objects.filter(id=cart_item.id).exists())


class ShippingAddressAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.customer = Customer.objects.create(user=self.user)
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_create_shipping_address(self):
        url = reverse('shippingaddress-list')
        data = {
            'full_name': 'John Doe',
            'address_line_1': '123 Main St',
            'city': 'Anytown',
            'state': 'CA',
            'postal_code': '12345',
            'country': 'US'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check address was created and linked to customer
        address = ShippingAddress.objects.get(full_name='John Doe')
        self.assertEqual(address.customer, self.customer)

    def test_get_shipping_addresses(self):
        # Create an address
        ShippingAddress.objects.create(
            customer=self.customer,
            full_name='John Doe',
            address_line_1='123 Main St',
            city='Anytown',
            state='CA',
            postal_code='12345',
            country='US'
        )
        
        url = reverse('shippingaddress-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], 'John Doe')
