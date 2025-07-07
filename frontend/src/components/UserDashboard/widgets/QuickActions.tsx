import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color?: string;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      label: 'Browse Products',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 10l-3-12M7 13L5.4 5M7 13l1 5h12M9 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM20.5 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        </svg>
      ),
      action: () => navigate('/products')
    },
    {
      label: 'View Cart',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      ),
      action: () => navigate('/cart')
    },
    {
      label: 'Order History',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      ),
      action: () => navigate('/orders')
    },
    {
      label: 'Add Address',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
      action: () => navigate('/dashboard/addresses')
    },
    {
      label: 'Profile Settings',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      action: () => navigate('/dashboard/profile')
    },
    {
      label: 'Export Data',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      ),
      action: () => {
        // Handle export action
        console.log('Export data functionality');
      }
    }
  ];

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Quick Actions</h3>
      </div>
      
      <div className="dashboard-card-body">
        <div className="quick-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={action.action}
            >
              <div className="quick-action-icon">
                {action.icon}
              </div>
              <span className="quick-action-text">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;