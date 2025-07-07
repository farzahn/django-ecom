import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import useClickOutside from '../hooks/useClickOutside';

// Test component to test the hook
const TestComponent: React.FC<{ onClose: () => void; isActive: boolean }> = ({ onClose, isActive }) => {
  const ref = useClickOutside<HTMLDivElement>(onClose, isActive);
  
  return (
    <div data-testid="container">
      <div ref={ref} data-testid="inside">
        Inside element
      </div>
      <div data-testid="outside">
        Outside element
      </div>
    </div>
  );
};

describe('useClickOutside', () => {
  it('calls onClose when clicking outside the element', () => {
    const handleClose = jest.fn();
    
    const { getByTestId } = render(
      <TestComponent onClose={handleClose} isActive={true} />
    );
    
    // Click outside the element
    fireEvent.mouseDown(getByTestId('outside'));
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the element', () => {
    const handleClose = jest.fn();
    
    const { getByTestId } = render(
      <TestComponent onClose={handleClose} isActive={true} />
    );
    
    // Click inside the element
    fireEvent.mouseDown(getByTestId('inside'));
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when isActive is false', () => {
    const handleClose = jest.fn();
    
    const { getByTestId } = render(
      <TestComponent onClose={handleClose} isActive={false} />
    );
    
    // Click outside the element
    fireEvent.mouseDown(getByTestId('outside'));
    
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('handles multiple clicks correctly', () => {
    const handleClose = jest.fn();
    
    const { getByTestId } = render(
      <TestComponent onClose={handleClose} isActive={true} />
    );
    
    // Click outside multiple times
    fireEvent.mouseDown(getByTestId('outside'));
    fireEvent.mouseDown(getByTestId('outside'));
    fireEvent.mouseDown(getByTestId('outside'));
    
    expect(handleClose).toHaveBeenCalledTimes(3);
  });

  it('updates behavior when isActive changes', () => {
    const handleClose = jest.fn();
    
    const { getByTestId, rerender } = render(
      <TestComponent onClose={handleClose} isActive={false} />
    );
    
    // Click outside when inactive
    fireEvent.mouseDown(getByTestId('outside'));
    expect(handleClose).not.toHaveBeenCalled();
    
    // Rerender with active
    rerender(<TestComponent onClose={handleClose} isActive={true} />);
    
    // Click outside when active
    fireEvent.mouseDown(getByTestId('outside'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listeners on unmount', () => {
    const handleClose = jest.fn();
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(
      <TestComponent onClose={handleClose} isActive={true} />
    );
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('handles null ref gracefully', () => {
    const handleClose = jest.fn();
    
    // Test that the hook doesn't crash when ref.current is null
    expect(() => {
      const TestComponentWithNullRef: React.FC = () => {
        useClickOutside<HTMLDivElement>(handleClose, true);
        return <div data-testid="outside">Outside element</div>;
      };
      
      const { getByTestId } = render(<TestComponentWithNullRef />);
      fireEvent.mouseDown(getByTestId('outside'));
    }).not.toThrow();
  });

  it('returns a ref object', () => {
    const TestComponentCheckRef: React.FC = () => {
      const ref = useClickOutside<HTMLDivElement>(() => {}, true);
      
      return (
        <div>
          {/* Verify ref is returned */}
          <div data-testid="ref-exists">{ref ? 'ref-exists' : 'no-ref'}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(<TestComponentCheckRef />);
    
    expect(getByTestId('ref-exists')).toHaveTextContent('ref-exists');
  });
});