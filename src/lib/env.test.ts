import { describe, it, expect } from "vitest";
import { getEnvStatus, getConfiguredCount } from "./env";

describe("getEnvStatus", () => {
  it("returns an array of env statuses", () => {
    const statuses = getEnvStatus();
    expect(Array.isArray(statuses)).toBe(true);
    expect(statuses.length).toBeGreaterThan(0);
  });

  it("each status has required fields", () => {
    const statuses = getEnvStatus();
    for (const status of statuses) {
      expect(status).toHaveProperty("key");
      expect(status).toHaveProperty("label");
      expect(status).toHaveProperty("configured");
      expect(status).toHaveProperty("required");
      expect(status).toHaveProperty("category");
      expect(typeof status.key).toBe("string");
      expect(typeof status.label).toBe("string");
      expect(typeof status.configured).toBe("boolean");
      expect(typeof status.required).toBe("boolean");
      expect(typeof status.category).toBe("string");
    }
  });

  it("includes expected categories", () => {
    const statuses = getEnvStatus();
    const categories = new Set(statuses.map(s => s.category));
    expect(categories.has("database")).toBe(true);
    expect(categories.has("ai")).toBe(true);
    expect(categories.has("payments")).toBe(true);
  });
});

describe("getConfiguredCount", () => {
  it("returns correct shape", () => {
    const result = getConfiguredCount();
    expect(result).toHaveProperty("configured");
    expect(result).toHaveProperty("total");
    expect(typeof result.configured).toBe("number");
    expect(typeof result.total).toBe("number");
  });

  it("total matches getEnvStatus length", () => {
    const result = getConfiguredCount();
    const statuses = getEnvStatus();
    expect(result.total).toBe(statuses.length);
  });

  it("configured is less than or equal to total", () => {
    const result = getConfiguredCount();
    expect(result.configured).toBeLessThanOrEqual(result.total);
  });
});
