import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDropdown from '../UserDropdown';
import { useAuthStore } from '../../../store/useStore';

// Mock the store
jest.mock('../../../store/useStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock the hooks
jest.mock('../hooks/useClickOutside', () => {
  return jest.fn(() => ({ current: null }));
});

jest.mock('../hooks/useKeyboardNav', () => ({
  __esModule: true,
  default: jest.fn(() => ({ selectedIndex: -1 }))
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}), { virtual: true });

describe('UserDropdown', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe'
  };

  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn()
    });
  });

  it('renders null when user is not available', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      logout: mockLogout,
      isAuthenticated: false,
      login: jest.fn(),
      register: jest.fn()
    });

    const { container } = render(<UserDropdown />);

    expect(container.firstChild).toBeNull();
  });

  it('renders user dropdown trigger with user name', () => {
    render(<UserDropdown />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
  });

  it('shows username when first/last name not available', () => {
    const userWithoutName = {
      ...mockUser,
      first_name: '',
      last_name: ''
    };

    mockUseAuthStore.mockReturnValue({
      user: userWithoutName,
      logout: mockLogout,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn()
    });

    render(<UserDropdown />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('opens dropdown menu when trigger is clicked', () => {
    render(<UserDropdown />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('menu', { name: /user menu/i })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('displays user information in dropdown header', () => {
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getAllByText('John Doe')).toHaveLength(2); // One in trigger, one in header
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders all menu items when dropdown is open', () => {
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('closes dropdown when trigger is clicked again', () => {
    render(<UserDropdown />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    
    // Open dropdown
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: /user menu/i })).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu', { name: /user menu/i })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('calls logout function when Sign Out is clicked', () => {
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    fireEvent.click(screen.getByText('Sign Out'));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<UserDropdown />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-label', 'User menu');
  });

  it('handles keyboard events properly', async () => {
    render(<UserDropdown />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    
    // Test Enter key opens dropdown
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(screen.getByRole('menu', { name: /user menu/i })).toBeInTheDocument();
    });

    // Test Escape key (would be handled by useKeyboardNav hook)
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  });

  it('applies correct CSS classes to dropdown arrow', () => {
    render(<UserDropdown />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    const arrow = trigger.querySelector('.user-dropdown-arrow');
    
    expect(arrow).not.toHaveClass('open');

    fireEvent.click(trigger);
    
    expect(arrow).toHaveClass('open');
  });

  it('displays user initials in avatar', () => {
    render(<UserDropdown />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles menu item navigation correctly', () => {
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    
    // Check that menu items are rendered as expected
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has proper role attributes for menu items', () => {
    render(<UserDropdown />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(5); // Dashboard, Orders, Profile, Settings, Sign Out
    
    menuItems.forEach(item => {
      expect(item).toHaveAttribute('role', 'menuitem');
    });
  });
});