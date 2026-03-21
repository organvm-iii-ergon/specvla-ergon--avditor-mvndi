import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuditCompare } from "./AuditCompare";
import type { AuditRecord } from "@/lib/db";

const makeAudit = (overrides: Partial<AuditRecord> = {}): AuditRecord => ({
  id: "test-id-1",
  userEmail: "user@example.com",
  link: "https://example.com",
  businessType: "SaaS",
  goals: "Grow signups",
  markdownAudit: "# Audit Report",
  scores: JSON.stringify({
    communication: 70,
    aesthetic: 55,
    drive: 40,
    structure: 80,
  }),
  createdAt: "2024-01-15T10:00:00Z",
  ...overrides,
});

const audit1 = makeAudit({
  id: "audit-1",
  link: "https://first.com",
  scores: JSON.stringify({ communication: 60, aesthetic: 50, drive: 35, structure: 70 }),
  createdAt: "2024-01-01T10:00:00Z",
});

const audit2 = makeAudit({
  id: "audit-2",
  link: "https://second.com",
  scores: JSON.stringify({ communication: 80, aesthetic: 65, drive: 55, structure: 90 }),
  createdAt: "2024-02-01T10:00:00Z",
});

describe("AuditCompare", () => {
  it("renders without crashing", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    expect(screen.getByText("Audit Comparison")).toBeInTheDocument();
  });

  it("shows links for both audits", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    expect(screen.getByText("https://first.com")).toBeInTheDocument();
    expect(screen.getByText("https://second.com")).toBeInTheDocument();
  });

  it("shows all four pillar labels", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    expect(screen.getAllByText("Communication")).toHaveLength(2); // once per column
    expect(screen.getAllByText("Aesthetic")).toHaveLength(2);
    expect(screen.getAllByText("Drive")).toHaveLength(2);
    expect(screen.getAllByText("Structure")).toHaveLength(2);
  });

  it("shows score values from audit1", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("shows score values from audit2", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("renders close button", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    const closeBtn = screen.getByRole("button", { name: /close comparison/i });
    expect(closeBtn).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    const closeBtn = screen.getByRole("button", { name: /close comparison/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("handles missing scores gracefully (defaults to 0)", () => {
    const onClose = vi.fn();
    const auditNoScores = makeAudit({ scores: "{}", link: "https://empty.com" });
    render(<AuditCompare audit1={auditNoScores} audit2={audit2} onClose={onClose} />);
    expect(screen.getByText("Audit Comparison")).toBeInTheDocument();
  });

  it("shows formatted date for audits", () => {
    const onClose = vi.fn();
    render(<AuditCompare audit1={audit1} audit2={audit2} onClose={onClose} />);
    // Jan 1, 2024
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
  });

  it("shows Unknown date when createdAt is missing", () => {
    const onClose = vi.fn();
    const auditNoDate = makeAudit({ createdAt: undefined, link: "https://nodate.com" });
    render(<AuditCompare audit1={auditNoDate} audit2={audit2} onClose={onClose} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
