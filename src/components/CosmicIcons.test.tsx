import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CosmicIcon, { ICON_PATHS } from "./CosmicIcons";

const iconTypes = ["mercury", "venus", "mars", "saturn", "hammer", "key", "eye"] as const;

describe("CosmicIcon", () => {
  it.each(iconTypes)("renders %s icon without crashing", (type) => {
    const { container } = render(<CosmicIcon type={type} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it.each(iconTypes)("renders %s icon with correct path data", (type) => {
    const { container } = render(<CosmicIcon type={type} />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute("d")).toBe(ICON_PATHS[type]);
  });

  it("applies custom size", () => {
    const { container } = render(<CosmicIcon type="mercury" size={48} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe("48px");
    expect(wrapper.style.height).toBe("48px");
  });

  it("applies custom className", () => {
    const { container } = render(<CosmicIcon type="venus" className="my-icon" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("my-icon");
  });

  it("renders SVG with viewBox", () => {
    const { container } = render(<CosmicIcon type="mars" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});
