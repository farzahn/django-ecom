import { useEffect, useState, useCallback } from 'react';

interface UseKeyboardNavProps {
  isOpen: boolean;
  itemCount: number;
  onClose: () => void;
  onSelect: (index: number) => void;
}

function useKeyboardNav({
  isOpen,
  itemCount,
  onClose,
  onSelect
}: UseKeyboardNavProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Reset selected index when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < itemCount - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : itemCount - 1
        );
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (selectedIndex >= 0) {
          onSelect(selectedIndex);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        setSelectedIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        setSelectedIndex(itemCount - 1);
        break;
    }
  }, [isOpen, itemCount, selectedIndex, onClose, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { selectedIndex, setSelectedIndex };
}

export default useKeyboardNav;