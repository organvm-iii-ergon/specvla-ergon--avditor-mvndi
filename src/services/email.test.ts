import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn();

vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(),
}));

import { getConfig } from "@/lib/config";
import {
  sendAuditCompleteEmail,
  sendMonthlyDeltaEmail,
  sendLeadAlertEmail,
} from "./email";

const mockGetConfig = vi.mocked(getConfig);

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
  });

  describe("sendAuditCompleteEmail", () => {
    it("returns false when no API key is configured", async () => {
      mockGetConfig.mockReturnValue(null);

      const result = await sendAuditCompleteEmail(
        "user@example.com",
        "https://example.com/audit/123",
        { communication: 80, aesthetic: 70, drive: 90, structure: 60 }
      );

      expect(result).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("returns false when API key is placeholder", async () => {
      mockGetConfig.mockImplementation((key: string) => {
        if (key === "resendApiKey") return "re_test_placeholder";
        return null;
      });

      const result = await sendAuditCompleteEmail(
        "user@example.com",
        "https://example.com/audit/123",
        { communication: 80 }
      );

      expect(result).toBe(false);
    });

    it("returns true when email sends successfully", async () => {
      process.env.RESEND_API_KEY = "re_real_key";
      mockSend.mockResolvedValue({ id: "email-id" });
      mockGetConfig.mockImplementation((key: string) => {
        if (key === "emailFrom") return "test@example.com";
        if (key === "appName") return "Test App";
        return null;
      });

      const result = await sendAuditCompleteEmail(
        "user@example.com",
        "https://example.com/audit/123",
        { communication: 80, aesthetic: 70, drive: 90, structure: 60 }
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe("user@example.com");
      expect(callArgs.from).toBe("Test App <test@example.com>");
    });

    it("returns false and does not throw on send error", async () => {
      process.env.RESEND_API_KEY = "re_real_key";
      mockSend.mockRejectedValue(new Error("Send failed"));
      mockGetConfig.mockReturnValue(null);

      const result = await sendAuditCompleteEmail(
        "user@example.com",
        "https://example.com/audit/123",
        {}
      );

      expect(result).toBe(false);
    });
  });

  describe("sendMonthlyDeltaEmail", () => {
    it("returns false when no API key is configured", async () => {
      mockGetConfig.mockReturnValue(null);

      const result = await sendMonthlyDeltaEmail(
        "user@example.com",
        "https://example.com/audit/123",
        { communication: 85 },
        { communication: 70 }
      );

      expect(result).toBe(false);
    });

    it("returns false and does not throw on send error", async () => {
      process.env.RESEND_API_KEY = "re_real_key";
      mockSend.mockRejectedValue(new Error("Network error"));
      mockGetConfig.mockReturnValue(null);

      const result = await sendMonthlyDeltaEmail(
        "user@example.com",
        "https://example.com/audit/123",
        { communication: 85 },
        { communication: 70 }
      );

      expect(result).toBe(false);
    });
  });

  describe("sendLeadAlertEmail", () => {
    it("returns false when no Resend key is configured", async () => {
      mockGetConfig.mockReturnValue(null);

      const result = await sendLeadAlertEmail("lead@example.com", "audit-123");

      expect(result).toBe(false);
    });

    it("sends to admin email from config", async () => {
      process.env.RESEND_API_KEY = "re_real_key";
      mockSend.mockResolvedValue({ id: "email-id" });
      mockGetConfig.mockImplementation((key: string) => {
        if (key === "adminEmails") return "boss@example.com, other@example.com";
        if (key === "emailFrom") return "noreply@example.com";
        if (key === "appName") return "My App";
        return null;
      });

      const result = await sendLeadAlertEmail("lead@example.com", "audit-456");

      expect(result).toBe(true);
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe("boss@example.com");
      expect(callArgs.subject).toContain("lead@example.com");
    });

    it("returns false and does not throw on send error", async () => {
      process.env.RESEND_API_KEY = "re_real_key";
      mockSend.mockRejectedValue(new Error("API down"));
      mockGetConfig.mockReturnValue(null);

      const result = await sendLeadAlertEmail("lead@example.com");

      expect(result).toBe(false);
    });
  });
});
