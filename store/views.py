from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from .permissions import IsCustomerOwner, IsActivityOwner, IsShippingAddressOwner, IsOrderOwner
from .models import Product, Customer, Order, OrderItem, ShippingAddress, Cart, CartItem, UserActivity
from .serializers import (
    UserSerializer, LoginSerializer, CustomerSerializer, CustomerUpdateSerializer,
    CustomerNotificationPreferencesSerializer, UserActivitySerializer, AvatarUploadSerializer,
    ProductSerializer, ProductListSerializer, OrderSerializer, ShippingAddressSerializer,
    CartSerializer, CartItemSerializer, CheckoutSerializer
)


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """Get user agent from request"""
    return request.META.get('HTTP_USER_AGENT', '')


class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """Enhanced CustomerViewSet with comprehensive profile operations"""
    queryset = Customer.objects.select_related('user').all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsCustomerOwner]
    
    def get_queryset(self):
        return Customer.objects.select_related('user').filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action in ['update', 'partial_update']:
            return CustomerUpdateSerializer
        return CustomerSerializer
    
    def perform_update(self, serializer):
        """Update customer profile and log activity"""
        serializer.save()
        # Log profile update activity
        UserActivity.log_activity(
            user=self.request.user,
            activity_type='profile_update',
            description="Profile updated",
            ip_address=get_client_ip(self.request),
            user_agent=get_user_agent(self.request)
        )
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request, pk=None):
        """Upload or update user avatar"""
        customer = self.get_object()
        
        # Additional security check
        if customer.user != request.user:
            return Response(
                {'error': 'You can only upload avatars for your own profile'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AvatarUploadSerializer(customer, data=request.data, partial=True)
        
        if serializer.is_valid():
            # Delete old avatar if exists
            if customer.avatar:
                customer.avatar.delete()
            
            serializer.save()
            
            # Log avatar upload activity
            UserActivity.log_activity(
                user=request.user,
                activity_type='avatar_uploaded',
                description="Avatar uploaded/updated",
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'message': 'Avatar uploaded successfully',
                'avatar_url': customer.get_avatar_url()
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def delete_avatar(self, request, pk=None):
        """Delete user avatar"""
        customer = self.get_object()
        
        # Additional security check
        if customer.user != request.user:
            return Response(
                {'error': 'You can only delete avatars for your own profile'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if customer.avatar:
            customer.avatar.delete()
            customer.avatar = None
            customer.save()
            
            # Log avatar deletion activity
            UserActivity.log_activity(
                user=request.user,
                activity_type='avatar_uploaded',
                description="Avatar deleted",
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({'message': 'Avatar deleted successfully'})
        
        return Response({'error': 'No avatar to delete'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'patch'])
    def notification_preferences(self, request, pk=None):
        """Get or update notification preferences"""
        customer = self.get_object()
        
        # Additional security check
        if customer.user != request.user:
            return Response(
                {'error': 'You can only access your own notification preferences'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == 'GET':
            serializer = CustomerNotificationPreferencesSerializer(customer)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = CustomerNotificationPreferencesSerializer(
                customer, data=request.data, partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                
                # Log preferences update activity
                UserActivity.log_activity(
                    user=request.user,
                    activity_type='preferences_updated',
                    description="Notification preferences updated",
                    ip_address=get_client_ip(request),
                    user_agent=get_user_agent(request)
                )
                
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def activity_log(self, request, pk=None):
        """Get user activity log"""
        customer = self.get_object()
        
        # Additional security check
        if customer.user != request.user:
            return Response(
                {'error': 'You can only access your own activity log'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        activities = UserActivity.objects.filter(user=customer.user)[:50]  # Last 50 activities
        serializer = UserActivitySerializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get user statistics"""
        customer = self.get_object()
        
        # Additional security check
        if customer.user != request.user:
            return Response(
                {'error': 'You can only access your own statistics'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update activity stats
        customer.update_activity_stats()
        
        stats = {
            'total_orders': customer.total_orders,
            'total_spent': customer.total_spent,
            'member_since': customer.created_at,
            'last_login': customer.last_login,
            'is_verified': customer.is_verified,
            'is_premium': customer.is_premium,
            'account_type': customer.account_type,
        }
        
        return Response(stats)


class ShippingAddressViewSet(viewsets.ModelViewSet):
    queryset = ShippingAddress.objects.all()
    serializer_class = ShippingAddressSerializer
    permission_classes = [IsAuthenticated, IsShippingAddressOwner]
    
    def get_queryset(self):
        customer = get_object_or_404(Customer, user=self.request.user)
        return ShippingAddress.objects.filter(customer=customer)
    
    def perform_create(self, serializer):
        customer = get_object_or_404(Customer, user=self.request.user)
        serializer.save(customer=customer)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsOrderOwner]
    
    def get_queryset(self):
        customer = get_object_or_404(Customer, user=self.request.user)
        return Order.objects.filter(customer=customer)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        customer = Customer.objects.create(user=user)
        token, created = Token.objects.get_or_create(user=user)
        
        # Log registration activity
        UserActivity.log_activity(
            user=user,
            activity_type='login',
            description="User registered and logged in",
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request)
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'customer': CustomerSerializer(customer).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        
        # Update customer's last login and log activity
        try:
            customer = Customer.objects.get(user=user)
            customer.last_login = timezone.now()
            customer.save(update_fields=['last_login'])
            
            # Log login activity
            UserActivity.log_activity(
                user=user,
                activity_type='login',
                description="User logged in",
                ip_address=get_client_ip(request),
                user_agent=get_user_agent(request)
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'customer': CustomerSerializer(customer).data,
                'token': token.key
            })
        except Customer.DoesNotExist:
            # Create customer if doesn't exist
            customer = Customer.objects.create(user=user, last_login=timezone.now())
            return Response({
                'user': UserSerializer(user).data,
                'customer': CustomerSerializer(customer).data,
                'token': token.key
            })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    # Log logout activity
    UserActivity.log_activity(
        user=request.user,
        activity_type='logout',
        description="User logged out",
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request)
    )
    
    try:
        request.user.auth_token.delete()
    except:
        pass
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get comprehensive user profile information"""
    try:
        customer = Customer.objects.select_related('user').get(user=request.user)
        
        # Update activity stats
        customer.update_activity_stats()
        
        return Response({
            'user': UserSerializer(request.user).data,
            'customer': CustomerSerializer(customer).data
        })
    except Customer.DoesNotExist:
        customer = Customer.objects.create(
            user=request.user,
            last_login=timezone.now()
        )
        return Response({
            'user': UserSerializer(request.user).data,
            'customer': CustomerSerializer(customer).data
        })


def get_or_create_cart(user, session_key):
    if user.is_authenticated:
        customer = get_object_or_404(Customer, user=user)
        cart, created = Cart.objects.get_or_create(customer=customer)
        if created and session_key:
            session_cart = Cart.objects.filter(session_key=session_key).first()
            if session_cart:
                for item in session_cart.items.all():
                    cart_item, created = CartItem.objects.get_or_create(
                        cart=cart, 
                        product=item.product,
                        defaults={'quantity': item.quantity}
                    )
                    if not created:
                        cart_item.quantity += item.quantity
                        cart_item.save()
                session_cart.delete()
    else:
        cart, created = Cart.objects.get_or_create(session_key=session_key)
    return cart


@api_view(['GET'])
@permission_classes([AllowAny])
def cart_view(request):
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    cart = get_or_create_cart(request.user, session_key)
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart(request):
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    cart = get_or_create_cart(request.user, session_key)
    serializer = CartItemSerializer(data=request.data)
    
    if serializer.is_valid():
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        product = get_object_or_404(Product, id=product_id, is_active=True)
        
        if product.stock_quantity < quantity:
            return Response({
                'error': 'Not enough stock available'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock_quantity:
                return Response({
                    'error': 'Not enough stock available'
                }, status=status.HTTP_400_BAD_REQUEST)
            cart_item.save()
        
        return Response(CartItemSerializer(cart_item).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_cart_item(request, item_id):
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    cart = get_or_create_cart(request.user, session_key)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    
    quantity = request.data.get('quantity')
    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not quantity or quantity <= 0:
        return Response({'error': 'Invalid quantity'}, status=status.HTTP_400_BAD_REQUEST)
    
    if cart_item.product.stock_quantity < quantity:
        return Response({
            'error': 'Not enough stock available'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    cart_item.quantity = quantity
    cart_item.save()
    
    return Response(CartItemSerializer(cart_item).data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_cart(request, item_id):
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    cart = get_or_create_cart(request.user, session_key)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    cart_item.delete()
    
    return Response({'message': 'Item removed from cart'})


@api_view(['DELETE'])
@permission_classes([AllowAny])
def clear_cart(request):
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    cart = get_or_create_cart(request.user, session_key)
    cart.items.all().delete()
    
    return Response({'message': 'Cart cleared'})


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """Simple API info endpoint for the root URL"""
    return Response({
        'name': 'Pasargad Prints API',
        'version': '1.0',
        'description': 'E-commerce API for custom 3D printed items',
        'endpoints': {
            'products': '/api/products/',
            'auth': {
                'register': '/api/register/',
                'login': '/api/login/',
                'logout': '/api/logout/',
                'profile': '/api/profile/',
            },
            'customer_profile': {
                'list': '/api/customers/',
                'detail': '/api/customers/{id}/',
                'upload_avatar': '/api/customers/{id}/upload_avatar/',
                'delete_avatar': '/api/customers/{id}/delete_avatar/',
                'notification_preferences': '/api/customers/{id}/notification_preferences/',
                'activity_log': '/api/customers/{id}/activity_log/',
                'stats': '/api/customers/{id}/stats/',
            },
            'cart': '/api/cart/',
            'orders': '/api/orders/',
            'shipping': '/api/shipping-addresses/',
            'admin': '/admin/',
        }
    })
