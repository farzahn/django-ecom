import React, { useState } from 'react';
import { useAuthStore } from '../../store/useStore';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = "Dashboard" 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <DashboardHeader 
        title={title}
        user={user}
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex max-w-7xl mx-auto min-h-[calc(100vh-80px)] lg:flex-row flex-col">
        <DashboardSidebar 
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;