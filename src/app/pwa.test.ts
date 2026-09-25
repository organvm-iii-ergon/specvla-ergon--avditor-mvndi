import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA shell, manifest, and service worker files", () => {
  const publicDir = path.resolve(process.cwd(), "public");

  it("has valid manifest.json with required PWA fields", () => {
    const manifestPath = path.join(publicDir, "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    expect(manifest.name).toBe("Avditor Mvndi");
    expect(manifest.short_name).toBe("Avditor");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.theme_color).toBe("#090a0f");
    expect(manifest.background_color).toBe("#090a0f");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  it("has generated cosmic icons in public/", () => {
    expect(fs.existsSync(path.join(publicDir, "icon-192.png"))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, "icon-512.png"))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, "apple-touch-icon.png"))).toBe(true);
  });

  it("has public/sw.js service worker with asset precaching", () => {
    const swPath = path.join(publicDir, "sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, "utf-8");
    expect(swContent).toContain("PRECACHE_ASSETS");
    expect(swContent).toContain("/offline.html");
    expect(swContent).toContain("/manifest.json");
    expect(swContent).toContain("fetch");
  });

  it("has public/offline.html and public/shaders/spacetime.glsl", () => {
    expect(fs.existsSync(path.join(publicDir, "offline.html"))).toBe(true);
    expect(fs.existsSync(path.join(publicDir, "shaders", "spacetime.glsl"))).toBe(true);
  });
});
