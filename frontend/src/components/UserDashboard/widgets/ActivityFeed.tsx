import React, { useEffect, useState } from 'react';
import { activityAPI } from '../../../services/api';

interface Activity {
  id: number;
  activity_type: string;
  description: string;
  timestamp: string;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await activityAPI.getActivities();
        setActivities(response.data.results || response.data || []);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v18h-6M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
        );
      case 'order_placed':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
        );
      case 'profile_update':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        );
      case 'address_added':
      case 'address_updated':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Recent Activity</h3>
        </div>
        <div className="dashboard-card-body">
          <div className="dashboard-loading">
            <div className="dashboard-loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">Recent Activity</h3>
        <a href="/dashboard/activity" className="dashboard-card-action">
          View All
        </a>
      </div>
      
      <div className="dashboard-card-body">
        {activities.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h4 className="dashboard-empty-title">No Recent Activity</h4>
            <p className="dashboard-empty-text">
              Your activity will appear here as you use the platform.
            </p>
          </div>
        ) : (
          <div className="activity-feed">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    {activity.description || activity.activity_type.replace('_', ' ')}
                  </p>
                  <p className="activity-time">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;