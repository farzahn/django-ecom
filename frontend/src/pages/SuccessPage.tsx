import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore, useOrderStore, useNotificationStore } from '../store/useStore';
import { paymentAPI, handleApiError } from '../services/api';
import { Order } from '../types';

interface OrderSuccessResponse {
  order_id: string;
  status: string;
  total_price: string;
  message: string;
  order?: Order;
}

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { clearCart } = useCartStore();
  const { setCurrentOrder } = useOrderStore();
  const { addNotification } = useNotificationStore();
  
  const [orderData, setOrderData] = useState<OrderSuccessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessedOrder, setHasProcessedOrder] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login?message=Please login to view your order confirmation');
      return;
    }

    // Extract session_id from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    
    if (!sessionId) {
      setError('Invalid payment session. Please contact support if you completed a payment.');
      setIsLoading(false);
      return;
    }

    // Fetch order success data
    const fetchOrderData = async () => {
      try {
        setIsLoading(true);
        const response = await paymentAPI.getOrderSuccess(sessionId);
        setOrderData(response.data);
        
        // Store order in global state if available
        if (response.data.order) {
          setCurrentOrder(response.data.order);
        }
        
        // Clear cart after successful order
        if (!hasProcessedOrder) {
          await clearCart();
          setHasProcessedOrder(true);
          
          // Show success notification
          addNotification('success', 'Your order has been placed successfully!');
        }
      } catch (err: any) {
        console.error('Error fetching order data:', err);
        
        const errorInfo = handleApiError(err);
        
        if (err.response?.status === 404) {
          setError('Order not found. Your payment may still be processing. Please check your email for confirmation or contact support.');
        } else if (errorInfo.type === 'server') {
          setError('Server error occurred. Your payment was processed but there was an issue loading your order details. Please check your email or contact support.');
        } else if (errorInfo.type === 'network') {
          setError('Network connection issue. Your payment was likely processed. Please check your email or try refreshing the page.');
        } else {
          setError(errorInfo.message || 'Unable to load order details. Please contact support if you completed a payment.');
        }
        
        // Add error notification
        addNotification('error', 'Failed to load order confirmation details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [location, navigate, isAuthenticated, clearCart, hasProcessedOrder, setCurrentOrder, addNotification]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Your Order</h2>
            <p className="text-gray-600">Please wait while we confirm your payment and prepare your order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Status Unknown</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-sm max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Order Data</h2>
            <p className="text-gray-600 mb-6">Unable to load order information.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-primary text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 text-lg mb-4">{orderData.message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-800 font-semibold">Order ID:</span>
                <span className="text-green-900 font-bold text-lg">{orderData.order_id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status</h2>
          <div className="flex items-center space-x-3">
            {getStatusIcon(orderData.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(orderData.status)}`}>
              {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-xl text-gray-800">${orderData.total_price}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment Method:</span>
              <span className="text-gray-800">Credit Card</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Payment Date:</span>
              <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Order Confirmation</h3>
                <p className="text-gray-600 text-sm">You'll receive an email confirmation with your order details shortly.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Processing</h3>
                <p className="text-gray-600 text-sm">Your order is being prepared and will be shipped within 2-3 business days.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Shipping Updates</h3>
                <p className="text-gray-600 text-sm">We'll send you tracking information once your order ships.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => {
                addNotification('info', 'Redirecting to your orders...');
                navigate('/orders');
              }}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View Order Details</span>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;