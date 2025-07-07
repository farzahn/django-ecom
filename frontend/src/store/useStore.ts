import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Cart, Product, Order } from '../types';
import { cartAPI, authAPI, handleApiError, retryApiCall } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null, token: string | null) => void;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
}

interface OrderState {
  currentOrder: Order | null;
  recentOrders: Order[];
  isLoadingOrder: boolean;
  orderError: string | null;
  setCurrentOrder: (order: Order | null) => void;
  clearOrderError: () => void;
  addRecentOrder: (order: Order) => void;
}

interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          const errorInfo = handleApiError(error);
          console.error('Login failed:', errorInfo.message);
          throw error;
        }
      },
      
      register: async (userData) => {
        try {
          const response = await authAPI.register(userData);
          const { user, token } = response.data;
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          const errorInfo = handleApiError(error);
          console.error('Registration failed:', errorInfo.message);
          throw error;
        }
      },
      
      logout: () => {
        authAPI.logout().catch(() => {});
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      setUser: (user, token) => {
        set({ user, token, isAuthenticated: !!user && !!token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await retryApiCall(() => cartAPI.getCart(), 2);
      set({ 
        cart: response.data, 
        isLoading: false, 
        lastUpdated: Date.now(),
        error: null 
      });
    } catch (error) {
      const errorInfo = handleApiError(error);
      set({ 
        isLoading: false, 
        error: errorInfo.message 
      });
      throw error;
    }
  },
  
  addToCart: async (productId, quantity) => {
    set({ error: null });
    try {
      await cartAPI.addToCart(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      const errorInfo = handleApiError(error);
      set({ error: errorInfo.message });
      throw error;
    }
  },
  
  updateCartItem: async (itemId, quantity) => {
    set({ error: null });
    try {
      await cartAPI.updateCartItem(itemId, quantity);
      await get().fetchCart();
    } catch (error) {
      const errorInfo = handleApiError(error);
      set({ error: errorInfo.message });
      throw error;
    }
  },
  
  removeFromCart: async (itemId) => {
    set({ error: null });
    try {
      await cartAPI.removeFromCart(itemId);
      await get().fetchCart();
    } catch (error) {
      const errorInfo = handleApiError(error);
      set({ error: errorInfo.message });
      throw error;
    }
  },
  
  clearCart: async () => {
    set({ error: null });
    try {
      await cartAPI.clearCart();
      set({ cart: null, lastUpdated: Date.now() });
    } catch (error) {
      const errorInfo = handleApiError(error);
      set({ error: errorInfo.message });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  totalPages: 0,
  currentPage: 1,
}));

export const useOrderStore = create<OrderState>()((
  persist(
    (set, get) => ({
      currentOrder: null,
      recentOrders: [],
      isLoadingOrder: false,
      orderError: null,
      
      setCurrentOrder: (order) => {
        set({ currentOrder: order });
        if (order) {
          get().addRecentOrder(order);
        }
      },
      
      clearOrderError: () => set({ orderError: null }),
      
      addRecentOrder: (order) => {
        const { recentOrders } = get();
        const filteredOrders = recentOrders.filter(o => o.id !== order.id);
        const updatedOrders = [order, ...filteredOrders].slice(0, 10); // Keep last 10 orders
        set({ recentOrders: updatedOrders });
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({ 
        recentOrders: state.recentOrders 
      }),
    }
  )
));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  
  addNotification: (type, message) => {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
    };
    
    set(state => ({
      notifications: [...state.notifications, notification]
    }));
    
    // Auto-remove after 5 seconds for non-error notifications
    if (type !== 'error') {
      setTimeout(() => {
        get().removeNotification(notification.id);
      }, 5000);
    }
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => set({ notifications: [] }),
}));