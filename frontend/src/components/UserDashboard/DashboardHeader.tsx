import React from 'react';

interface User {
  first_name?: string;
  last_name?: string;
  username: string;
  email: string;
}

interface DashboardHeaderProps {
  title: string;
  user: User | null;
  onToggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  user, 
  onToggleSidebar 
}) => {
  const getDisplayName = () => {
    if (!user) return 'Guest';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden bg-transparent border-none p-2 cursor-pointer rounded-md flex items-center justify-center text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800 m-0">{title}</h1>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-medium text-gray-800 m-0">{getDisplayName()}</p>
              <p className="text-sm text-gray-600 m-0">{user.email}</p>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold border-2 border-gray-200">
              {getInitials()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;