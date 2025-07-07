import React from 'react';

interface DropdownMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isDanger?: boolean;
  className?: string;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  icon,
  label,
  href,
  onClick,
  isSelected = false,
  isDanger = false,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const baseClasses = 'flex items-center gap-3 w-full py-3 px-4 border-none bg-transparent rounded-lg cursor-pointer transition-all duration-200 no-underline font-medium text-sm text-left min-h-[44px]';
  const stateClasses = isSelected 
    ? 'bg-primary-light text-primary' 
    : 'text-gray-800 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:bg-primary-light focus:text-primary';
  const dangerClasses = isDanger 
    ? 'text-red-600 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600' 
    : '';
  
  const itemClasses = `${baseClasses} ${stateClasses} ${dangerClasses} ${className}`.trim();

  const content = (
    <>
      <span className="flex items-center justify-center w-4 h-4 flex-shrink-0">
        {icon}
      </span>
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {label}
      </span>
    </>
  );

  if (href && !onClick) {
    return (
      <a
        href={href}
        className={itemClasses}
        role="menuitem"
        tabIndex={isSelected ? 0 : -1}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={itemClasses}
      onClick={handleClick}
      role="menuitem"
      tabIndex={isSelected ? 0 : -1}
    >
      {content}
    </button>
  );
};

export default DropdownMenuItem;