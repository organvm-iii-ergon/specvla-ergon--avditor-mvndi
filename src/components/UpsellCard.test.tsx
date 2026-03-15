import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UpsellCard from './UpsellCard';

describe('UpsellCard Component', () => {
  const props = {
    pathNumber: 1,
    title: 'Test Path',
    description: 'This is a test description.',
    buttonText: 'Click Me'
  };

  it('renders correctly with props', () => {
    render(<UpsellCard {...props} />);
    expect(screen.getByText('Path 1')).toBeInTheDocument();
    expect(screen.getByText('Test Path')).toBeInTheDocument();
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('applies secondary class by default', () => {
    render(<UpsellCard {...props} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  it('removes secondary class when isPrimary is true', () => {
    render(<UpsellCard {...props} isPrimary={true} />);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('btn-secondary');
    expect(button).toHaveClass('btn');
  });
});
