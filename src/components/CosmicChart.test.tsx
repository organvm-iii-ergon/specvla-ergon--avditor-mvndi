import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CosmicChart from "./CosmicChart";

// Mock recharts — ResponsiveContainer needs a sized parent in jsdom, which it never gets
vi.mock("recharts", () => ({
  ResponsiveContainer: function MockResponsiveContainer({ children }: { children: React.ReactNode }) {
    return <div data-testid="responsive-container">{children}</div>;
  },
  RadarChart: function MockRadarChart({ children }: { children: React.ReactNode }) {
    return <div data-testid="radar-chart">{children}</div>;
  },
  PolarGrid: function MockPolarGrid() {
    return <div data-testid="polar-grid" />;
  },
  PolarAngleAxis: function MockPolarAngleAxis() {
    return <div data-testid="polar-angle-axis" />;
  },
  PolarRadiusAxis: function MockPolarRadiusAxis() {
    return <div data-testid="polar-radius-axis" />;
  },
  Radar: function MockRadar() {
    return <div data-testid="radar" />;
  },
  Tooltip: function MockTooltip() {
    return <div data-testid="tooltip" />;
  },
}));

const defaultScores = {
  communication: 72,
  aesthetic: 58,
  drive: 43,
  structure: 85,
};

describe("CosmicChart", () => {
  it("renders without crashing", () => {
    const { container } = render(<CosmicChart scores={defaultScores} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders the ResponsiveContainer", () => {
    render(<CosmicChart scores={defaultScores} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders the RadarChart", () => {
    render(<CosmicChart scores={defaultScores} />);
    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
  });

  it("renders child chart components", () => {
    render(<CosmicChart scores={defaultScores} />);
    expect(screen.getByTestId("polar-grid")).toBeInTheDocument();
    expect(screen.getByTestId("polar-angle-axis")).toBeInTheDocument();
    expect(screen.getByTestId("radar")).toBeInTheDocument();
  });

  it("renders with zero scores without crashing", () => {
    render(<CosmicChart scores={{ communication: 0, aesthetic: 0, drive: 0, structure: 0 }} />);
    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
  });

  it("renders with maximum scores without crashing", () => {
    render(<CosmicChart scores={{ communication: 100, aesthetic: 100, drive: 100, structure: 100 }} />);
    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
  });

  it("renders with partial scores (some undefined-like zeros) without crashing", () => {
    render(
      <CosmicChart
        scores={{
          communication: 0,
          aesthetic: 50,
          drive: 0,
          structure: 75,
        }}
      />
    );
    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
  });

  it("renders outer wrapper div with expected dimensions style", () => {
    const { container } = render(<CosmicChart scores={defaultScores} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("100%");
    expect(wrapper.style.height).toBe("400px");
  });
});
