import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SettingsPage from './page';

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/Google Gemini API Key/i)).toBeInTheDocument();
  });

  it('loads keys from localStorage', () => {
    localStorage.setItem('gemini_api_key', 'stored-gemini-key');
    
    render(<SettingsPage />);
    
    expect(screen.getByLabelText(/Google Gemini API Key/i)).toHaveValue('stored-gemini-key');
  });

  it('saves keys to localStorage and shows success message', () => {
    render(<SettingsPage />);
    
    fireEvent.change(screen.getByLabelText(/Google Gemini API Key/i), { target: { value: 'new-gemini-key' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Save Configuration/i }));
    
    expect(localStorage.getItem('gemini_api_key')).toBe('new-gemini-key');
    expect(screen.getByRole('button')).toHaveTextContent('Key Saved! ✓');
    
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(screen.getByRole('button')).toHaveTextContent('Save Configuration');
  });
});
