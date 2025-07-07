import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsCard from '../widgets/StatsCard';

describe('StatsCard', () => {
  const mockIcon = (
    <svg data-testid="test-icon" width="24" height="24">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  it('renders basic stats card correctly', () => {
    render(
      <StatsCard
        title="Total Orders"
        value={42}
        icon={mockIcon}
      />
    );

    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('displays positive change correctly', () => {
    render(
      <StatsCard
        title="Revenue"
        value="$1,234"
        icon={mockIcon}
        change={{ value: '15%', type: 'positive' }}
      />
    );

    const changeElement = screen.getByText('+15%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('positive');
  });

  it('displays negative change correctly', () => {
    render(
      <StatsCard
        title="Revenue"
        value="$1,234"
        icon={mockIcon}
        change={{ value: '5%', type: 'negative' }}
      />
    );

    const changeElement = screen.getByText('5%');
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('negative');
  });

  it('handles click events when onClick is provided', () => {
    const mockOnClick = jest.fn();
    
    render(
      <StatsCard
        title="Clickable Card"
        value={100}
        icon={mockIcon}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByText('Clickable Card').closest('.stats-card');
    expect(card).toHaveStyle('cursor: pointer');
    
    fireEvent.click(card!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when onClick is not provided', () => {
    render(
      <StatsCard
        title="Non-clickable Card"
        value={100}
        icon={mockIcon}
      />
    );

    const card = screen.getByText('Non-clickable Card').closest('.stats-card');
    expect(card).toHaveStyle('cursor: default');
  });
});