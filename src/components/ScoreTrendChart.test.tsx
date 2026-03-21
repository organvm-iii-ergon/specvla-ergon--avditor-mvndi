import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ScoreTrendChart from "./ScoreTrendChart";

// Mock ResponsiveContainer as it needs a DOM with size which JSDOM doesn't provide
vi.mock("recharts", async () => {
  const OriginalModule = await import("recharts");
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

describe("ScoreTrendChart Component", () => {
  const mockData = [
    {
      date: "2026-03-01T12:00:00Z",
      scores: { communication: 70, aesthetic: 75, drive: 60, structure: 80 },
    },
    {
      date: "2026-03-15T12:00:00Z",
      scores: { communication: 85, aesthetic: 80, drive: 75, structure: 90 },
    },
  ];

  it("renders without crashing with valid data", () => {
    const { container } = render(<ScoreTrendChart data={mockData as any} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("returns null if no data provided", () => {
    const { container } = render(<ScoreTrendChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
