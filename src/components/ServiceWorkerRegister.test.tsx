import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import * as shadersModule from "@/lib/shaders";

describe("ServiceWorkerRegister component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders null without crashing", () => {
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.firstChild).toBeNull();
  });

  it("calls cacheShaderSource on mount", () => {
    const cacheSpy = vi.spyOn(shadersModule, "cacheShaderSource").mockResolvedValue(true);

    render(<ServiceWorkerRegister />);

    expect(cacheSpy).toHaveBeenCalled();
  });

  it("registers service worker when available on load", async () => {
    const registerMock = vi.fn().mockResolvedValue({ scope: "/" });

    Object.defineProperty(navigator, "serviceWorker", {
      value: { register: registerMock },
      configurable: true,
      writable: true,
    });

    render(<ServiceWorkerRegister />);

    window.dispatchEvent(new Event("load"));

    expect(registerMock).toHaveBeenCalledWith("/sw.js");
  });
});
