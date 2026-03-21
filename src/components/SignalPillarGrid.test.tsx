import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SignalPillarGrid from "./SignalPillarGrid";

vi.mock("next/link", () => ({
  default: function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  },
}));

const defaultScores = {
  communication: 72,
  aesthetic: 58,
  drive: 43,
  structure: 85,
};

describe("SignalPillarGrid", () => {
  it("renders 4 pillar cards", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("shows all four pillar names", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    expect(screen.getByText("Mercury")).toBeInTheDocument();
    expect(screen.getByText("Venus")).toBeInTheDocument();
    expect(screen.getByText("Mars")).toBeInTheDocument();
    expect(screen.getByText("Saturn")).toBeInTheDocument();
  });

  it("shows score values for each pillar", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("58")).toBeInTheDocument();
    expect(screen.getByText("43")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("shows zero score when pillar key is missing", () => {
    render(<SignalPillarGrid scores={{}} />);
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(4);
  });

  it("shows pillar description after clicking a pillar", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    const mercuryButton = screen.getByText("Mercury").closest("button")!;
    fireEvent.click(mercuryButton);
    expect(screen.getByText("Mercury Analysis")).toBeInTheDocument();
    expect(screen.getByText("Deep Disclosure Required")).toBeInTheDocument();
  });

  it("shows description for clicked Venus pillar", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    const venusButton = screen.getByText("Venus").closest("button")!;
    fireEvent.click(venusButton);
    expect(screen.getByText("Venus Analysis")).toBeInTheDocument();
  });

  it("hides description when same pillar is clicked again", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    const marsButton = screen.getByText("Mars").closest("button")!;
    fireEvent.click(marsButton);
    expect(screen.getByText("Mars Analysis")).toBeInTheDocument();
    fireEvent.click(marsButton);
    expect(screen.queryByText("Mars Analysis")).not.toBeInTheDocument();
  });

  it("renders Unlock Strategy link pointing to /pricing", () => {
    render(<SignalPillarGrid scores={defaultScores} />);
    const saturnButton = screen.getByText("Saturn").closest("button")!;
    fireEvent.click(saturnButton);
    const link = screen.getByRole("link", { name: /unlock strategy/i });
    expect(link).toHaveAttribute("href", "/pricing");
  });
});
