from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.core.exceptions import ValidationError
import uuid
import os
import re


def validate_file_size(value):
    """Validate file size is less than 5MB"""
    limit = 5 * 1024 * 1024  # 5MB
    if value.size > limit:
        raise ValidationError(f'File too large. Size should not exceed {limit/1024/1024}MB')


def user_avatar_upload_path(instance, filename):
    """Generate upload path for user avatars"""
    ext = filename.split('.')[-1]
    filename = f'{instance.user.id}_avatar.{ext}'
    return os.path.join('avatars/', filename)


def validate_us_postal_code(value):
    """Validate US postal code format"""
    if not re.match(r'^\d{5}(-\d{4})?$', value):
        raise ValidationError('Invalid US postal code format. Use 12345 or 12345-6789.')


def validate_us_state(value):
    """Validate US state abbreviation"""
    us_states = {
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    }
    if value.upper() not in us_states:
        raise ValidationError('Invalid US state abbreviation.')


def validate_us_phone(value):
    """Validate US phone number format"""
    if not re.match(r'^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$', value):
        raise ValidationError('Invalid US phone number format. Use (123) 456-7890 or similar format.')


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock_quantity = models.PositiveIntegerField(default=0)
    length = models.DecimalField(max_digits=8, decimal_places=2, help_text="Length in cm")
    width = models.DecimalField(max_digits=8, decimal_places=2, help_text="Width in cm")
    height = models.DecimalField(max_digits=8, decimal_places=2, help_text="Height in cm")
    weight = models.DecimalField(max_digits=8, decimal_places=2, help_text="Weight in grams")
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def in_stock(self):
        return self.stock_quantity > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.product.name}"


class Customer(models.Model):
    """Enhanced Customer model with comprehensive profile fields"""
    
    # Basic fields (existing)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True, validators=[validate_us_phone])
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Profile enhancement fields
    avatar = models.ImageField(
        upload_to=user_avatar_upload_path, 
        null=True, 
        blank=True,
        validators=[
            validate_file_size,
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
        ],
        help_text="Profile picture (max 5MB, jpg/jpeg/png/gif only)"
    )
    website = models.URLField(blank=True, help_text="Personal or business website")
    
    # Address fields
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Preferences
    preferred_currency = models.CharField(
        max_length=3, 
        default='USD',
        choices=[
            ('USD', 'US Dollar'),
            ('EUR', 'Euro'),
            ('GBP', 'British Pound'),
            ('CAD', 'Canadian Dollar'),
            ('AUD', 'Australian Dollar'),
        ]
    )
    preferred_language = models.CharField(
        max_length=5,
        default='en',
        choices=[
            ('en', 'English'),
            ('es', 'Spanish'),
            ('fr', 'French'),
            ('de', 'German'),
            ('it', 'Italian'),
        ]
    )
    timezone = models.CharField(
        max_length=50,
        default='UTC',
        help_text="User's timezone preference"
    )
    
    # Communication preferences
    email_notifications = models.BooleanField(
        default=True,
        help_text="Receive email notifications for orders and updates"
    )
    marketing_emails = models.BooleanField(
        default=False,
        help_text="Receive marketing and promotional emails"
    )
    sms_notifications = models.BooleanField(
        default=False,
        help_text="Receive SMS notifications for order updates"
    )
    
    # Account settings
    is_verified = models.BooleanField(
        default=False,
        help_text="Email verification status"
    )
    
    # Payment integration
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Stripe customer ID for payment processing"
    )
    
    # Activity tracking
    last_login = models.DateTimeField(null=True, blank=True)
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}" if self.user.first_name else self.user.username

    def get_full_name(self):
        """Return user's full name"""
        return f"{self.user.first_name} {self.user.last_name}".strip()

    def get_display_name(self):
        """Return display name (full name or username)"""
        full_name = self.get_full_name()
        return full_name if full_name else self.user.username

    def get_avatar_url(self):
        """Return avatar URL or None"""
        if self.avatar:
            return self.avatar.url
        return None

    def update_activity_stats(self):
        """Update activity statistics"""
        from django.utils import timezone
        self.last_login = timezone.now()
        # Update total orders and spent from Order model
        orders = self.orders.filter(status__in=['processing', 'shipped', 'delivered'])
        self.total_orders = orders.count()
        self.total_spent = sum(order.total_price for order in orders)
        self.save(update_fields=['last_login', 'total_orders', 'total_spent'])

    def can_receive_notifications(self, notification_type='email'):
        """Check if user can receive specific type of notifications"""
        if notification_type == 'email':
            return self.email_notifications
        elif notification_type == 'sms':
            return self.sms_notifications and self.phone
        elif notification_type == 'marketing':
            return self.marketing_emails
        return False


class UserActivity(models.Model):
    """Track user activities and actions"""
    
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('profile_update', 'Profile Update'),
        ('password_change', 'Password Change'),
        ('order_placed', 'Order Placed'),
        ('order_cancelled', 'Order Cancelled'),
        ('product_viewed', 'Product Viewed'),
        ('cart_updated', 'Cart Updated'),
        ('address_added', 'Address Added'),
        ('address_updated', 'Address Updated'),
        ('avatar_uploaded', 'Avatar Uploaded'),
        ('preferences_updated', 'Preferences Updated'),
        ('system_cleanup', 'System Cleanup'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'activity_type']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()}"

    @classmethod
    def log_activity(cls, user, activity_type, description="", ip_address=None, user_agent="", metadata=None):
        """Create a new activity log entry"""
        return cls.objects.create(
            user=user,
            activity_type=activity_type,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {}
        )


class ShippingAddress(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='shipping_addresses')
    full_name = models.CharField(max_length=200)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2, validators=[validate_us_state], help_text="2-letter US state abbreviation")
    postal_code = models.CharField(max_length=10, validators=[validate_us_postal_code], help_text="US postal code (12345 or 12345-6789)")
    country = models.CharField(max_length=100, default='United States')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Shipping Addresses"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.state}"
    
    def clean(self):
        """Additional validation for US addresses"""
        super().clean()
        # Accept multiple formats for United States
        valid_us_formats = ['us', 'usa', 'united states', 'united states of america']
        if self.country.lower() not in valid_us_formats:
            raise ValidationError('Only United States addresses are supported.')
        
        # Ensure state is uppercase
        if self.state:
            self.state = self.state.upper()
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('archived', 'Archived'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    order_id = models.CharField(max_length=100, unique=True, blank=True)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.ForeignKey(ShippingAddress, on_delete=models.SET_NULL, null=True)
    
    # Stripe fields
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    stripe_checkout_session_id = models.CharField(max_length=255, blank=True)
    
    # Shipping fields
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_method = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=200, blank=True)
    
    # GoShippo shipping integration fields
    shipping_rate_id = models.CharField(max_length=255, blank=True, help_text="GoShippo rate ID")
    shipping_carrier = models.CharField(max_length=100, blank=True, help_text="Shipping carrier (e.g., USPS, UPS)")
    shipping_service = models.CharField(max_length=100, blank=True, help_text="Shipping service (e.g., Priority Mail)")
    shipping_estimated_days = models.IntegerField(null=True, blank=True, help_text="Estimated delivery days")
    
    # Stock management
    stock_deducted = models.BooleanField(default=False, help_text="Indicates if stock has been deducted for this order")
    
    # Archive functionality
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-order_date']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['order_date']),
            models.Index(fields=['is_archived']),
        ]

    def __str__(self):
        return f"Order {self.order_id}"

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)
    
    def archive(self):
        """Archive this order"""
        from django.utils import timezone
        self.is_archived = True
        self.archived_at = timezone.now()
        self.save(update_fields=['is_archived', 'archived_at'])
    
    def unarchive(self):
        """Unarchive this order"""
        self.is_archived = False
        self.archived_at = None
        self.save(update_fields=['is_archived', 'archived_at'])
    
    @classmethod
    def bulk_archive(cls, order_ids, user=None):
        """Archive multiple orders"""
        from django.utils import timezone
        queryset = cls.objects.filter(id__in=order_ids)
        if user:
            queryset = queryset.filter(customer__user=user)
        
        updated_count = queryset.update(
            is_archived=True,
            archived_at=timezone.now()
        )
        return updated_count
    
    @classmethod
    def bulk_unarchive(cls, order_ids, user=None):
        """Unarchive multiple orders"""
        queryset = cls.objects.filter(id__in=order_ids, is_archived=True)
        if user:
            queryset = queryset.filter(customer__user=user)
        
        updated_count = queryset.update(
            is_archived=False,
            archived_at=None
        )
        return updated_count


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def total_price(self):
        return self.quantity * self.price


class Cart(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.customer:
            return f"Cart for {self.customer.user.username}"
        return f"Anonymous Cart {self.session_key}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def total_price(self):
        return self.quantity * self.product.price


class WebhookEvent(models.Model):
    """Model to track webhook events for idempotency and auditing"""
    
    WEBHOOK_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
        ('duplicate', 'Duplicate'),
    ]
    
    WEBHOOK_TYPE_CHOICES = [
        ('stripe.checkout.session.completed', 'Stripe Checkout Session Completed'),
        ('stripe.payment_intent.succeeded', 'Stripe Payment Intent Succeeded'),
        ('stripe.payment_intent.payment_failed', 'Stripe Payment Intent Failed'),
        ('stripe.invoice.payment_succeeded', 'Stripe Invoice Payment Succeeded'),
        ('stripe.customer.created', 'Stripe Customer Created'),
        ('stripe.customer.updated', 'Stripe Customer Updated'),
        ('other', 'Other'),
    ]
    
    # Event identification
    event_id = models.CharField(max_length=255, unique=True, db_index=True)
    event_type = models.CharField(max_length=50, choices=WEBHOOK_TYPE_CHOICES)
    source = models.CharField(max_length=50, default='stripe')
    
    # Processing status
    status = models.CharField(max_length=20, choices=WEBHOOK_STATUS_CHOICES, default='pending')
    
    # Event data
    payload_hash = models.CharField(max_length=64, db_index=True)  # SHA256 hash of payload
    payload_size = models.PositiveIntegerField()
    api_version = models.CharField(max_length=50, blank=True)
    
    # Processing metadata
    processing_attempts = models.PositiveIntegerField(default=0)
    first_attempt_at = models.DateTimeField(null=True, blank=True)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Related objects
    related_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    related_customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    error_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_id', 'status']),
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['payload_hash']),
            models.Index(fields=['source', 'status']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.event_id}"
    
    def mark_as_processing(self):
        """Mark webhook event as being processed"""
        from django.utils import timezone
        self.status = 'processing'
        self.processing_attempts += 1
        self.last_attempt_at = timezone.now()
        if not self.first_attempt_at:
            self.first_attempt_at = self.last_attempt_at
        self.save(update_fields=['status', 'processing_attempts', 'last_attempt_at', 'first_attempt_at'])
    
    def mark_as_processed(self, related_order=None, related_customer=None):
        """Mark webhook event as successfully processed"""
        from django.utils import timezone
        self.status = 'processed'
        self.processed_at = timezone.now()
        if related_order:
            self.related_order = related_order
        if related_customer:
            self.related_customer = related_customer
        self.save(update_fields=['status', 'processed_at', 'related_order', 'related_customer'])
    
    def mark_as_failed(self, error_message):
        """Mark webhook event as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.error_count += 1
        self.save(update_fields=['status', 'error_message', 'error_count'])
    
    def mark_as_duplicate(self):
        """Mark webhook event as duplicate"""
        self.status = 'duplicate'
        self.save(update_fields=['status'])
    
    def is_processable(self):
        """Check if webhook event can be processed"""
        return self.status in ['pending', 'failed'] and self.processing_attempts < 3
    
    def get_retry_delay(self):
        """Get delay before retry in seconds (exponential backoff)"""
        if self.processing_attempts == 0:
            return 0
        return min(300, 2 ** self.processing_attempts)  # Max 5 minutes


class WebhookSecurityLog(models.Model):
    """Model to track webhook security events and potential threats"""
    
    SECURITY_EVENT_TYPES = [
        ('signature_verification_failed', 'Signature Verification Failed'),
        ('invalid_payload', 'Invalid Payload'),
        ('rate_limit_exceeded', 'Rate Limit Exceeded'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('malformed_request', 'Malformed Request'),
        ('duplicate_event', 'Duplicate Event'),
        ('processing_error', 'Processing Error'),
        ('success', 'Success'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    # Event identification
    event_type = models.CharField(max_length=50, choices=SECURITY_EVENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    
    # Request details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    request_method = models.CharField(max_length=10, default='POST')
    request_path = models.CharField(max_length=255, blank=True)
    
    # Webhook specific details
    webhook_source = models.CharField(max_length=50, default='stripe')
    webhook_event_id = models.CharField(max_length=255, blank=True)
    webhook_event_type = models.CharField(max_length=50, blank=True)
    
    # Security details
    signature_valid = models.BooleanField(null=True, blank=True)
    payload_size = models.PositiveIntegerField(null=True, blank=True)
    payload_hash = models.CharField(max_length=64, blank=True)
    
    # Error details
    error_message = models.TextField(blank=True)
    error_code = models.CharField(max_length=50, blank=True)
    
    # Additional context
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'severity']),
            models.Index(fields=['ip_address', 'timestamp']),
            models.Index(fields=['webhook_source', 'event_type']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.severity} - {self.timestamp}"
    
    @classmethod
    def log_security_event(cls, event_type, severity='medium', ip_address=None, user_agent='', 
                          webhook_source='stripe', webhook_event_id='', webhook_event_type='',
                          signature_valid=None, payload_size=None, payload_hash='',
                          error_message='', error_code='', metadata=None, request_method='POST',
                          request_path=''):
        """Create a security log entry"""
        return cls.objects.create(
            event_type=event_type,
            severity=severity,
            ip_address=ip_address,
            user_agent=user_agent,
            request_method=request_method,
            request_path=request_path,
            webhook_source=webhook_source,
            webhook_event_id=webhook_event_id,
            webhook_event_type=webhook_event_type,
            signature_valid=signature_valid,
            payload_size=payload_size,
            payload_hash=payload_hash,
            error_message=error_message,
            error_code=error_code,
            metadata=metadata or {}
        )
    
    @classmethod
    def log_success(cls, ip_address=None, user_agent='', webhook_event_id='', 
                   webhook_event_type='', payload_size=None, payload_hash=''):
        """Log successful webhook processing"""
        return cls.log_security_event(
            event_type='success',
            severity='low',
            ip_address=ip_address,
            user_agent=user_agent,
            webhook_event_id=webhook_event_id,
            webhook_event_type=webhook_event_type,
            signature_valid=True,
            payload_size=payload_size,
            payload_hash=payload_hash
        )
    
    @classmethod
    def log_signature_failure(cls, ip_address=None, user_agent='', error_message='',
                             payload_size=None, payload_hash=''):
        """Log signature verification failure"""
        return cls.log_security_event(
            event_type='signature_verification_failed',
            severity='high',
            ip_address=ip_address,
            user_agent=user_agent,
            signature_valid=False,
            payload_size=payload_size,
            payload_hash=payload_hash,
            error_message=error_message
        )
    
    @classmethod
    def log_duplicate_event(cls, ip_address=None, user_agent='', webhook_event_id='',
                           webhook_event_type='', payload_hash=''):
        """Log duplicate event detection"""
        return cls.log_security_event(
            event_type='duplicate_event',
            severity='medium',
            ip_address=ip_address,
            user_agent=user_agent,
            webhook_event_id=webhook_event_id,
            webhook_event_type=webhook_event_type,
            payload_hash=payload_hash
        )
