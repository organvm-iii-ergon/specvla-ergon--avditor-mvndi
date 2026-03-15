import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResultsPage from "./page";

vi.mock("@/components/ChatBox", () => ({
  default: function MockChatBox() {
    return <div data-testid="chatbox">Mock ChatBox</div>;
  },
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: function MockResponsiveContainer({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  RadarChart: function MockRadarChart() {
    return <div data-testid="radarchart">Mock RadarChart</div>;
  },
  PolarGrid: function MockPolarGrid() {
    return <div />;
  },
  PolarAngleAxis: function MockPolarAngleAxis() {
    return <div />;
  },
  PolarRadiusAxis: function MockPolarRadiusAxis() {
    return <div />;
  },
  Radar: function MockRadar() {
    return <div />;
  },
}));

global.fetch = vi.fn();

describe("ResultsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("shows error if no audit data in sessionStorage", async () => {
    render(<ResultsPage />);
    expect(
      await screen.findByText("No audit data found. Please start from the home page.")
    ).toBeInTheDocument();
  });

  it("shows error if API key is missing", async () => {
    sessionStorage.setItem(
      "current_audit_request",
      JSON.stringify({
        link: "test.com",
        businessType: "test",
        goals: "test",
      })
    );

    render(<ResultsPage />);
    expect(
      await screen.findByText(
        "API Key not found. Please configure it in settings."
      )
    ).toBeInTheDocument();
  });

  it("handles API errors", async () => {
    sessionStorage.setItem(
      "current_audit_request",
      JSON.stringify({
        link: "test.com",
        businessType: "test",
        goals: "test",
      })
    );

    localStorage.setItem("gemini_api_key", "test-key");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "API Rate Limit Exceeded" }),
    });

    render(<ResultsPage />);

    expect(await screen.findByText("API Rate Limit Exceeded")).toBeInTheDocument();
  });
});
