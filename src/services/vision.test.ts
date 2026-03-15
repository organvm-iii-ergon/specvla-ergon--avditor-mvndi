import { captureScreenshot } from "./vision";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn(),
  },
}));

import puppeteer from "puppeteer";

const mockLaunch = vi.mocked(puppeteer.launch);

describe("captureScreenshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null on error", async () => {
    mockLaunch.mockRejectedValue(new Error("Browser launch failed"));

    const result = await captureScreenshot("https://example.com");

    expect(result).toBeNull();
  });

  it("adds https:// to URLs missing protocol", async () => {
    const mockScreenshot = vi.fn().mockResolvedValue("base64data");
    const mockGoto = vi.fn().mockResolvedValue(undefined);
    const mockSetViewport = vi.fn().mockResolvedValue(undefined);
    const mockNewPage = vi.fn().mockResolvedValue({
      setViewport: mockSetViewport,
      goto: mockGoto,
      screenshot: mockScreenshot,
    });
    const mockClose = vi.fn().mockResolvedValue(undefined);

    mockLaunch.mockResolvedValue({
      newPage: mockNewPage,
      close: mockClose,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const result = await captureScreenshot("example.com");

    expect(mockGoto).toHaveBeenCalledWith("https://example.com", {
      waitUntil: "networkidle2",
      timeout: 15000,
    });
    expect(result).toBe("base64data");
    expect(mockClose).toHaveBeenCalled();
  });
});
