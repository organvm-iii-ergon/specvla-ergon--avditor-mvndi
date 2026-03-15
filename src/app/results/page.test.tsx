import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResultsPage from './page';

global.fetch = vi.fn();

describe('ResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('shows error if no audit data in sessionStorage', async () => {
    render(<ResultsPage />);
    expect(await screen.findByText('No audit data found. Please start from the home page.')).toBeInTheDocument();
  });

  it('fetches and displays the audit result', async () => {
    sessionStorage.setItem('current_audit_request', JSON.stringify({
      link: 'test.com',
      businessType: 'test',
      goals: 'test',
      geminiKey: 'key'
    }));

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ audit: '## Test Audit Result' })
    });

    render(<ResultsPage />);
    
    // Initially shows loading state
    expect(screen.getByText('Calculating Cosmic ROI...')).toBeInTheDocument();

    // Eventually shows results
    expect(await screen.findByText('Test Audit Result')).toBeInTheDocument();
    expect(screen.getByText('Ready to Manifest?')).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    sessionStorage.setItem('current_audit_request', JSON.stringify({
      link: 'test.com',
      businessType: 'test',
      goals: 'test',
      geminiKey: 'key'
    }));

    (global.fetch as any).mockResolvedValueOnce({
      json: async () => ({ error: 'API Rate Limit Exceeded' })
    });

    render(<ResultsPage />);
    
    expect(await screen.findByText('API Rate Limit Exceeded')).toBeInTheDocument();
  });
});
