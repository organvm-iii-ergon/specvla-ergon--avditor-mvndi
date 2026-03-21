import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProBadge from "./ProBadge";

describe("ProBadge Component", () => {
  it("renders correctly with PRO text", () => {
    render(<ProBadge />);
    expect(screen.getByText(/PRO/i)).toBeInTheDocument();
    expect(screen.getByText(/✦/)).toBeInTheDocument();
  });
});
