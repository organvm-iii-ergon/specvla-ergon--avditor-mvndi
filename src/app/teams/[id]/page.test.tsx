import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TeamDetailsPage from "./page";

// Mock fetch
global.fetch = vi.fn();

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: { user: { email: "owner@example.com" } } })),
}));

describe("TeamDetailsPage", () => {
  const params = { id: "team-123" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders member list", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: "m1", email: "owner@example.com", role: "owner" }],
    });

    render(<TeamDetailsPage params={params} />);
    expect(await screen.findByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByText("OWNER")).toBeInTheDocument();
  });

  it("invites a new member", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "m1", email: "owner@example.com", role: "owner" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [
        { id: "m1", email: "owner@example.com", role: "owner" },
        { id: "m2", email: "new@test.com", role: "member" }
      ] });

    render(<TeamDetailsPage params={params} />);
    
    // Wait for loading to finish
    const input = await screen.findByPlaceholderText(/colleague@example.com/i);
    const button = screen.getByText(/Add to Team/i);

    fireEvent.change(input, { target: { value: "new@test.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("new@test.com")).toBeInTheDocument();
    });
  });
});
