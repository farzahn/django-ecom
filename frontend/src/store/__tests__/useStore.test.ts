import { renderHook, act } from '@testing-library/react';
import { useAuthStore, useCartStore } from '../useStore';

// Mock the APIs
jest.mock('../../services/api', () => ({
  ...jest.requireActual('../../services/api'),
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },
  cartAPI: {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateCartItem: jest.fn(),
    clearCart: jest.fn(),
  },
  handleApiError: jest.fn().mockImplementation(() => ({
    type: 'test',
    message: 'Test error message',
    retryable: false
  }))
}));

import { authAPI, cartAPI } from '../../services/api';
const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;
const mockCartAPI = cartAPI as jest.Mocked<typeof cartAPI>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API promises
    mockAuthAPI.logout.mockResolvedValue({} as any);
    mockAuthAPI.login.mockResolvedValue({
      data: { token: 'test-token', user: { id: 1, email: 'test@example.com' } }
    } as any);
    
    // Reset the store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  test('initial state is unauthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('login sets user and token', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    const mockToken = 'test-token';
    
    mockAuthAPI.login.mockResolvedValue({
      data: { user: mockUser, token: mockToken }
    } as any);

    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.login({ username: 'testuser', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  test('register creates user and sets token', async () => {
    const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' };
    const mockToken = 'new-token';
    
    mockAuthAPI.register.mockResolvedValue({
      data: { user: mockUser, token: mockToken }
    } as any);

    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.register({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password'
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('logout clears user data', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // Set initial authenticated state
    act(() => {
      result.current.setUser(
        { id: 1, username: 'testuser' } as any,
        'test-token'
      );
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });
});

describe('useCartStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock cart API promises
    mockCartAPI.getCart.mockResolvedValue({
      data: { items: [], total: 0 }
    } as any);
    mockCartAPI.addToCart.mockResolvedValue({
      data: { items: [], total: 0 }
    } as any);
    mockCartAPI.updateCartItem.mockResolvedValue({
      data: { items: [], total: 0 }
    } as any);
    mockCartAPI.removeFromCart.mockResolvedValue({
      data: { items: [], total: 0 }
    } as any);
    mockCartAPI.clearCart.mockResolvedValue({} as any);
    
    // Reset the store state
    useCartStore.setState({
      cart: null,
      isLoading: false,
    });
  });

  test('initial state has no cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    expect(result.current.cart).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  test('fetchCart loads cart data', async () => {
    const mockCart = {
      id: 1,
      items: [],
      total_items: 0,
      total_price: '0.00'
    };
    
    mockCartAPI.getCart.mockResolvedValue({
      data: mockCart
    } as any);

    const { result } = renderHook(() => useCartStore());
    
    await act(async () => {
      await result.current.fetchCart();
    });

    expect(result.current.cart).toEqual(mockCart);
    expect(result.current.isLoading).toBe(false);
  });

  test('addToCart calls API and refreshes cart', async () => {
    const mockCartItem = { id: 1, product: { id: 1 }, quantity: 2 };
    const mockUpdatedCart = {
      id: 1,
      items: [mockCartItem],
      total_items: 2,
      total_price: '39.98'
    };
    
    mockCartAPI.addToCart.mockResolvedValue({
      data: mockCartItem
    } as any);
    
    mockCartAPI.getCart.mockResolvedValue({
      data: mockUpdatedCart
    } as any);

    const { result } = renderHook(() => useCartStore());
    
    await act(async () => {
      await result.current.addToCart(1, 2);
    });

    expect(mockCartAPI.addToCart).toHaveBeenCalledWith(1, 2);
    expect(result.current.cart).toEqual(mockUpdatedCart);
  });

  test('removeFromCart calls API and refreshes cart', async () => {
    const mockEmptyCart = {
      id: 1,
      items: [],
      total_items: 0,
      total_price: '0.00'
    };
    
    mockCartAPI.removeFromCart.mockResolvedValue({} as any);
    mockCartAPI.getCart.mockResolvedValue({
      data: mockEmptyCart
    } as any);

    const { result } = renderHook(() => useCartStore());
    
    await act(async () => {
      await result.current.removeFromCart(1);
    });

    expect(mockCartAPI.removeFromCart).toHaveBeenCalledWith(1);
    expect(result.current.cart).toEqual(mockEmptyCart);
  });

  test('handles API errors gracefully', async () => {
    mockCartAPI.getCart.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useCartStore());
    
    await expect(async () => {
      await act(async () => {
        await result.current.fetchCart();
      });
    }).rejects.toThrow('API Error');

    expect(result.current.isLoading).toBe(false);
  });
});