import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn((handler) => handler),
}));

import middleware, { config } from "./middleware";

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports correct route matcher config", () => {
    expect(config.matcher).toEqual([
      "/admin/:path*",
      "/settings/schedules/:path*",
      "/teams/:path*",
    ]);
  });

  it("redirects unauthenticated users accessing protected routes to sign-in", () => {
    const protectedPaths = [
      "/admin",
      "/admin/analytics",
      "/settings/schedules",
      "/settings/schedules/123",
      "/teams",
      "/teams/456",
    ];

    for (const pathname of protectedPaths) {
      const mockReq = {
        nextUrl: {
          pathname,
          origin: "https://example.com",
        },
        auth: null,
      };

      const response = middleware(mockReq as any, {} as any);
      expect(response).toBeInstanceOf(Response);
      expect((response as Response).status).toBe(302);
      expect((response as Response).headers.get("Location")).toBe(
        `https://example.com/api/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`
      );
    }
  });

  it("allows authenticated users accessing protected routes", () => {
    const mockReq = {
      nextUrl: {
        pathname: "/admin",
        origin: "https://example.com",
      },
      auth: { user: { email: "admin@example.com" } },
    };

    const response = middleware(mockReq as any, {} as any);
    expect(response).toBeUndefined();
  });

  it("allows unauthenticated users accessing non-protected routes", () => {
    const mockReq = {
      nextUrl: {
        pathname: "/pricing",
        origin: "https://example.com",
      },
      auth: null,
    };

    const response = middleware(mockReq as any, {} as any);
    expect(response).toBeUndefined();
  });
});
