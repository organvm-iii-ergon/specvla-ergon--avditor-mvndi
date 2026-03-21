import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getIntegrations: vi.fn().mockResolvedValue([]),
}));

import { getConfig } from "@/lib/config";
import { sendWebhook, sendAuditWebhook, sendLeadWebhook } from "./webhook";

const mockGetConfig = vi.mocked(getConfig);

describe("webhook service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("sendWebhook", () => {
    it("returns false when no webhookUrl is configured", async () => {
      mockGetConfig.mockReturnValue(null);

      const result = await sendWebhook({
        event: "audit.completed",
        timestamp: new Date().toISOString(),
        data: { id: "test-123" },
      });

      expect(result).toBe(false);
      expect(mockGetConfig).toHaveBeenCalledWith("webhookUrl");
    });

    it("returns false when webhookUrl is empty string", async () => {
      mockGetConfig.mockReturnValue("");

      const result = await sendWebhook({
        event: "audit.completed",
        timestamp: new Date().toISOString(),
        data: { id: "test-123" },
      });

      expect(result).toBe(false);
    });

    it("sends POST to configured URL with correct headers", async () => {
      mockGetConfig.mockReturnValue("https://hooks.example.com/webhook");

      const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      const payload = {
        event: "audit.completed" as const,
        timestamp: "2026-03-15T00:00:00.000Z",
        data: { id: "test-123", link: "https://example.com" },
      };

      const result = await sendWebhook(payload);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledOnce();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("https://hooks.example.com/webhook");
      expect(options?.method).toBe("POST");
      expect((options?.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json"
      );
      expect((options?.headers as Record<string, string>)["User-Agent"]).toBe(
        "GrowthAuditor/1.0"
      );
      expect(
        (options?.headers as Record<string, string>)["X-Webhook-Event"]
      ).toBe("audit.completed");
      expect(JSON.parse(options?.body as string)).toEqual(payload);
    });

    it("returns false on non-ok response", async () => {
      mockGetConfig.mockReturnValue("https://hooks.example.com/webhook");

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" })
      );

      const result = await sendWebhook({
        event: "lead.captured",
        timestamp: new Date().toISOString(),
        data: { email: "test@example.com" },
      });

      expect(result).toBe(false);
    });

    it("returns false on fetch error", async () => {
      mockGetConfig.mockReturnValue("https://hooks.example.com/webhook");

      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Network error")
      );

      const result = await sendWebhook({
        event: "audit.completed",
        timestamp: new Date().toISOString(),
        data: { id: "test-123" },
      });

      expect(result).toBe(false);
    });
  });

  describe("sendAuditWebhook", () => {
    it("wraps audit data in correct payload format", async () => {
      mockGetConfig.mockReturnValue("https://hooks.example.com/webhook");

      const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      const auditData = {
        id: "audit-456",
        link: "https://example.com",
        businessType: "SaaS",
        goals: "Increase conversions",
        scores: { communication: 85, aesthetic: 72 },
        userEmail: "user@example.com",
      };

      const result = await sendAuditWebhook(auditData);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledOnce();

      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(body.event).toBe("audit.completed");
      expect(body.timestamp).toBeDefined();
      expect(body.data).toEqual(auditData);
    });
  });

  describe("sendLeadWebhook", () => {
    it("wraps lead data in correct payload format", async () => {
      mockGetConfig.mockReturnValue("https://hooks.example.com/webhook");

      const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );

      const leadData = {
        email: "lead@example.com",
        auditId: "audit-789",
        source: "audit_gate",
      };

      const result = await sendLeadWebhook(leadData);

      expect(result).toBe(true);

      const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(body.event).toBe("lead.captured");
      expect(body.timestamp).toBeDefined();
      expect(body.data).toEqual(leadData);
    });
  });
});
