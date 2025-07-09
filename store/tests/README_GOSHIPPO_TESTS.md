# GoShippo Integration Test Suite

## Overview

This test suite provides comprehensive coverage for the GoShippo shipping rate integration in the Django e-commerce application. The tests are designed to verify the functionality, reliability, and edge case handling of the GoShippo API integration.

## Test Files

### 1. `test_goshippo_integration.py` (Existing)
**Purpose**: Core GoShippo integration tests covering basic functionality.

**Test Cases**:
- ✅ `test_shipping_rates_calculation_success` - Basic rate calculation
- ✅ `test_shipping_rates_with_cart_calculations` - Weight/dimension calculations
- ✅ `test_shipping_rates_api_fallback` - API failure fallback
- ✅ `test_shipping_rates_empty_cart_error` - Empty cart error handling
- ✅ `test_shipping_rates_invalid_address_error` - Invalid address handling
- ✅ `test_shipping_rates_missing_address_id` - Missing address ID error
- ✅ `test_address_formatting_for_goshippo` - Address formatting
- ✅ `test_international_address_handling` - International addresses
- ✅ `test_rate_sorting_by_price` - Rate sorting by price
- ✅ `test_rate_data_transformation` - Rate data transformation

### 2. `test_goshippo_shipping_rates_enhanced.py` (New)
**Purpose**: Enhanced tests covering edge cases and advanced scenarios.

**Test Classes**:

#### `GoShippoRateAPITestCase`
- ✅ `test_goshippo_api_timeout_handling` - API timeout handling
- ✅ `test_goshippo_invalid_api_key_handling` - Invalid API key handling
- ✅ `test_goshippo_rate_limit_handling` - Rate limiting handling
- ✅ `test_goshippo_malformed_response_handling` - Malformed response handling

#### `GoShippoPackageCalculationTestCase`
- ✅ `test_zero_weight_product_handling` - Zero weight products
- ✅ `test_large_package_dimensions` - Large package handling
- ✅ `test_multiple_products_dimension_calculation` - Complex dimension calculations

#### `GoShippoAddressEdgeCasesTestCase`
- ✅ `test_address_with_special_characters` - Special characters in addresses
- ✅ `test_address_with_po_box` - P.O. Box addresses
- ✅ `test_address_with_long_fields` - Long address fields

#### `GoShippoRateValidationTestCase`
- ✅ `test_rate_with_missing_fields` - Missing rate fields
- ✅ `test_rate_with_invalid_amount` - Invalid amount values

#### `GoShippoPerformanceTestCase`
- ✅ `test_large_cart_performance` - Large cart performance
- ✅ `test_concurrent_requests_handling` - Concurrent request handling

### 3. `test_goshippo_integration_flow.py` (New)
**Purpose**: Integration tests for complete shipping flow from cart to checkout.

**Test Classes**:

#### `GoShippoCheckoutIntegrationTestCase`
- ✅ `test_complete_shipping_rate_to_checkout_flow` - Complete flow testing
- ✅ `test_shipping_rate_persistence_in_order` - Rate data persistence
- ✅ `test_shipping_rate_error_handling_in_checkout` - Checkout error handling

#### `GoShippoMultipleAddressTestCase`
- ✅ `test_different_shipping_rates_for_different_addresses` - Multi-address testing

#### `GoShippoCartModificationTestCase`
- ✅ `test_shipping_rates_change_with_cart_modification` - Cart change handling

#### `GoShippoStressTestCase`
- ✅ `test_rapid_rate_requests` - Rapid request handling
- ✅ `test_session_handling_across_requests` - Session management

## Running the Tests

### Run All GoShippo Tests
```bash
python3 manage.py test store.tests.test_goshippo_integration
python3 manage.py test store.tests.test_goshippo_shipping_rates_enhanced
python3 manage.py test store.tests.test_goshippo_integration_flow
```

### Run Specific Test Class
```bash
python3 manage.py test store.tests.test_goshippo_integration.GoShippoShippingTestCase
python3 manage.py test store.tests.test_goshippo_shipping_rates_enhanced.GoShippoRateAPITestCase
python3 manage.py test store.tests.test_goshippo_integration_flow.GoShippoCheckoutIntegrationTestCase
```

### Run Individual Test
```bash
python3 manage.py test store.tests.test_goshippo_integration.GoShippoShippingTestCase.test_shipping_rates_calculation_success -v 2
```

## Test Coverage

### Core Functionality ✅
- Basic rate fetching from GoShippo API
- Package dimension and weight calculations
- Address formatting and validation
- Rate sorting and transformation
- Error handling and fallback mechanisms

### Edge Cases ✅
- API timeouts and failures
- Invalid API keys and rate limiting
- Malformed API responses
- Zero weight products
- Large packages
- Special characters in addresses
- P.O. Box addresses
- Missing or invalid rate fields

### Integration Testing ✅
- Complete shipping rate to checkout flow
- Rate data persistence in orders
- Multi-address scenarios
- Cart modification handling
- Concurrent request handling
- Session management

### Performance Testing ✅
- Large cart handling
- Rapid consecutive requests
- Stress testing scenarios

## Mock Strategy

The tests use comprehensive mocking to simulate GoShippo API responses:

1. **Success Scenarios**: Mock successful API responses with various rate combinations
2. **Error Scenarios**: Mock API failures, timeouts, and malformed responses
3. **Edge Cases**: Mock unusual but valid API responses
4. **Performance**: Mock responses for stress testing

## Test Data

Tests use realistic test data:
- **Products**: Various sizes, weights, and quantities
- **Addresses**: Domestic and international addresses
- **Rates**: Multiple carriers (USPS, UPS, FedEx) with different service levels
- **Carts**: Single and multiple item carts with different characteristics

## Dependencies

The tests require:
- Django test framework
- Django REST Framework test client
- `unittest.mock` for API mocking
- GoShippo SDK (`shippo==3.9.0`)
- Test database setup

## Continuous Integration

These tests are designed to run in CI/CD environments:
- All external API calls are mocked
- Tests are isolated and don't depend on external services
- Tests use in-memory database for speed
- Comprehensive error handling prevents test failures

## Future Enhancements

Potential areas for additional testing:
- Webhook handling for shipping events
- Label generation testing
- Tracking functionality testing
- Multi-currency support
- International shipping regulations
- Shipping insurance calculations

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: All external API calls are mocked for reliability
3. **Realistic Data**: Tests use realistic product and address data
4. **Error Handling**: Tests verify proper error handling and fallbacks
5. **Performance**: Tests include performance and stress testing
6. **Documentation**: Tests include clear descriptions and expected outcomes
7. **Maintainability**: Tests are well-structured and easy to modify

## Troubleshooting

If tests fail:
1. Check that all required Django apps are installed
2. Verify database migrations are up to date
3. Ensure GoShippo SDK is properly installed
4. Check that mock objects match the actual API structure
5. Verify authentication tokens are correctly configured for test users

## Contributing

When adding new GoShippo functionality:
1. Add corresponding tests in the appropriate test file
2. Use proper mocking for external API calls
3. Include both success and failure scenarios
4. Test edge cases and error conditions
5. Update this documentation with new test cases