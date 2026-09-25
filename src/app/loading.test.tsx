import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loading from "./loading";

describe("Loading Component", () => {
  it("renders loader and cosmic text", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Harmonizing digital frequencies\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/Realigning Signals/i)).toBeInTheDocument();
  });
});
