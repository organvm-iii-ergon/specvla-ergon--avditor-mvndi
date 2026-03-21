import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TeamsPage from "./page";

// Mock fetch
global.fetch = vi.fn();

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: { user: { email: "test@example.com" } } })),
}));

describe("TeamsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders teams list", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: "1", name: "Alpha Team", ownerEmail: "test@example.com" }],
    });

    render(<TeamsPage />);
    expect(await screen.findByText("Alpha Team")).toBeInTheDocument();
  });

  it("creates a new team", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // Initial fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "2" }) }) // POST
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "2", name: "Beta Team", ownerEmail: "test@example.com" }] }); // Refetch

    render(<TeamsPage />);
    
    // Wait for loading to finish
    const input = await screen.findByPlaceholderText(/Team Name/i);
    const button = screen.getByText(/Manifest Team/i);

    fireEvent.change(input, { target: { value: "Beta Team" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Beta Team")).toBeInTheDocument();
    });
  });
});
