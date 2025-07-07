import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';
import UserAvatar from './UserAvatar';
import DropdownMenuItem from './DropdownMenuItem';
import useClickOutside from './hooks/useClickOutside';
import useKeyboardNav from './hooks/useKeyboardNav';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  action?: () => void;
  isDanger?: boolean;
  separator?: boolean;
}

const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      label: 'Dashboard',
      href: '/dashboard'
    },
    {
      id: 'orders',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      ),
      label: 'Orders',
      href: '/orders'
    },
    {
      id: 'profile',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      label: 'Profile',
      href: '/dashboard/profile'
    },
    {
      id: 'settings',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
      label: 'Settings',
      href: '/dashboard/settings'
    },
    {
      id: 'separator',
      icon: null,
      label: '',
      separator: true
    },
    {
      id: 'logout',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16,17 21,12 16,7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      ),
      label: 'Sign Out',
      action: handleLogout,
      isDanger: true
    }
  ];

  const handleMenuItemClick = useCallback((index: number) => {
    const item = menuItems[index];
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
      handleClose();
    }
  }, [menuItems, navigate, handleClose]);

  const { selectedIndex } = useKeyboardNav({
    isOpen,
    itemCount: menuItems.filter(item => !item.separator).length,
    onClose: handleClose,
    onSelect: handleMenuItemClick
  });

  const dropdownRef = useClickOutside<HTMLDivElement>(handleClose, isOpen);

  if (!user) {
    return null;
  }

  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        className={`flex items-center gap-2 py-2 px-3 bg-transparent border border-transparent rounded-lg cursor-pointer transition-all duration-200 text-gray-800 font-medium text-sm hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isOpen ? 'bg-gray-100 border-gray-300' : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <UserAvatar user={user} size="sm" />
        <span className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap md:inline hidden">
          {getDisplayName()}
        </span>
        <svg 
          className={`transition-transform duration-200 text-gray-600 ${isOpen ? 'rotate-180' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-72 md:w-80 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right" role="menu" aria-label="User menu">
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
            <UserAvatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-gray-800 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                {getDisplayName()}
              </div>
              <div className="text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                {user.email}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 my-2"></div>

          <div className="p-2">
            {menuItems.map((item, index) => {
              if (item.separator) {
                return <div key={item.id} className="h-px bg-gray-200 my-2"></div>;
              }

              const actualIndex = menuItems.slice(0, index).filter(i => !i.separator).length;
              const isSelected = actualIndex === selectedIndex;

              return (
                <DropdownMenuItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  onClick={item.action}
                  isSelected={isSelected}
                  isDanger={item.isDanger}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;