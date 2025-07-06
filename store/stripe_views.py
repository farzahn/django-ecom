import stripe
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
from .models import Customer, Order, OrderItem, ShippingAddress, Cart
from .serializers import CheckoutSerializer
from .views import get_or_create_cart

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
        
        # Create line items for Stripe
        line_items = []
        for item in cart.items.all():
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': item.product.name,
                        'description': item.product.description[:500],
                    },
                    'unit_amount': int(item.product.price * 100),  # Convert to cents
                },
                'quantity': item.quantity,
            })
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=request.build_absolute_uri('/success/') + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.build_absolute_uri('/cancel/'),
            metadata={
                'customer_id': customer.id,
                'shipping_address_id': shipping_address.id,
            }
        )
        
        return Response({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return HttpResponse(status=400)

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        try:
            with transaction.atomic():
                # Get customer and shipping address from metadata
                customer_id = session['metadata']['customer_id']
                shipping_address_id = session['metadata']['shipping_address_id']
                
                customer = Customer.objects.get(id=customer_id)
                shipping_address = ShippingAddress.objects.get(id=shipping_address_id)
                
                # Get the cart
                cart = Cart.objects.get(customer=customer)
                
                # Calculate total
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
                for cart_item in cart.items.all():
                    # Check stock again
                    product = cart_item.product
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
                        # If stock is insufficient, cancel the order
                        order.status = 'cancelled'
                        order.save()
                        break
                
                # Clear the cart
                cart.items.all().delete()
                
        except Exception as e:
            # Log the error in production
            print(f"Webhook error: {str(e)}")
            return HttpResponse(status=500)

    return HttpResponse(status=200)


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