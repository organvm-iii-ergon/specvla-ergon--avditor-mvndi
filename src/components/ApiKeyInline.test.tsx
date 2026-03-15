import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApiKeyInline from './ApiKeyInline';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ApiKeyInline Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('shows expanded state when no key in localStorage', () => {
    render(<ApiKeyInline />);
    expect(screen.getByText(/To run audits, you need an API key from your chosen AI provider/)).toBeInTheDocument();
    expect(screen.getByLabelText('Google Gemini API Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByText(/Get a free key/)).toBeInTheDocument();
  });

  it('shows badge when key exists in localStorage', () => {
    localStorageMock.setItem('gemini_api_key', 'test-api-key');
    render(<ApiKeyInline />);
    expect(screen.getByLabelText(/Google Gemini Key configured/)).toBeInTheDocument();
    expect(screen.queryByText(/To run audits/)).not.toBeInTheDocument();
  });

  it('saves key to localStorage on save button click', () => {
    render(<ApiKeyInline />);
    const input = screen.getByLabelText('Google Gemini API Key');
    const saveBtn = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(input, { target: { value: 'my-new-key' } });
    fireEvent.click(saveBtn);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('gemini_api_key', 'my-new-key');
    // After saving, should show badge
    expect(screen.getByLabelText(/Google Gemini Key configured/)).toBeInTheDocument();
  });

  it('calls onKeyChange callback when key is saved', () => {
    const onKeyChange = vi.fn();
    render(<ApiKeyInline onKeyChange={onKeyChange} />);
    const input = screen.getByLabelText('Google Gemini API Key');
    const saveBtn = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(input, { target: { value: 'callback-key' } });
    fireEvent.click(saveBtn);

    expect(onKeyChange).toHaveBeenCalledWith(true);
  });
});
