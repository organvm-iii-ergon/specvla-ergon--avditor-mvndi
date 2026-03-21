import { describe, it, expect } from "vitest";
import { getConfig, setConfig, getAllConfig, deleteConfig } from "./config";

describe("config lib", () => {
  it("returns null for non-existent key", () => {
    const result = getConfig("totally_nonexistent_key_xyz_999");
    expect(result).toBeNull();
  });

  it("stores a value with setConfig that getConfig can retrieve", () => {
    const key = `test_key_${Date.now()}`;
    const value = "test_value_42";

    setConfig(key, value);
    const result = getConfig(key);
    expect(result).toBe(value);

    // Clean up
    deleteConfig(key);
  });

  it("overwrites an existing value with setConfig", () => {
    const key = `test_overwrite_${Date.now()}`;

    setConfig(key, "first");
    expect(getConfig(key)).toBe("first");

    setConfig(key, "second");
    expect(getConfig(key)).toBe("second");

    // Clean up
    deleteConfig(key);
  });

  it("returns all config entries as a key-value object via getAllConfig", () => {
    const all = getAllConfig();

    expect(typeof all).toBe("object");
    expect(all).not.toBeNull();
    // Default seeds should be present
    expect(all).toHaveProperty("authPassword");
    expect(all).toHaveProperty("appName");
    expect(all).toHaveProperty("baseUrl");
  });

  it("deleteConfig removes a key", () => {
    const key = `test_delete_${Date.now()}`;
    setConfig(key, "to_be_deleted");
    expect(getConfig(key)).toBe("to_be_deleted");

    deleteConfig(key);
    expect(getConfig(key)).toBeNull();
  });

  it("deleteConfig on non-existent key does not throw", () => {
    expect(() => deleteConfig("nonexistent_key_for_delete_test")).not.toThrow();
  });

  it("seeds default config values", () => {
    const all = getAllConfig();

    expect(all.authPassword).toBe("cosmic");
    expect(all.posthogHost).toBe("https://us.i.posthog.com");
    expect(all.adminEmails).toBe("admin@growthauditor.ai");
    expect(all.enableSubscriptions).toBe("false");
    expect(all.enableMonthlyAudits).toBe("true");
    expect(all.emailFrom).toBe("hello@growthauditor.ai");
    expect(all.appName).toBe("Growth Auditor");
    expect(all.appTagline).toBe("Cosmic Strategy & Digital Alignment");
    expect(all.primaryColor).toBe("#7000ff");
    expect(all.accentColor).toBe("#00d4ff");
    expect(all.baseUrl).toBe("http://localhost:3000");
  });

  it("getAllConfig includes dynamically added keys", () => {
    const key = `test_dynamic_${Date.now()}`;
    setConfig(key, "dynamic_value");

    const all = getAllConfig();
    expect(all[key]).toBe("dynamic_value");

    // Clean up
    deleteConfig(key);
  });
});
