import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store/useStore';
import { getProductImageUrl } from '../utils/imageUtils';

const CartPage: React.FC = () => {
  const { cart, isLoading, fetchCart, updateCartItem, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityUpdate = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update cart item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await removeFromCart(itemId);
      } catch (error) {
        console.error('Failed to remove cart item:', error);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="text-center py-16 text-gray-600 text-xl">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <div className="text-center py-16 px-8 bg-white rounded-xl shadow-md">
            <h1 className="text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <h1 className="text-gray-800 m-0">Shopping Cart</h1>
          <button onClick={handleClearCart} className="bg-accent text-white border-0 px-4 py-2 rounded-md cursor-pointer font-medium transition-colors duration-200 hover:bg-accent-hover">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm grid grid-cols-[100px_1fr_auto_auto_auto] lg:grid-cols-[100px_1fr_auto_auto_auto] md:grid-cols-[80px_1fr] gap-4 items-center">
                <div className="w-[100px] h-[100px] md:w-20 md:h-20 rounded-md overflow-hidden bg-gray-200 md:row-span-3">
                  {item.product.primary_image ? (
                    <img src={getProductImageUrl(item.product)} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Image</div>
                  )}
                </div>
                
                <div className="min-w-0 md:col-span-1">
                  <Link to={`/products/${item.product.slug}`} className="no-underline text-inherit">
                    <h3 className="text-gray-800 m-0 mb-2 text-xl leading-tight hover:text-primary">{item.product.name}</h3>
                  </Link>
                  <p className="text-accent font-semibold my-1 text-base">${item.product.price} each</p>
                  <p className="text-gray-600 text-sm m-0">
                    {item.product.stock_quantity > 0 
                      ? `${item.product.stock_quantity} in stock` 
                      : 'Out of stock'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between md:w-full md:col-span-1">
                  <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-600 font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                      className="w-8 h-8 border border-gray-300 bg-white rounded cursor-pointer font-bold flex items-center justify-center transition-all duration-200 hover:bg-gray-50 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id={`quantity-${item.id}`}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        if (newQuantity !== item.quantity) {
                          handleQuantityUpdate(item.id, newQuantity);
                        }
                      }}
                      min="1"
                      max={item.product.stock_quantity}
                      className="w-16 h-8 text-center border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                      disabled={updatingItems.has(item.id)}
                    />
                    <button
                      onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity || updatingItems.has(item.id)}
                      className="w-8 h-8 border border-gray-300 bg-white rounded cursor-pointer font-bold flex items-center justify-center transition-all duration-200 hover:bg-gray-50 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="text-center md:text-left md:col-span-1">
                  <p className="text-xl font-bold text-gray-800 m-0">${item.total_price}</p>
                </div>
                
                <div className="flex justify-center md:justify-start md:col-span-1">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="bg-transparent border border-accent text-accent px-4 py-2 rounded cursor-pointer text-sm transition-all duration-200 hover:bg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updatingItems.has(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="sticky top-8 h-fit">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-gray-800 m-0 mb-6 text-xl">Order Summary</h2>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span>Items ({cart.total_items}):</span>
                <span>${cart.total_price}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span>Shipping:</span>
                <span>Calculated at checkout</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b-2 border-gray-800 font-bold text-lg mt-2">
                <span>Subtotal:</span>
                <span>${cart.total_price}</span>
              </div>
              
              <div className="mt-6">
                {!isAuthenticated && (
                  <p className="text-gray-600 text-sm text-center mb-4">
                    Please <Link to="/login" className="text-primary no-underline font-semibold hover:underline">sign in</Link> to proceed with checkout
                  </p>
                )}
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-white border-0 px-4 py-4 rounded-md text-base font-semibold cursor-pointer transition-colors duration-200 mb-4 hover:bg-primary-hover"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign In & Checkout'}
                </button>
                
                <Link to="/products" className="block text-center text-primary no-underline font-medium py-2 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;