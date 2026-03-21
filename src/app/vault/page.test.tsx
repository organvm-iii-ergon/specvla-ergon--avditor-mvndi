import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VaultPage from "./page";
import { useSession } from "next-auth/react";

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

describe("VaultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows locked state for non-pro users", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { isPro: false } } } as any);

    render(<VaultPage />);
    expect(screen.getByText(/The Vault is Locked/i)).toBeInTheDocument();
  });

  it("shows resources for pro users", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { isPro: true } } } as any);

    render(<VaultPage />);
    expect(screen.getByText(/The Growth Vault/i)).toBeInTheDocument();
    expect(screen.getByText(/evocative Copywriting Framework/i)).toBeInTheDocument();
  });
});
