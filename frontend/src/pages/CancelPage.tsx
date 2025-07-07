import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/useStore';

const CancelPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Show notification that payment was cancelled
    addNotification('info', 'Payment cancelled. Your cart items are still saved.');
  }, [addNotification]);

  const handleReturnToCart = () => {
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Payment Cancelled
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Your payment was cancelled and no charges were made. Your cart items are still saved and ready for checkout.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleReturnToCart}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Return to Cart
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@pasargadprints.com" className="text-primary hover:underline">
                support@pasargadprints.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;