import React from 'react';
import { useAuthStore } from '../store/useStore';
import { Navigate } from 'react-router-dom';
import ProfileManagement from '../components/UserDashboard/sections/ProfileManagement';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        
        <ProfileManagement />
      </div>
    </div>
  );
};

export default ProfilePage;