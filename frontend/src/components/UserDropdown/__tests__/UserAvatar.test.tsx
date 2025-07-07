import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserAvatar from '../UserAvatar';

describe('UserAvatar', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe'
  };

  it('renders user initials correctly', () => {
    render(<UserAvatar user={mockUser} />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders username initials when no first/last name', () => {
    const userWithoutName = {
      ...mockUser,
      first_name: '',
      last_name: ''
    };
    
    render(<UserAvatar user={userWithoutName} />);
    
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "testuser"
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<UserAvatar user={mockUser} size="sm" />);
    expect(document.querySelector('.user-avatar-sm')).toBeInTheDocument();

    rerender(<UserAvatar user={mockUser} size="md" />);
    expect(document.querySelector('.user-avatar-md')).toBeInTheDocument();

    rerender(<UserAvatar user={mockUser} size="lg" />);
    expect(document.querySelector('.user-avatar-lg')).toBeInTheDocument();
  });

  it('shows online status when enabled', () => {
    render(<UserAvatar user={mockUser} showOnlineStatus={true} />);
    
    expect(document.querySelector('.user-avatar-status.online')).toBeInTheDocument();
    expect(document.querySelector('.status-dot')).toBeInTheDocument();
  });

  it('does not show online status by default', () => {
    render(<UserAvatar user={mockUser} />);
    
    expect(document.querySelector('.user-avatar-status')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<UserAvatar user={mockUser} className="custom-class" />);
    
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('handles single character names correctly', () => {
    const singleCharUser = {
      ...mockUser,
      first_name: 'A',
      last_name: 'B'
    };
    
    render(<UserAvatar user={singleCharUser} />);
    
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('handles empty username gracefully', () => {
    const emptyUser = {
      ...mockUser,
      username: '',
      first_name: '',
      last_name: ''
    };
    
    render(<UserAvatar user={emptyUser} />);
    
    // Should not crash and show empty string
    const avatar = document.querySelector('.user-avatar-circle');
    expect(avatar).toBeInTheDocument();
  });
});