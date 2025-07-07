import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useStore';
import { ordersAPI } from '../services/api';

interface Order {
  id: number;
  order_id: string;
  order_date: string;
  status: string;
  total_price: string;
  items: any[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getOrders();
        setOrders(response.data.results || response.data || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ 
        padding: 'var(--space-8)', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h2>Please log in to view your orders</h2>
        <p>You need to be logged in to access your order history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: 'var(--space-8)', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="dashboard-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'var(--space-6)', 
      maxWidth: 'var(--container-max)', 
      margin: '0 auto' 
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-base)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <h1 style={{ 
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Order History
          </h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-8)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto var(--space-4)',
              opacity: 0.5
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
            </div>
            <h3 style={{ 
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text-primary)',
              margin: '0 0 var(--space-2)'
            }}>
              No Orders Found
            </h3>
            <p style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 'var(--space-2)'
                }}>
                  <h3 style={{ 
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    margin: 0,
                    color: 'var(--text-primary)'
                  }}>
                    Order #{order.order_id}
                  </h3>
                  <span style={{
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-base)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    background: order.status === 'completed' ? 'var(--success-light)' : 'var(--warning-light)',
                    color: order.status === 'completed' ? 'var(--success-color)' : 'var(--warning-color)'
                  }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: 'var(--space-4)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    <strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Total:</strong> ${order.total_price}
                  </div>
                  <div>
                    <strong>Items:</strong> {order.items?.length || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;