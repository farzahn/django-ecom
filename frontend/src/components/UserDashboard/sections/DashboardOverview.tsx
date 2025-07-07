import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../widgets/StatsCard';
import QuickActions from '../widgets/QuickActions';
import ActivityFeed from '../widgets/ActivityFeed';
import { dashboardAPI, customerAPI } from '../../../services/api';

interface DashboardStats {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  recent_orders: any[];
  orders_by_status: Record<string, number>;
  monthly_revenue: any[];
}

interface CustomerData {
  total_orders: number;
  total_spent: number;
  member_since: string;
  is_verified: boolean;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, customerResponse] = await Promise.all([
          dashboardAPI.getStats(),
          customerAPI.getCustomer()
        ]);
        
        setStats(statsResponse.data);
        setCustomer(customerResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-spinner"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMembershipDuration = () => {
    if (!customer?.member_since) return 'New Member';
    
    const memberSince = new Date(customer.member_since);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) return `${diffInDays} days`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
    return `${Math.floor(diffInDays / 365)} years`;
  };

  const getRecentOrdersChange = () => {
    if (!stats?.recent_orders || stats.recent_orders.length < 2) return null;
    
    const thisMonth = stats.recent_orders.filter(order => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonth = stats.recent_orders.filter(order => {
      const orderDate = new Date(order.order_date);
      const now = new Date();
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return orderDate.getMonth() === lastMonthDate.getMonth() && orderDate.getFullYear() === lastMonthDate.getFullYear();
    }).length;
    
    if (lastMonth === 0) return null;
    
    const change = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1);
    return {
      value: `${change}%`,
      type: thisMonth >= lastMonth ? 'positive' as const : 'negative' as const
    };
  };

  return (
    <div className="dashboard-grid">
      {/* Stats Cards Row */}
      <div className="dashboard-grid dashboard-grid-4">
        <StatsCard
          title="Total Orders"
          value={customer?.total_orders || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          }
          change={getRecentOrdersChange()}
          onClick={() => navigate('/orders')}
        />

        <StatsCard
          title="Total Spent"
          value={formatCurrency(customer?.total_spent || 0)}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
          onClick={() => navigate('/orders')}
        />

        <StatsCard
          title="Member Since"
          value={getMembershipDuration()}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
          onClick={() => navigate('/dashboard/profile')}
        />

        <StatsCard
          title="Account Status"
          value={customer?.is_verified ? "Verified" : "Pending"}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              {customer?.is_verified && <path d="M9 12l2 2 4-4"/>}
            </svg>
          }
          onClick={() => navigate('/dashboard/security')}
        />
      </div>

      {/* Recent Orders Chart Placeholder */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Order Analytics</h3>
          <a href="/orders" className="dashboard-card-action">View All Orders</a>
        </div>
        <div className="dashboard-card-body">
          {stats?.recent_orders && stats.recent_orders.length > 0 ? (
            <div style={{ 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-color)'
            }}>
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: 'var(--space-2)' }}>
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                  Interactive charts coming soon
                </p>
              </div>
            </div>
          ) : (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h4 className="dashboard-empty-title">No Order Data</h4>
              <p className="dashboard-empty-text">
                Place your first order to see analytics here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Quick Actions and Activity Feed */}
      <div className="dashboard-grid dashboard-grid-2">
        <QuickActions />
        <ActivityFeed />
      </div>
    </div>
  );
};

export default DashboardOverview;