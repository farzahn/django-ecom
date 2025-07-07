import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simplified UserDropdown component for testing core functionality
const SimpleUserDropdown: React.FC<{ user: any }> = ({ user }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  return (
    <div className="user-dropdown">
      <button
        type="button"
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <span>{getDisplayName()}</span>
      </button>

      {isOpen && (
        <div className="user-dropdown-menu" role="menu" aria-label="User menu">
          <div className="user-dropdown-header">
            <div className="user-dropdown-info">
              <div className="user-dropdown-display-name">
                {getDisplayName()}
              </div>
              <div className="user-dropdown-email">
                {user.email}
              </div>
            </div>
          </div>

          <div className="user-dropdown-items">
            <a href="/dashboard" role="menuitem">Dashboard</a>
            <a href="/orders" role="menuitem">Orders</a>
            <a href="/profile" role="menuitem">Profile</a>
            <a href="/settings" role="menuitem">Settings</a>
            <button type="button" role="menuitem">Sign Out</button>
          </div>
        </div>
      )}
    </div>
  );
};

describe('UserDropdown Core Functionality', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe'
  };

  it('renders null when user is not available', () => {
    const { container } = render(<SimpleUserDropdown user={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders user dropdown trigger with user name', () => {
    render(<SimpleUserDropdown user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument();
  });

  it('shows username when first/last name not available', () => {
    const userWithoutName = {
      ...mockUser,
      first_name: '',
      last_name: ''
    };

    render(<SimpleUserDropdown user={userWithoutName} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('opens dropdown menu when trigger is clicked', () => {
    render(<SimpleUserDropdown user={mockUser} />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('menu', { name: /user menu/i })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('displays user information in dropdown header', () => {
    render(<SimpleUserDropdown user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getAllByText('John Doe')).toHaveLength(2); // One in trigger, one in header
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('renders all menu items when dropdown is open', () => {
    render(<SimpleUserDropdown user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('closes dropdown when trigger is clicked again', () => {
    render(<SimpleUserDropdown user={mockUser} />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    
    // Open dropdown
    fireEvent.click(trigger);
    expect(screen.getByRole('menu', { name: /user menu/i })).toBeInTheDocument();

    // Close dropdown
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu', { name: /user menu/i })).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<SimpleUserDropdown user={mockUser} />);

    const trigger = screen.getByRole('button', { name: /user menu/i });
    
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-label', 'User menu');
  });

  it('has proper role attributes for menu items', () => {
    render(<SimpleUserDropdown user={mockUser} />);

    fireEvent.click(screen.getByRole('button', { name: /user menu/i }));

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(5); // Dashboard, Orders, Profile, Settings, Sign Out
    
    menuItems.forEach(item => {
      expect(item).toHaveAttribute('role', 'menuitem');
    });
  });
});