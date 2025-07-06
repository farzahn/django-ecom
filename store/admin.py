from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Product, ProductImage, Customer, Order, OrderItem, ShippingAddress, Cart, CartItem


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "No image"
    image_preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock_quantity', 'is_active', 'created_at', 'primary_image_preview']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'price', 'stock_quantity', 'is_active')
        }),
        ('Dimensions & Weight', {
            'fields': ('length', 'width', 'height', 'weight')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def primary_image_preview(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image and primary_image.image:
            return format_html('<img src="{}" width="50" height="50" />', primary_image.image.url)
        return "No image"
    primary_image_preview.short_description = "Image"


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'get_email', 'phone', 'created_at', 'total_orders']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = "Full Name"
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = "Email"
    
    def total_orders(self, obj):
        return obj.orders.count()
    total_orders.short_description = "Total Orders"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price', 'total_price']
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'status', 'total_price', 'order_date', 'view_items']
    list_filter = ['status', 'order_date']
    search_fields = ['order_id', 'customer__user__username', 'customer__user__email']
    readonly_fields = ['order_id', 'order_date', 'created_at', 'updated_at', 'stripe_checkout_session_id', 'stripe_payment_intent_id']
    inlines = [OrderItemInline]
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_id', 'customer', 'status', 'order_date')
        }),
        ('Payment Information', {
            'fields': ('total_price', 'stripe_checkout_session_id', 'stripe_payment_intent_id')
        }),
        ('Shipping Information', {
            'fields': ('shipping_address', 'shipping_cost', 'shipping_method', 'tracking_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def view_items(self, obj):
        count = obj.items.count()
        url = reverse('admin:store_orderitem_changelist')
        return format_html('<a href="{}?order__id__exact={}">{} items</a>', url, obj.id, count)
    view_items.short_description = "Items"
    
    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_as_processing.short_description = "Mark selected orders as processing"
    
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Mark selected orders as shipped"
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = "Mark selected orders as delivered"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price', 'total_price']
    list_filter = ['order__status', 'order__order_date']
    search_fields = ['order__order_id', 'product__name']
    readonly_fields = ['total_price']


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'customer', 'city', 'state', 'country', 'is_default']
    list_filter = ['country', 'state', 'is_default']
    search_fields = ['full_name', 'customer__user__username', 'city']


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'total_price']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'total_items', 'total_price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['customer__user__username', 'session_key']
    readonly_fields = ['total_items', 'total_price', 'created_at', 'updated_at']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'total_price']
    list_filter = ['created_at']
    search_fields = ['cart__customer__user__username', 'product__name']
    readonly_fields = ['total_price']


# Customize admin site
admin.site.site_header = "Pasargad Prints Admin"
admin.site.site_title = "Pasargad Prints Admin Portal"
admin.site.index_title = "Welcome to Pasargad Prints Administration"
