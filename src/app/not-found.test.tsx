import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "./not-found";

describe("NotFound Component", () => {
  it("renders 404 header and return link", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Coordinates Unreachable")).toBeInTheDocument();
    expect(screen.getByText(/Signal Lost in Void/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Return to Command/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });
});
