import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("returns sitemap entries for all public routes", () => {
    const entries = sitemap();
    expect(entries).toBeInstanceOf(Array);

    const urls = entries.map((e) => e.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://specvla-ergon-avditor-mvndi.vercel.app";

    expect(urls).toContain(`${baseUrl}`);
    expect(urls).toContain(`${baseUrl}/about`);
    expect(urls).toContain(`${baseUrl}/compare`);
    expect(urls).toContain(`${baseUrl}/docs`);
    expect(urls).toContain(`${baseUrl}/examples`);
    expect(urls).toContain(`${baseUrl}/pricing`);
    expect(urls).toContain(`${baseUrl}/history`);
    expect(urls).toContain(`${baseUrl}/vault`);
  });
});
