import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    type: 'positive' | 'negative';
  } | null;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  onClick
}) => {
  return (
    <div 
      className={`stats-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stats-card-icon">
        {icon}
      </div>
      
      <h3 className="stats-card-value">{value}</h3>
      
      <p className="stats-card-label">{title}</p>
      
      {change && (
        <div className={`stats-card-change ${change.type}`}>
          {change.type === 'positive' ? '+' : ''}{change.value}
        </div>
      )}
    </div>
  );
};

export default StatsCard;