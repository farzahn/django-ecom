from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import stripe_views
from . import shipping_views

router = DefaultRouter(trailing_slash=False)
router.register(r'products', views.ProductViewSet)
router.register(r'customers', views.CustomerViewSet)
router.register(r'orders', views.OrderViewSet)
router.register(r'shipping-addresses', views.ShippingAddressViewSet)

urlpatterns = [
    # Root API info
    path('', views.api_info, name='api_info'),
    
    # API routes
    path('api/', include(router.urls)),
    
    # Authentication
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/profile/', views.user_profile, name='profile'),
    
    # Profile endpoints (accessible via router as well)
    # /api/customers/{id}/upload_avatar/
    # /api/customers/{id}/delete_avatar/
    # /api/customers/{id}/notification_preferences/
    # /api/customers/{id}/activity_log/
    # /api/customers/{id}/stats/
    
    # Dashboard
    path('api/dashboard/', views.dashboard_stats, name='dashboard_stats'),
    
    # Cart
    path('api/cart/', views.cart_view, name='cart'),
    path('api/cart/add/', views.add_to_cart, name='add_to_cart'),
    path('api/cart/update/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('api/cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('api/cart/clear/', views.clear_cart, name='clear_cart'),
    
    # Stripe/Payment
    path('api/checkout/', stripe_views.create_checkout_session, name='create_checkout_session'),
    path('api/stripe-webhook/', stripe_views.stripe_webhook, name='stripe_webhook'),
    path('api/order-success/', stripe_views.order_success, name='order_success'),
    
    # Shipping
    path('api/shipping-rates/', shipping_views.get_shipping_rates, name='get_shipping_rates'),
    path('api/shipping-label/', shipping_views.create_shipping_label, name='create_shipping_label'),
    path('api/track/<str:tracking_number>/', shipping_views.track_shipment, name='track_shipment'),
]