import React from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showOnlineStatus?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showOnlineStatus = false,
  className = ''
}) => {
  const getDisplayName = () => {
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-sm';
      case 'lg':
        return 'w-12 h-12 text-lg';
      default:
        return 'w-10 h-10 text-base';
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-semibold border-2 border-gray-200 transition-all duration-200 ${getSizeClasses()}`}>
        {getInitials()}
      </div>
      {showOnlineStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center" title="Online">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;