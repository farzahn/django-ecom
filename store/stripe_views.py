import stripe
import logging
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Customer, Order, OrderItem, ShippingAddress, Cart, WebhookEvent, WebhookSecurityLog
from .serializers import CheckoutSerializer
from .views import get_or_create_cart
from .webhook_security import webhook_security_manager, WebhookSecurityError

# Configure Stripe API key
if hasattr(settings, 'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        customer = get_object_or_404(Customer, user=request.user)
        
        # Get cart
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        cart = get_or_create_cart(request.user, session_key)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate checkout data
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        shipping_address = get_object_or_404(
            ShippingAddress, 
            id=serializer.validated_data['shipping_address_id'],
            customer=customer
        )
        
        # Check stock availability
        for item in cart.items.all():
            if item.product.stock_quantity < item.quantity:
                return Response({
                    'error': f'Not enough stock for {item.product.name}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enhanced line items for Stripe (2025 best practices)
        line_items = []
        for item in cart.items.all():
            # Enhanced product data with additional metadata
            product_data = {
                'name': item.product.name,
                'description': item.product.description[:500],
                'metadata': {
                    'product_id': str(item.product.id),
                    'product_slug': item.product.slug,
                    'weight': str(item.product.weight),
                    'dimensions': f"{item.product.length}x{item.product.width}x{item.product.height}"
                }
            }
            
            # Add product images if available
            if item.product.images.exists():
                product_data['images'] = [item.product.images.first().image.url]
            
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': product_data,
                    'unit_amount': int(item.product.price * 100),  # Convert to cents
                    'tax_behavior': 'exclusive',  # 2025 best practice for tax handling
                },
                'quantity': item.quantity,
            })
        
        # Create Stripe customer for better experience and data management
        stripe_customer = None
        try:
            if customer.stripe_customer_id:
                stripe_customer = stripe.Customer.retrieve(customer.stripe_customer_id)
            else:
                stripe_customer = stripe.Customer.create(
                    email=customer.user.email,
                    name=f"{customer.user.first_name} {customer.user.last_name}".strip(),
                    metadata={
                        'customer_id': str(customer.id),
                        'username': customer.user.username
                    }
                )
                customer.stripe_customer_id = stripe_customer.id
                customer.save()
        except Exception as e:
            logging.getLogger(__name__).warning(f"Failed to create/retrieve Stripe customer: {e}")
        
        # Enhanced checkout session with 2025 best practices
        session_params = {
            'payment_method_types': ['card'],
            'line_items': line_items,
            'mode': 'payment',
            'success_url': 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url': 'http://localhost:3000/cancel',
            'metadata': {
                'customer_id': str(customer.id),
                'shipping_address_id': str(shipping_address.id),
                'cart_total': str(cart.total_price),
                'order_type': '3d_print_products',
                'source': 'web_checkout'
            },
            'shipping_address_collection': {
                'allowed_countries': ['US', 'CA'],  # Configurable based on business needs
            },
            'shipping_options': [
                {
                    'shipping_rate_data': {
                        'type': 'fixed_amount',
                        'fixed_amount': {
                            'amount': 999,  # $9.99 standard shipping
                            'currency': 'usd',
                        },
                        'display_name': 'Standard Shipping',
                        'delivery_estimate': {
                            'minimum': {
                                'unit': 'business_day',
                                'value': 5,
                            },
                            'maximum': {
                                'unit': 'business_day',
                                'value': 7,
                            },
                        },
                    },
                },
                {
                    'shipping_rate_data': {
                        'type': 'fixed_amount',
                        'fixed_amount': {
                            'amount': 1999,  # $19.99 express shipping
                            'currency': 'usd',
                        },
                        'display_name': 'Express Shipping',
                        'delivery_estimate': {
                            'minimum': {
                                'unit': 'business_day',
                                'value': 1,
                            },
                            'maximum': {
                                'unit': 'business_day',
                                'value': 3,
                            },
                        },
                    },
                },
            ],
            'phone_number_collection': {
                'enabled': True
            },
            'custom_text': {
                'shipping_address': {
                    'message': 'Please provide accurate shipping information for your 3D printed items.'
                },
                'submit': {
                    'message': 'We\'ll email you instructions on how to track your order.'
                }
            },
            'invoice_creation': {
                'enabled': True,
                'invoice_data': {
                    'description': f'PasargadPrints Order - {cart.total_items} items',
                    'metadata': {
                        'customer_id': str(customer.id),
                        'order_date': cart.created_at.isoformat()
                    },
                    'footer': 'Thank you for your business with PasargadPrints!'
                }
            },
            'consent_collection': {
                'terms_of_service': 'required'
            }
        }
        
        # Add customer if available
        if stripe_customer:
            session_params['customer'] = stripe_customer.id
        else:
            session_params['customer_email'] = customer.user.email
        
        # Create the enhanced checkout session
        checkout_session = stripe.checkout.Session.create(**session_params)
        
        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Enhanced secure webhook handler with comprehensive security features:
    - Signature verification with detailed logging
    - Idempotency handling to prevent duplicate processing
    - Comprehensive error handling without sensitive data exposure
    - Complete audit trail for all webhook events
    """
    logger = logging.getLogger(__name__)
    webhook_event = None
    
    try:
        # Step 1: Secure webhook processing with comprehensive validation
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        if not endpoint_secret:
            logger.error("Stripe webhook secret not configured")
            return HttpResponse("Webhook secret not configured", status=500)
        
        # Process webhook with enhanced security
        event_data, webhook_event = webhook_security_manager.process_webhook_securely(
            request, endpoint_secret
        )
        
        # Step 2: Mark webhook as being processed
        webhook_event.mark_as_processing()
        
        # Step 3: Handle specific event types
        if event_data['type'] == 'checkout.session.completed':
            order = _process_checkout_session_completed(event_data, webhook_event)
            if order:
                webhook_event.mark_as_processed(related_order=order, related_customer=order.customer)
            else:
                webhook_event.mark_as_failed("Order creation failed")
                return HttpResponse("Order processing failed", status=500)
        
        elif event_data['type'] == 'payment_intent.succeeded':
            # Handle payment intent succeeded (for future use)
            webhook_event.mark_as_processed()
        
        elif event_data['type'] == 'payment_intent.payment_failed':
            # Handle payment failure (for future use)
            webhook_event.mark_as_processed()
        
        else:
            # Mark as processed for unsupported event types
            webhook_event.mark_as_processed()
            logger.info(f"Unsupported webhook event type: {event_data['type']}")
        
        return HttpResponse(status=200)
        
    except WebhookSecurityError as e:
        # Security-related errors are already logged by the security manager
        sanitized_error = webhook_security_manager.sanitize_error_message(str(e))
        logger.warning(f"Webhook security error: {sanitized_error}")
        
        if webhook_event:
            webhook_event.mark_as_failed(sanitized_error)
        
        # Return appropriate HTTP status based on error type
        if e.error_code in ['signature_invalid', 'payload_too_large']:
            return HttpResponse("Invalid request", status=400)
        elif e.error_code == 'duplicate_event':
            return HttpResponse("Duplicate event", status=200)  # Success for duplicates
        else:
            return HttpResponse("Processing error", status=500)
    
    except Exception as e:
        # Catch-all for unexpected errors
        sanitized_error = webhook_security_manager.sanitize_error_message(str(e))
        logger.error(f"Unexpected webhook error: {sanitized_error}")
        
        if webhook_event:
            webhook_event.mark_as_failed(sanitized_error)
        
        # Log security event for unexpected errors
        request_info = webhook_security_manager.extract_request_info(request)
        WebhookSecurityLog.log_security_event(
            event_type='processing_error',
            severity='high',
            ip_address=request_info.get('ip_address'),
            user_agent=request_info.get('user_agent'),
            error_message=sanitized_error,
            metadata={'exception_type': type(e).__name__}
        )
        
        return HttpResponse("Internal server error", status=500)


def _process_checkout_session_completed(event_data, webhook_event):
    """
    Process checkout.session.completed event with atomic transaction
    Returns the created Order or None on failure
    """
    logger = logging.getLogger(__name__)
    session = event_data['data']['object']
    
    try:
        with transaction.atomic():
            # Extract metadata
            metadata = session.get('metadata', {})
            customer_id = metadata.get('customer_id')
            shipping_address_id = metadata.get('shipping_address_id')
            
            if not customer_id or not shipping_address_id:
                logger.error(f"Missing metadata in checkout session: {session['id']}")
                return None
            
            # Get customer and shipping address
            try:
                customer = Customer.objects.get(id=customer_id)
                shipping_address = ShippingAddress.objects.get(id=shipping_address_id, customer=customer)
            except (Customer.DoesNotExist, ShippingAddress.DoesNotExist) as e:
                logger.error(f"Customer or shipping address not found: {str(e)}")
                return None
            
            # Get the cart
            try:
                cart = Cart.objects.get(customer=customer)
            except Cart.DoesNotExist:
                logger.error(f"Cart not found for customer {customer_id}")
                return None
            
            if not cart.items.exists():
                logger.error(f"Empty cart for customer {customer_id}")
                return None
            
            # Calculate total amount
            total_amount = sum(item.total_price for item in cart.items.all())
            
            # Create order
            order = Order.objects.create(
                customer=customer,
                total_price=total_amount,
                shipping_address=shipping_address,
                stripe_checkout_session_id=session['id'],
                stripe_payment_intent_id=session.get('payment_intent', ''),
                status='processing'
            )
            
            # Create order items and update stock
            insufficient_stock_items = []
            for cart_item in cart.items.all():
                product = cart_item.product
                
                # Check stock availability
                if product.stock_quantity >= cart_item.quantity:
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=cart_item.quantity,
                        price=product.price
                    )
                    
                    # Update stock
                    product.stock_quantity -= cart_item.quantity
                    product.save()
                else:
                    insufficient_stock_items.append(f"{product.name} (requested: {cart_item.quantity}, available: {product.stock_quantity})")
            
            # Handle insufficient stock
            if insufficient_stock_items:
                order.status = 'cancelled'
                order.save()
                logger.warning(f"Order {order.order_id} cancelled due to insufficient stock: {', '.join(insufficient_stock_items)}")
                
                # Don't clear the cart for cancelled orders
                return order
            
            # Clear the cart only if order was successful
            cart.items.all().delete()
            
            # Update customer statistics
            customer.update_activity_stats()
            
            logger.info(f"Successfully processed order {order.order_id} for customer {customer_id}")
            return order
            
    except Exception as e:
        logger.error(f"Error processing checkout session completed: {str(e)}")
        return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_success(request):
    session_id = request.GET.get('session_id')
    if not session_id:
        return Response({'error': 'Session ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        customer = get_object_or_404(Customer, user=request.user)
        order = Order.objects.filter(
            customer=customer,
            stripe_checkout_session_id=session_id
        ).first()
        
        if not order:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'order_id': order.order_id,
            'status': order.status,
            'total_price': order.total_price,
            'message': 'Payment successful! Your order has been created.'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)