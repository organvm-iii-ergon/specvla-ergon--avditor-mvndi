import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("returns correct robots configuration", () => {
    const config = robots();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://specvla-ergon-avditor-mvndi.vercel.app";

    expect(config.sitemap).toBe(`${baseUrl}/sitemap.xml`);
    expect(config.rules).toEqual([
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin", "/api/", "/api"],
      },
    ]);
  });
});
