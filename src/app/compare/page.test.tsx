import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ComparePage from "./page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return { push: mockPush };
  },
}));

describe("ComparePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("renders with 2 URL inputs", () => {
    render(<ComparePage />);
    expect(screen.getByText("Competitor Analysis")).toBeInTheDocument();
    expect(screen.getByLabelText("URL 1")).toBeInTheDocument();
    expect(screen.getByLabelText("URL 2")).toBeInTheDocument();
    expect(screen.queryByLabelText("URL 3")).not.toBeInTheDocument();
  });

  it("adds a third URL input when clicking Add URL 3", () => {
    render(<ComparePage />);
    const addButton = screen.getByRole("button", { name: /Add URL 3/i });
    fireEvent.click(addButton);
    expect(screen.getByLabelText("URL 3")).toBeInTheDocument();
  });

  it("removes the third URL input when clicking Remove", () => {
    render(<ComparePage />);
    fireEvent.click(screen.getByRole("button", { name: /Add URL 3/i }));
    expect(screen.getByLabelText("URL 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Remove/i }));
    expect(screen.queryByLabelText("URL 3")).not.toBeInTheDocument();
  });

  it("shows error if API key is missing on submit", () => {
    render(<ComparePage />);
    fireEvent.change(screen.getByLabelText("URL 1"), { target: { value: "site1.com" } });
    fireEvent.change(screen.getByLabelText("URL 2"), { target: { value: "site2.com" } });
    fireEvent.change(screen.getByLabelText("Domain / Niche"), { target: { value: "SaaS" } });
    fireEvent.change(screen.getByLabelText("Target Manifestation"), { target: { value: "Growth" } });

    fireEvent.click(screen.getByRole("button", { name: /Run Comparison/i }));

    expect(screen.getByText("Please configure your AI provider API key in Settings first.")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("stores data in sessionStorage and navigates on valid submit", () => {
    localStorage.setItem("gemini_api_key", "test-key");
    render(<ComparePage />);

    fireEvent.change(screen.getByLabelText("URL 1"), { target: { value: "site1.com" } });
    fireEvent.change(screen.getByLabelText("URL 2"), { target: { value: "site2.com" } });
    fireEvent.change(screen.getByLabelText("Domain / Niche"), { target: { value: "SaaS" } });
    fireEvent.change(screen.getByLabelText("Target Manifestation"), { target: { value: "Growth" } });

    fireEvent.click(screen.getByRole("button", { name: /Run Comparison/i }));

    expect(mockPush).toHaveBeenCalledWith("/compare/results");
    const stored = JSON.parse(sessionStorage.getItem("compare_request")!);
    expect(stored.urls).toEqual(["site1.com", "site2.com"]);
    expect(stored.businessType).toBe("SaaS");
    expect(stored.goals).toBe("Growth");
  });
});
