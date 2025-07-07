import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../../store/useStore';
import Header from '../Header';

// Mock the stores
jest.mock('../../store/useStore');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>;

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders header with logo', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    } as any);

    mockUseCartStore.mockReturnValue({
      cart: null,
    } as any);

    renderHeader();
    
    expect(screen.getByText('Pasargad Prints')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  test('shows login/register links when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    } as any);

    mockUseCartStore.mockReturnValue({
      cart: null,
    } as any);

    renderHeader();
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('shows user menu when authenticated', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      first_name: 'John',
      last_name: 'Doe',
    };

    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: jest.fn(),
    } as any);

    mockUseCartStore.mockReturnValue({
      cart: null,
    } as any);

    renderHeader();
    
    expect(screen.getByText('Hello, John')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('displays cart count badge', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    } as any);

    mockUseCartStore.mockReturnValue({
      cart: {
        total_items: 3,
      },
    } as any);

    renderHeader();
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('handles logout correctly', () => {
    const mockLogout = jest.fn();
    const mockUser = {
      id: 1,
      username: 'testuser',
      first_name: 'John',
    };

    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
    } as any);

    mockUseCartStore.mockReturnValue({
      cart: null,
    } as any);

    renderHeader();
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});