import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PricingPage from "./page";

// Mock fetch
global.fetch = vi.fn();

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: { user: { email: "test@example.com" } } })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PricingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pricing plans", () => {
    render(<PricingPage />);
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
  });

  it("triggers stripe checkout on button click", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://stripe.com/checkout" }),
    });

    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: "" } as any;

    render(<PricingPage />);
    const proButton = screen.getByText(/Manifest Pro/i);
    fireEvent.click(proButton);

    await vi.waitFor(() => {
      expect(window.location.href).toBe("https://stripe.com/checkout");
    });

    window.location = originalLocation;
  });
});
