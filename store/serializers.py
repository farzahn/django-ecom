from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Product, ProductImage, Customer, Order, OrderItem, ShippingAddress, Cart, CartItem, UserActivity


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return data


class CustomerSerializer(serializers.ModelSerializer):
    """Comprehensive Customer serializer with all profile fields"""
    user = UserSerializer(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    display_name = serializers.CharField(source='get_display_name', read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'user', 'phone', 'date_of_birth', 'avatar', 'avatar_url',
            'website', 'full_name', 'display_name',
            'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
            'preferred_currency', 'preferred_language', 'timezone',
            'email_notifications', 'marketing_emails', 'sms_notifications',
            'is_verified', 'last_login', 'total_orders', 'total_spent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'avatar_url', 'full_name', 'display_name', 
                           'is_verified', 'last_login', 'total_orders', 
                           'total_spent', 'created_at', 'updated_at']
    
    def get_avatar_url(self, obj):
        """Return avatar URL or None"""
        return obj.get_avatar_url()


class CustomerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating customer profile (excludes sensitive fields)"""
    
    class Meta:
        model = Customer
        fields = [
            'phone', 'date_of_birth', 'website',
            'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
            'preferred_currency', 'preferred_language', 'timezone'
        ]


class CustomerNotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    
    class Meta:
        model = Customer
        fields = ['email_notifications', 'marketing_emails', 'sms_notifications']


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activity logs"""
    
    class Meta:
        model = UserActivity
        fields = ['id', 'activity_type', 'description', 'timestamp', 'metadata']
        read_only_fields = ['id', 'timestamp']


class AvatarUploadSerializer(serializers.ModelSerializer):
    """Serializer specifically for avatar uploads"""
    
    class Meta:
        model = Customer
        fields = ['avatar']
    
    def validate_avatar(self, value):
        """Additional avatar validation"""
        if value:
            # Check file size (5MB limit)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Avatar file size must be less than 5MB")
            
            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError("Avatar must be a JPEG, PNG, or GIF image")
        
        return value


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock_quantity', 
                 'length', 'width', 'height', 'weight', 'slug', 'images',
                 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['slug', 'created_at', 'updated_at']


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'slug', 'primary_image', 'stock_quantity']
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url
        first_image = obj.images.first()
        if first_image:
            return first_image.image.url
        return None


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = ['id', 'full_name', 'address_line_1', 'address_line_2', 
                 'city', 'state', 'postal_code', 'country', 'is_default']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'order_date', 'status', 'total_price', 
                 'shipping_cost', 'shipping_method', 'tracking_number',
                 'shipping_rate_id', 'shipping_carrier', 'shipping_service', 'shipping_estimated_days',
                 'items', 'shipping_address', 'is_archived', 'archived_at']
        read_only_fields = ['order_id', 'order_date', 'is_archived', 'archived_at']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_customers = serializers.IntegerField()
    recent_orders = OrderSerializer(many=True, read_only=True)
    orders_by_status = serializers.DictField()
    monthly_revenue = serializers.ListField()


class BulkOrderOperationSerializer(serializers.Serializer):
    """Serializer for bulk order operations"""
    order_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        max_length=100
    )
    action = serializers.ChoiceField(choices=['archive', 'unarchive'])
    
    def validate_order_ids(self, value):
        """Validate that order IDs exist"""
        if not value:
            raise serializers.ValidationError("At least one order ID is required")
        return value


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price']
    
    def validate_product_id(self, value):
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or inactive")
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']


class CheckoutSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField()
    shipping_rate_id = serializers.CharField(required=False, allow_blank=True)
    shipping_carrier = serializers.CharField(required=False, allow_blank=True)
    shipping_service = serializers.CharField(required=False, allow_blank=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    shipping_estimated_days = serializers.IntegerField(required=False)
    
    def validate_shipping_address_id(self, value):
        try:
            address = ShippingAddress.objects.get(id=value)
        except ShippingAddress.DoesNotExist:
            raise serializers.ValidationError("Shipping address not found")
        return value
    
    def validate_shipping_rate_id(self, value):
        # Allow empty/None values since shipping is optional for some cases
        if value is not None and len(str(value).strip()) == 0:
            raise serializers.ValidationError("Shipping rate ID cannot be empty")
        return value
    
    def validate_shipping_cost(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Shipping cost cannot be negative")
        return value