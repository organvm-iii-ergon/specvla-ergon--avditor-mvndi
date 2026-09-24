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

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('HomePage Accessibility - Pillar Disclosure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders initial collapsed state with correct aria-expanded="false" on all pillar buttons', () => {
    render(<HomePage />);

    const sunButton = screen.getByRole('button', { name: /Sun/i });
    const mercuryButton = screen.getByRole('button', { name: /Mercury/i });

    expect(sunButton).toHaveAttribute('aria-expanded', 'false');
    expect(mercuryButton).toHaveAttribute('aria-expanded', 'false');
    expect(sunButton).toHaveAttribute('aria-controls', 'pillar-detail-panel');

    // Detail panel should not exist initially
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(document.getElementById('pillar-detail-panel')).not.toBeInTheDocument();
  });

  it('opens pillar detail on click and exposes correct expanded state and relationships', () => {
    render(<HomePage />);

    const sunButton = screen.getByRole('button', { name: /Sun/i });
    fireEvent.click(sunButton);

    expect(sunButton).toHaveAttribute('aria-expanded', 'true');

    const detailPanel = screen.getByRole('region', { name: /Sun Pillar Detail/i });
    expect(detailPanel).toBeInTheDocument();
    expect(detailPanel).toHaveAttribute('id', 'pillar-detail-panel');
    expect(sunButton).toHaveAttribute('aria-controls', 'pillar-detail-panel');
    expect(detailPanel).toHaveTextContent(/Identity/i);
  });

  it('switches active pillar updated aria-expanded and detail panel content/label', () => {
    render(<HomePage />);

    const sunButton = screen.getByRole('button', { name: /Sun/i });
    const mercuryButton = screen.getByRole('button', { name: /Mercury/i });

    // Open Sun
    fireEvent.click(sunButton);
    expect(sunButton).toHaveAttribute('aria-expanded', 'true');
    expect(mercuryButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('region', { name: /Sun Pillar Detail/i })).toBeInTheDocument();

    // Switch to Mercury
    fireEvent.click(mercuryButton);
    expect(sunButton).toHaveAttribute('aria-expanded', 'false');
    expect(mercuryButton).toHaveAttribute('aria-expanded', 'true');

    const mercuryPanel = screen.getByRole('region', { name: /Mercury Pillar Detail/i });
    expect(mercuryPanel).toBeInTheDocument();
    expect(mercuryPanel).toHaveAttribute('id', 'pillar-detail-panel');
    expect(mercuryPanel).toHaveTextContent(/Communication/i);
  });

  it('closes active pillar on toggle click', () => {
    render(<HomePage />);

    const sunButton = screen.getByRole('button', { name: /Sun/i });

    // Open Sun
    fireEvent.click(sunButton);
    expect(sunButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region')).toBeInTheDocument();

    // Close Sun
    fireEvent.click(sunButton);
    expect(sunButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
