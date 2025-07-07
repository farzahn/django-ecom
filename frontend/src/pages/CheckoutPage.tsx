import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore, useNotificationStore } from '../store/useStore';
import { shippingAPI, paymentAPI, handleApiError } from '../services/api';
import { ShippingAddress, ShippingRate } from '../types';
import AddressAutocomplete, { AddressData } from '../components/AddressAutocomplete/AddressAutocomplete';

interface CheckoutStep {
  step: 'shipping' | 'payment' | 'review';
}

const CheckoutPage: React.FC = () => {
  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep['step']>('shipping');
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
  
  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    is_default: false,
  });

  const loadAddresses = useCallback(async () => {
    try {
      const response = await shippingAPI.getAddresses();
      // Handle paginated response structure
      const addressesData = response.data.results || response.data;
      
      // Ensure we have an array
      if (Array.isArray(addressesData)) {
        setAddresses(addressesData);
        
        // Auto-select default address
        const defaultAddress = addressesData.find((addr: ShippingAddress) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        console.error('Invalid addresses data structure:', addressesData);
        setAddresses([]);
        addNotification('error', 'Invalid address data received');
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      setAddresses([]);
      addNotification('error', 'Failed to load saved addresses');
    }
  }, [addNotification]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    
    fetchCart();
    loadAddresses();
  }, [isAuthenticated, navigate, fetchCart, loadAddresses]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await shippingAPI.createAddress(newAddress);
      setAddresses(prev => [...prev, response.data]);
      setSelectedAddressId(response.data.id);
      setShowAddressForm(false);
      setNewAddress({
        full_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        is_default: false,
      });
      addNotification('success', 'Shipping address saved successfully');
    } catch (error: any) {
      const errorInfo = handleApiError(error);
      const errorMessage = error.response?.data?.detail || errorInfo.message || 'Failed to save address';
      setError(errorMessage);
      addNotification('error', 'Failed to save shipping address');
    } finally {
      setIsLoading(false);
    }
  };

  const getShippingRates = async () => {
    if (!selectedAddressId) return;
    
    setIsLoadingShipping(true);
    setShippingError('');
    setShippingRates([]);
    setSelectedShippingRate(null);
    
    try {
      const response = await shippingAPI.getShippingRates(selectedAddressId);
      const rates = response.data.rates || [];
      
      if (rates.length === 0) {
        const errorMsg = 'No shipping options available for this address. Please try a different address.';
        setShippingError(errorMsg);
        addNotification('warning', errorMsg);
        return;
      }
      
      setShippingRates(rates);
      
      // Auto-select cheapest rate
      setSelectedShippingRate(rates[0]);
    } catch (error: any) {
      console.error('Shipping rates error:', error);
      
      const errorInfo = handleApiError(error);
      let errorMessage = errorInfo.message;
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid shipping address. Please verify your address details.';
      } else if (errorInfo.type === 'server') {
        errorMessage = 'Shipping service temporarily unavailable. Please try again in a few minutes.';
      } else if (errorInfo.type === 'network') {
        errorMessage = 'Unable to connect to shipping service. Please check your connection and try again.';
      }
      
      setShippingError(errorMessage);
      addNotification('error', 'Failed to calculate shipping rates');
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address');
      return;
    }
    
    getShippingRates();
    setCurrentStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setPaymentError('Please select a shipping address');
      return;
    }
    
    if (!selectedShippingRate) {
      setPaymentError('Please select a shipping option');
      return;
    }
    
    setIsProcessingPayment(true);
    setPaymentError('');
    
    try {
      // Prepare shipping rate data for backend
      const shippingRateData = selectedShippingRate ? {
        shipping_rate_id: selectedShippingRate.id,
        shipping_carrier: selectedShippingRate.carrier,
        shipping_service: selectedShippingRate.service,
        shipping_cost: parseFloat(selectedShippingRate.amount),
        shipping_estimated_days: selectedShippingRate.estimated_days
      } : undefined;
      
      const response = await paymentAPI.createCheckoutSession(selectedAddressId, shippingRateData);
      
      // Validate response
      if (!response.data.checkout_url) {
        throw new Error('Invalid checkout session response');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      
      const errorInfo = handleApiError(error);
      let errorMessage = errorInfo.message;
      
      if (error.response?.status === 400) {
        const responseError = error.response?.data?.error;
        if (responseError?.includes('stock')) {
          errorMessage = 'Some items in your cart are no longer available. Please review your cart and try again.';
        } else if (responseError?.includes('cart')) {
          errorMessage = 'Your cart is empty. Please add items before checking out.';
        } else {
          errorMessage = responseError || 'Invalid checkout request. Please verify your information.';
        }
      } else if (errorInfo.type === 'server') {
        errorMessage = 'Payment service temporarily unavailable. Please try again in a few minutes.';
      } else if (errorInfo.type === 'network') {
        errorMessage = 'Unable to connect to payment service. Please check your connection and try again.';
      }
      
      setPaymentError(errorMessage);
      addNotification('error', 'Failed to process payment');
      
      setIsProcessingPayment(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <button onClick={() => navigate('/products')} className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
          <div className="flex gap-4 md:gap-8">
            <div className={`py-2 px-3 md:px-4 rounded-md font-semibold text-sm md:text-base ${currentStep === 'shipping' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              1. Shipping
            </div>
            <div className={`py-2 px-3 md:px-4 rounded-md font-semibold text-sm md:text-base ${currentStep === 'payment' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              2. Payment
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg p-8 shadow-sm">
            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <div className="shipping-section">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Shipping Information</h2>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 border border-red-200 flex items-start space-x-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="flex flex-col gap-4 mb-8">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary ${selectedAddressId === address.id ? 'border-primary bg-primary-light' : 'border-gray-200'}`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg mb-2">{address.full_name}</h3>
                        <p className="text-gray-600 leading-relaxed my-1">{address.address_line_1}</p>
                        {address.address_line_2 && <p className="text-gray-600 leading-relaxed my-1">{address.address_line_2}</p>}
                        <p className="text-gray-600 leading-relaxed my-1">{address.city}, {address.state} {address.postal_code}</p>
                        <p className="text-gray-600 leading-relaxed my-1">{address.country}</p>
                        {address.is_default && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">Default</span>}
                      </div>
                      <input
                        type="radio"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="border-2 border-dashed border-gray-300 bg-transparent p-4 rounded-lg text-primary cursor-pointer font-semibold transition-all duration-200 hover:border-primary hover:bg-primary-light"
                  >
                    + Add New Address
                  </button>
                </div>

                {showAddressForm && (
                  <div className="mt-4">
                    <AddressAutocomplete
                      address={newAddress as AddressData}
                      onChange={(updatedAddress) => setNewAddress(updatedAddress as any)}
                      onSubmit={handleAddressSubmit}
                      onCancel={() => setShowAddressForm(false)}
                      isLoading={isLoading}
                      title="Add New Address"
                      submitLabel="Save Address"
                    />
                  </div>
                )}

                <div className="flex gap-4 justify-end pt-8 border-t-2 border-gray-200">
                  <button
                    onClick={handleContinueToPayment}
                    disabled={!selectedAddressId || isLoadingShipping}
                    className="bg-primary text-white py-4 px-8 rounded-md font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoadingShipping && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {isLoadingShipping ? 'Loading...' : 'Continue to Payment'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="payment-section">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Payment & Review</h2>
                
                {paymentError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 border border-red-200 flex items-start space-x-2">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>{paymentError}</span>
                  </div>
                )}
                
                {shippingError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 border border-red-200">
                    <div className="flex items-start space-x-2 mb-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>{shippingError}</span>
                    </div>
                    <button
                      onClick={getShippingRates}
                      disabled={isLoadingShipping}
                      className="text-sm bg-red-600 text-white px-3 py-1 rounded font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Try Again
                    </button>
                  </div>
                )}
                
                {isLoadingShipping && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="text-gray-600">Calculating shipping rates...</span>
                    </div>
                  </div>
                )}
                
                {shippingRates.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Options</h3>
                    {shippingRates.map((rate) => (
                      <div
                        key={rate.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 hover:border-primary ${selectedShippingRate?.id === rate.id ? 'border-primary bg-primary-light' : 'border-gray-200'}`}
                        onClick={() => setSelectedShippingRate(rate)}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-base mb-1">{rate.carrier} - {rate.service}</h4>
                          <p className="text-gray-600 text-sm">${rate.amount} ({rate.estimated_days} days)</p>
                        </div>
                        <input
                          type="radio"
                          checked={selectedShippingRate?.id === rate.id}
                          onChange={() => setSelectedShippingRate(rate)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment</h3>
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.818-4.954A9.955 9.955 0 0121 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2a9.955 9.955 0 015.818 2.046" />
                    </svg>
                    <div>
                      <p className="text-gray-600 mb-2">You will be redirected to Stripe to complete your payment securely.</p>
                      <p className="text-sm text-gray-500">Your payment information is encrypted and secure. We never store your card details.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="bg-transparent border border-gray-600 text-gray-600 py-4 px-8 rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-600 hover:text-white"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessingPayment || isLoadingShipping || !selectedShippingRate}
                    className="bg-primary text-white py-4 px-8 rounded-md font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isProcessingPayment && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    )}
                    <span>
                      {isProcessingPayment ? 'Processing Payment...' : 'Place Order'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="sticky top-8 h-fit">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="mb-6 pb-6 border-b border-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-4 last:mb-0">
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-gray-800 mb-1 leading-tight">{item.product.name}</span>
                      <span className="text-sm text-gray-600">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-red-600">${item.total_price}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>${cart.total_price}</span>
                </div>
                {selectedShippingRate && (
                  <div className="flex justify-between items-center">
                    <span>Shipping:</span>
                    <span>${selectedShippingRate.amount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg pt-3 border-t-2 border-gray-800">
                  <span>Total:</span>
                  <span>
                    ${selectedShippingRate 
                      ? (parseFloat(cart.total_price) + parseFloat(selectedShippingRate.amount)).toFixed(2)
                      : cart.total_price
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;