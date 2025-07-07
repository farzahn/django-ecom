import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';
import DashboardLayout from '../../components/UserDashboard/DashboardLayout';
import DashboardOverview from '../../components/UserDashboard/sections/DashboardOverview';
import ProfileManagement from '../../components/UserDashboard/sections/ProfileManagement';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout title="Dashboard Overview">
            <DashboardOverview />
          </DashboardLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <DashboardLayout title="Profile Management">
            <ProfileManagement />
          </DashboardLayout>
        }
      />
      <Route
        path="/orders"
        element={
          <DashboardLayout title="Order Analytics">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Order History & Analytics</h3>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                  </div>
                  <h4 className="dashboard-empty-title">Order Analytics Coming Soon</h4>
                  <p className="dashboard-empty-text">
                    Advanced order analytics and management features will be available here.
                  </p>
                </div>
              </div>
            </div>
          </DashboardLayout>
        }
      />
      <Route
        path="/addresses"
        element={
          <DashboardLayout title="Address Management">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Shipping Addresses</h3>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h4 className="dashboard-empty-title">Address Management Coming Soon</h4>
                  <p className="dashboard-empty-text">
                    Manage your shipping addresses and delivery preferences here.
                  </p>
                </div>
              </div>
            </div>
          </DashboardLayout>
        }
      />
      <Route
        path="/security"
        element={
          <DashboardLayout title="Security Settings">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Account Security</h3>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h4 className="dashboard-empty-title">Security Settings Coming Soon</h4>
                  <p className="dashboard-empty-text">
                    Manage your password, two-factor authentication, and security preferences.
                  </p>
                </div>
              </div>
            </div>
          </DashboardLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardLayout title="Account Settings">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">Preferences & Settings</h3>
              </div>
              <div className="dashboard-card-body">
                <div className="dashboard-empty">
                  <div className="dashboard-empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </div>
                  <h4 className="dashboard-empty-title">Settings Coming Soon</h4>
                  <p className="dashboard-empty-text">
                    Customize your notification preferences, language, and other settings.
                  </p>
                </div>
              </div>
            </div>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default DashboardPage;