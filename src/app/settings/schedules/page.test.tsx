import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SchedulesPage from "./page";

// Mock fetch
global.fetch = vi.fn();

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: { user: { email: "test@example.com", isPro: true } } })),
}));

describe("SchedulesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders schedules list", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [{ id: "1", link: "https://test.com", businessType: "SaaS", frequency: "monthly", enabled: true }],
    });

    render(<SchedulesPage />);
    expect(await screen.findByText("https://test.com")).toBeInTheDocument();
    
    // Check for "Monthly" in the list items specifically
    const manifestList = screen.getByText(/Your Manifestations/i).nextElementSibling;
    expect(manifestList).toHaveTextContent(/Monthly/);
  });

  it("adds a new schedule", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fetchSchedules
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // fetchTeams
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "2" }) }) // POST
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: "2", link: "https://new.com", businessType: "Agency", frequency: "weekly", enabled: true }] }); // Refetch

    render(<SchedulesPage />);
    
    // Wait for loading
    const linkInput = await screen.findByLabelText(/Website or Social Link/i);
    
    fireEvent.change(linkInput, { target: { value: "https://new.com" } });
    fireEvent.change(screen.getByLabelText(/Business Type/i), { target: { value: "Agency" } });
    fireEvent.change(screen.getByLabelText(/Growth Goals/i), { target: { value: "Growth" } });
    
    fireEvent.click(screen.getByText(/Manifest Schedule/i));

    await waitFor(() => {
      expect(screen.getByText("https://new.com")).toBeInTheDocument();
    });
  });
});
