import { describe, it, expect } from "vitest";
import { validateExternalUrl } from "./url-validator";

describe("validateExternalUrl", () => {
  it("accepts a valid HTTP URL and returns the canonicalized form", () => {
    const result = validateExternalUrl("http://example.com/path");
    expect(result).toBe("http://example.com/path");
  });

  it("accepts a valid HTTPS URL", () => {
    const result = validateExternalUrl("https://example.com");
    expect(result).toBe("https://example.com/");
  });

  it("prepends https:// when the scheme is missing", () => {
    const result = validateExternalUrl("example.com");
    expect(result).toContain("https://example.com");
  });

  it("prepends https:// when the scheme is missing for a path URL", () => {
    const result = validateExternalUrl("example.com/page");
    expect(result).toBe("https://example.com/page");
  });

  it("blocks localhost", () => {
    expect(() => validateExternalUrl("http://localhost/")).toThrow(
      "Loopback addresses are not allowed"
    );
  });

  it("blocks 127.0.0.1", () => {
    expect(() => validateExternalUrl("http://127.0.0.1/")).toThrow(
      "Loopback addresses are not allowed"
    );
  });

  it("blocks IPv6 loopback", () => {
    expect(() => validateExternalUrl("http://[::1]/")).toThrow(
      "Loopback addresses are not allowed"
    );
  });

  it("blocks 10.x.x.x (private range)", () => {
    expect(() => validateExternalUrl("http://10.0.0.1/")).toThrow(
      "Private IP addresses are not allowed"
    );
  });

  it("blocks 10.255.255.255 (private range upper boundary)", () => {
    expect(() => validateExternalUrl("http://10.255.255.255/")).toThrow(
      "Private IP addresses are not allowed"
    );
  });

  it("blocks 172.16.x.x (private range start)", () => {
    expect(() => validateExternalUrl("http://172.16.0.1/")).toThrow(
      "Private IP addresses are not allowed"
    );
  });

  it("blocks 172.31.x.x (private range end)", () => {
    expect(() => validateExternalUrl("http://172.31.255.255/")).toThrow(
      "Private IP addresses are not allowed"
    );
  });

  it("blocks 192.168.x.x (private range)", () => {
    expect(() => validateExternalUrl("http://192.168.1.1/")).toThrow(
      "Private IP addresses are not allowed"
    );
  });

  it("blocks 169.254.x.x (link-local)", () => {
    expect(() => validateExternalUrl("http://169.254.169.254/")).toThrow(
      "Link-local addresses are not allowed"
    );
  });

  it("blocks file:// URLs before scheme normalization", () => {
    expect(() => validateExternalUrl("file:///etc/passwd")).toThrow(
      "Only HTTP(S) URLs are allowed"
    );
  });

  it("blocks ftp:// URLs before scheme normalization", () => {
    expect(() => validateExternalUrl("ftp://example.com/file.txt")).toThrow(
      "Only HTTP(S) URLs are allowed"
    );
  });

  it("throws on an unparseable URL", () => {
    expect(() => validateExternalUrl("http://")).toThrow("Invalid URL");
  });

  it("allows a legitimate public IP address", () => {
    const result = validateExternalUrl("http://8.8.8.8/");
    expect(result).toBe("http://8.8.8.8/");
  });

  it("allows 172.15.x.x (just below the private 172 range)", () => {
    const result = validateExternalUrl("http://172.15.0.1/");
    expect(result).toBe("http://172.15.0.1/");
  });

  it("allows 172.32.x.x (just above the private 172 range)", () => {
    const result = validateExternalUrl("http://172.32.0.1/");
    expect(result).toBe("http://172.32.0.1/");
  });
});
