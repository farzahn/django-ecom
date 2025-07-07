import axios from 'axios';
import { 
  ShippingAddress, 
  Customer,
  BulkOperationRequest,
  NotificationPreferences,
  ProfileUpdateData
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors and CORS issues
    if (!error.response) {
      // Check if it's a CORS-related error
      if (error.message && error.message.includes('CORS')) {
        console.error('CORS error:', error.message);
        return Promise.reject({
          ...error,
          isCorsError: true,
          message: 'Cross-origin request blocked. Please refresh the page and try again.'
        });
      }
      
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network connection failed. Please check your internet connection.'
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?message=Your session has expired. Please log in again.';
      }
    }

    // Handle server errors with user-friendly messages
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject({
        ...error,
        isServerError: true,
        message: 'Our servers are experiencing issues. Please try again in a few minutes.'
      });
    }

    // Handle payment-specific errors
    if (error.response?.status === 400 && error.config?.url?.includes('/checkout/')) {
      const errorData = error.response.data;
      let userMessage = 'Unable to process your request.';
      
      if (errorData.error?.includes('stock')) {
        userMessage = 'Some items in your cart are no longer available.';
      } else if (errorData.error?.includes('cart')) {
        userMessage = 'Your cart appears to be empty. Please add items before checking out.';
      } else if (errorData.error?.includes('address')) {
        userMessage = 'Please verify your shipping address information.';
      }
      
      return Promise.reject({
        ...error,
        userMessage
      });
    }

    return Promise.reject(error);
  }
);

// Auth API with enhanced validation
export const authAPI = {
  register: (userData: any) => {
    const requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return Promise.reject(new Error(`${field.replace('_', ' ')} is required`));
      }
    }
    return api.post('/api/register/', userData);
  },
  login: (credentials: any) => {
    if (!credentials.username || !credentials.password) {
      return Promise.reject(new Error('Username and password are required'));
    }
    return api.post('/api/login/', credentials);
  },
  logout: () => api.post('/api/logout/'),
  getProfile: () => api.get('/api/profile/'),
  updateProfile: (data: ProfileUpdateData) => api.put('/api/profile/', data),
};

// Products API
export const productsAPI = {
  getProducts: (page = 1, search = '') => 
    api.get(`/api/products?page=${page}&search=${search}`),
  getProduct: (slug: string) => api.get(`/api/products/${slug}`),
};

// Cart API with enhanced validation
export const cartAPI = {
  getCart: () => api.get('/api/cart/'),
  addToCart: (productId: number, quantity: number) => {
    if (!productId || productId <= 0) {
      return Promise.reject(new Error('Valid product ID is required'));
    }
    if (!quantity || quantity <= 0) {
      return Promise.reject(new Error('Quantity must be greater than 0'));
    }
    return api.post('/api/cart/add/', { product_id: productId, quantity });
  },
  updateCartItem: (itemId: number, quantity: number) => {
    if (!itemId || itemId <= 0) {
      return Promise.reject(new Error('Valid item ID is required'));
    }
    if (!quantity || quantity <= 0) {
      return Promise.reject(new Error('Quantity must be greater than 0'));
    }
    return api.put(`/api/cart/update/${itemId}/`, { quantity });
  },
  removeFromCart: (itemId: number) => {
    if (!itemId || itemId <= 0) {
      return Promise.reject(new Error('Valid item ID is required'));
    }
    return api.delete(`/api/cart/remove/${itemId}/`);
  },
  clearCart: () => api.delete('/api/cart/clear/'),
};

// Orders API
export const ordersAPI = {
  getOrders: (page = 1, archived = false) => 
    api.get(`/api/orders/?page=${page}&archived=${archived}`),
  getOrder: (id: number) => api.get(`/api/orders/${id}/`),
  bulkOperations: (data: BulkOperationRequest) => 
    api.post('/api/orders/bulk_operations/', data),
  exportCSV: () => api.get('/api/orders/export_csv/', { responseType: 'blob' }),
};

// Shipping API with enhanced validation and error handling
export const shippingAPI = {
  getAddresses: () => api.get('/api/shipping-addresses/'),
  createAddress: (address: Partial<ShippingAddress>) => {
    // Validate required fields
    const requiredFields = ['full_name', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
    for (const field of requiredFields) {
      if (!address[field as keyof ShippingAddress]) {
        return Promise.reject(new Error(`${field.replace('_', ' ')} is required`));
      }
    }
    return api.post('/api/shipping-addresses/', address);
  },
  updateAddress: (id: number, address: Partial<ShippingAddress>) => 
    api.put(`/api/shipping-addresses/${id}/`, address),
  deleteAddress: (id: number) => api.delete(`/api/shipping-addresses/${id}/`),
  getShippingRates: (shippingAddressId: number) => {
    if (!shippingAddressId || shippingAddressId <= 0) {
      return Promise.reject(new Error('Valid shipping address ID is required'));
    }
    return api.post('/api/shipping-rates/', 
      { shipping_address_id: shippingAddressId },
      { timeout: 20000 } // 20 second timeout for shipping rate calculation
    );
  },
};

// Payment API with enhanced error handling and timeout
export const paymentAPI = {
  createCheckoutSession: (shippingAddressId: number, shippingRateData?: {
    shipping_rate_id?: string;
    shipping_carrier?: string;
    shipping_service?: string;
    shipping_cost?: number;
    shipping_estimated_days?: number;
  }) => {
    const payload: any = { shipping_address_id: shippingAddressId };
    
    // Add shipping rate data if provided
    if (shippingRateData) {
      if (shippingRateData.shipping_rate_id) payload.shipping_rate_id = shippingRateData.shipping_rate_id;
      if (shippingRateData.shipping_carrier) payload.shipping_carrier = shippingRateData.shipping_carrier;
      if (shippingRateData.shipping_service) payload.shipping_service = shippingRateData.shipping_service;
      if (shippingRateData.shipping_cost) payload.shipping_cost = shippingRateData.shipping_cost;
      if (shippingRateData.shipping_estimated_days) payload.shipping_estimated_days = shippingRateData.shipping_estimated_days;
    }
    
    return api.post('/api/checkout/', payload, { timeout: 30000 });
  },
  getOrderSuccess: (sessionId: string) => {
    if (!sessionId || sessionId.trim() === '') {
      return Promise.reject(new Error('Invalid session ID'));
    }
    return api.get(`/api/order-success/?session_id=${encodeURIComponent(sessionId)}`, {
      timeout: 15000 // 15 second timeout for order retrieval
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/'),
};

// Customer API
export const customerAPI = {
  getCustomer: () => api.get('/api/customers/me'),
  updateCustomer: (data: Partial<Customer>) => api.put('/api/customers/me', data),
};

// Activity API
export const activityAPI = {
  getActivities: (page = 1) => api.get(`/api/customers/activities/?page=${page}`),
};

// Settings API
export const settingsAPI = {
  getNotificationPreferences: () => api.get('/api/customers/notification_preferences/'),
  updateNotificationPreferences: (data: NotificationPreferences) => 
    api.patch('/api/customers/notification_preferences/', data),
};

// US States data
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

// Utility functions
export const downloadCSV = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Utility functions for error handling
export const handleApiError = (error: any) => {
  if (error.isNetworkError) {
    return {
      type: 'network',
      message: error.message || 'Network connection failed. Please check your internet connection.',
      retryable: true
    };
  }
  
  if (error.isServerError) {
    return {
      type: 'server',
      message: error.message || 'Server error occurred. Please try again later.',
      retryable: true
    };
  }
  
  if (error.userMessage) {
    return {
      type: 'user',
      message: error.userMessage,
      retryable: false
    };
  }
  
  if (error.response?.status === 400) {
    return {
      type: 'validation',
      message: error.response.data?.error || 'Please check your input and try again.',
      retryable: false
    };
  }
  
  if (error.response?.status === 404) {
    return {
      type: 'not_found',
      message: 'The requested resource was not found.',
      retryable: false
    };
  }
  
  return {
    type: 'unknown',
    message: 'An unexpected error occurred. Please try again.',
    retryable: true
  };
};

export const isRetryableError = (error: any) => {
  const errorInfo = handleApiError(error);
  return errorInfo.retryable;
};

export const getErrorMessage = (error: any) => {
  const errorInfo = handleApiError(error);
  return errorInfo.message;
};

// Enhanced retry mechanism
export const retryApiCall = async (
  apiCall: () => Promise<any>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export default api;