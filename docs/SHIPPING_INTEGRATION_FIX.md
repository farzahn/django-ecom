# Shipping Integration Fix: GoShippo vs Stripe Shipping Options

## Issue Description

Users were seeing **Stripe's built-in shipping options** instead of the **GoShippo shipping rates** during checkout. This happened because Stripe Checkout can display its own shipping options when certain configurations are enabled, overriding our custom GoShippo integration.

## Root Cause

The issue occurred because:

1. **Stripe Dashboard Settings**: If `shipping_address_collection` or `automatic_tax` are enabled in the Stripe Dashboard or API calls, Stripe will show its own shipping options.

2. **Missing Explicit Configuration**: Our Stripe checkout session wasn't explicitly disabling Stripe's built-in shipping features.

3. **Conflicting Shipping Sources**: Both GoShippo (as line items) and Stripe (as built-in options) were potentially being presented to users.

## Solution Implemented

### 1. Explicitly Disable Stripe Shipping Features

In `store/stripe_views.py`, we now explicitly disable Stripe's built-in shipping:

```python
session_params = {
    'payment_method_types': ['card'],
    'line_items': line_items,
    'mode': 'payment',
    'success_url': success_url,
    'cancel_url': cancel_url,
    # Disable Stripe's automatic shipping options to use our GoShippo rates
    'shipping_address_collection': None,  # Explicitly disable
    'shipping_options': [],  # Empty to prevent Stripe shipping options
    'automatic_tax': {'enabled': False},  # Disable automatic tax and shipping
    'metadata': {
        'shipping_integration': 'goshippo',  # Mark as using GoShippo
        # ... other metadata
    }
}
```

### 2. Enhanced GoShippo Line Item Metadata

We added clear metadata to shipping line items to identify them as GoShippo-sourced:

```python
'metadata': {
    'type': 'shipping',
    'source': 'goshippo',  # Mark as GoShippo sourced
    'rate_id': shipping_rate_id or '',
    'carrier': shipping_carrier or '',
    'service': shipping_service or '',
    'estimated_days': str(shipping_estimated_days) if shipping_estimated_days else ''
}
```

### 3. Added Validation and Logging

Added validation to warn if Stripe shipping is accidentally enabled:

```python
# Validate that we're not accidentally enabling Stripe shipping
if 'shipping_address_collection' in session_params and session_params['shipping_address_collection']:
    logging.getLogger(__name__).warning("Stripe shipping address collection is enabled - this may override GoShippo rates")
```

## How It Works Now

### Complete Flow:

1. **Frontend**: User selects shipping address
2. **GoShippo API**: Backend calls GoShippo to get real shipping rates
3. **Frontend**: User sees GoShippo rates (USPS, UPS, etc.) and selects one
4. **Stripe Checkout**: Backend creates checkout session with:
   - GoShippo shipping as a **line item** (not Stripe shipping option)
   - Stripe's built-in shipping **explicitly disabled**
   - Clear metadata indicating GoShippo integration

### User Experience:

- ✅ **Before Fix**: Users saw Stripe's generic shipping options
- ✅ **After Fix**: Users see actual GoShippo rates (USPS Priority Mail, UPS Ground, etc.)
- ✅ **Pricing**: Exact shipping costs from GoShippo carriers
- ✅ **Tracking**: Proper carrier and service level information

## Testing

Comprehensive tests in `store/tests/test_shipping_integration_fix.py` verify:

- ✅ Stripe checkout disables built-in shipping options
- ✅ GoShippo rates appear as line items in Stripe
- ✅ Complete integration flow from GoShippo API to Stripe checkout
- ✅ Proper metadata and carrier information preservation

## Benefits

1. **Accurate Shipping Costs**: Users see real carrier rates instead of Stripe estimates
2. **Better Carrier Selection**: Users can choose between USPS, UPS, FedEx based on GoShippo rates
3. **Proper Integration**: Clear separation between payment processing (Stripe) and shipping calculation (GoShippo)
4. **Tracking Support**: Maintains carrier and tracking information for order fulfillment

## Configuration Notes

### Stripe Dashboard
- Ensure `shipping_address_collection` is **disabled** in Stripe Dashboard
- Ensure `automatic_tax` is **disabled** (or configure appropriately)
- Do not configure shipping options in Stripe Dashboard

### GoShippo Integration
- Shipping rates are calculated server-side via GoShippo API
- Fallback to mock data when GoShippo API is unavailable
- Shipping appears as line items in Stripe checkout

This fix ensures that users always see accurate, real-time shipping rates from major carriers via GoShippo, while keeping the secure payment processing through Stripe.