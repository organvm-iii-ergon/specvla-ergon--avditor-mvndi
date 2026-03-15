import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './page';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders correctly', () => {
    render(<HomePage />);
    expect(screen.getByText('Growth Auditor AI')).toBeInTheDocument();
    expect(screen.getByLabelText(/URL \/ Social Handle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Domain \/ Niche/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Manifestation/i)).toBeInTheDocument();
  });

  it('shows error if API keys are missing', () => {
    render(<HomePage />);
    
    fireEvent.change(screen.getByLabelText(/URL \/ Social Handle/i), { target: { value: 'test.com' } });
    fireEvent.change(screen.getByLabelText(/Domain \/ Niche/i), { target: { value: 'Studio' } });
    fireEvent.change(screen.getByLabelText(/Target Manifestation/i), { target: { value: 'Grow' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Generate Cosmic Audit/i }));
    
    expect(screen.getByText('Please configure your API keys in Settings first.')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits successfully and redirects if keys exist', () => {
    localStorage.setItem('gemini_api_key', 'test-key');
    render(<HomePage />);
    
    fireEvent.change(screen.getByLabelText(/URL \/ Social Handle/i), { target: { value: 'test.com' } });
    fireEvent.change(screen.getByLabelText(/Domain \/ Niche/i), { target: { value: 'Studio' } });
    fireEvent.change(screen.getByLabelText(/Target Manifestation/i), { target: { value: 'Grow' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Generate Cosmic Audit/i }));
    
    expect(mockPush).toHaveBeenCalledWith('/results');
    expect(JSON.parse(sessionStorage.getItem('current_audit_request')!)).toEqual({
      link: 'test.com',
      businessType: 'Studio',
      goals: 'Grow',
      geminiKey: 'test-key',
      openaiKey: null
    });
  });
});
