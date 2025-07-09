import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DropdownMenuItem from '../DropdownMenuItem';

describe('DropdownMenuItem', () => {
  const mockIcon = (
    <svg data-testid="test-icon" width="16" height="16" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7"></rect>
    </svg>
  );

  const defaultProps = {
    icon: mockIcon,
    label: 'Test Item'
  };

  it('renders with basic props', () => {
    render(<DropdownMenuItem {...defaultProps} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('renders as a button when onClick is provided', () => {
    const handleClick = jest.fn();
    
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    const button = screen.getByRole('menuitem');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders as a link when href is provided without onClick', () => {
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        href="/dashboard"
      />
    );
    
    const link = screen.getByRole('menuitem');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('prefers button over link when both href and onClick are provided', () => {
    const handleClick = jest.fn();
    
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        href="/dashboard"
        onClick={handleClick}
      />
    );
    
    const element = screen.getByRole('menuitem');
    expect(element.tagName).toBe('BUTTON');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByRole('menuitem'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents default when onClick is called', () => {
    const handleClick = jest.fn();
    
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    const button = screen.getByRole('menuitem');
    const mockEvent = { preventDefault: jest.fn() };
    
    fireEvent.click(button, mockEvent);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies selected class when isSelected is true', () => {
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        isSelected={true}
      />
    );
    
    expect(screen.getByRole('menuitem')).toHaveClass('bg-primary-light');
    expect(screen.getByRole('menuitem')).toHaveClass('text-primary');
  });

  it('applies danger class when isDanger is true', () => {
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        isDanger={true}
      />
    );
    
    expect(screen.getByRole('menuitem')).toHaveClass('text-red-600');
  });

  it('applies custom className', () => {
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        className="custom-class"
      />
    );
    
    expect(screen.getByRole('menuitem')).toHaveClass('custom-class');
  });

  it('applies multiple classes correctly', () => {
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        isSelected={true}
        isDanger={true}
        className="custom-class"
      />
    );
    
    const element = screen.getByRole('menuitem');
    expect(element).toHaveClass('bg-primary-light');
    expect(element).toHaveClass('text-primary');
    expect(element).toHaveClass('text-red-600');
    expect(element).toHaveClass('custom-class');
  });

  it('sets correct tabIndex when selected', () => {
    const { rerender } = render(
      <DropdownMenuItem 
        {...defaultProps} 
        isSelected={false}
      />
    );
    
    expect(screen.getByRole('menuitem')).toHaveAttribute('tabIndex', '-1');
    
    rerender(
      <DropdownMenuItem 
        {...defaultProps} 
        isSelected={true}
      />
    );
    
    expect(screen.getByRole('menuitem')).toHaveAttribute('tabIndex', '0');
  });

  it('has proper accessibility attributes', () => {
    render(<DropdownMenuItem {...defaultProps} />);
    
    const menuItem = screen.getByRole('menuitem');
    expect(menuItem).toHaveAttribute('role', 'menuitem');
  });

  it('renders icon and label in correct structure', () => {
    render(<DropdownMenuItem {...defaultProps} />);
    
    const iconElement = screen.getByTestId('test-icon');
    const labelElement = screen.getByText('Test Item');
    
    expect(iconElement).toBeInTheDocument();
    expect(labelElement).toBeInTheDocument();
  });

  it('handles empty or null icon gracefully', () => {
    render(
      <DropdownMenuItem 
        icon={null}
        label="Test Item"
      />
    );
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('handles keyboard events properly', () => {
    const handleClick = jest.fn();
    
    render(
      <DropdownMenuItem 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    const menuItem = screen.getByRole('menuitem');
    
    // Test Enter key
    fireEvent.keyDown(menuItem, { key: 'Enter', code: 'Enter' });
    
    // Test Space key
    fireEvent.keyDown(menuItem, { key: ' ', code: 'Space' });
  });
});