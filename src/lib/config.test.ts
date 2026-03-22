import { describe, it, expect, vi, beforeEach } from "vitest";
import { getConfig, getAllConfig, setConfig, deleteConfig } from "./config";

describe("config lib", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns default value for known key", () => {
    expect(getConfig("appName")).toBe("Growth Auditor");
  });

  it("returns null for unknown key", () => {
    expect(getConfig("nonexistentKey")).toBeNull();
  });

  it("returns default admin email", () => {
    expect(getConfig("adminEmails")).toBe("admin@growthauditor.ai");
  });

  it("prefers environment variable over default", () => {
    vi.stubEnv("ADMIN_EMAILS", "custom@example.com");
    expect(getConfig("adminEmails")).toBe("custom@example.com");
  });

  it("getAllConfig returns all defaults", () => {
    const config = getAllConfig();
    expect(config.appName).toBe("Growth Auditor");
    expect(config.primaryColor).toBe("#7000ff");
    expect(config.accentColor).toBe("#00d4ff");
  });

  it("getAllConfig includes env var overrides", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "My Custom App");
    const config = getAllConfig();
    expect(config.appName).toBe("My Custom App");
  });

  it("setConfig is a no-op in env-var mode", () => {
    setConfig("appName", "New Name");
    expect(getConfig("appName")).toBe("Growth Auditor");
  });

  it("deleteConfig is a no-op in env-var mode", () => {
    deleteConfig("appName");
    expect(getConfig("appName")).toBe("Growth Auditor");
  });
});
