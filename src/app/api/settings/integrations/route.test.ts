import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";
import * as db from "@/lib/db";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  saveIntegration: vi.fn(),
  getIntegrations: vi.fn(),
  deleteIntegration: vi.fn(),
}));

describe("Integrations API", () => {
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue({ user: { email: mockEmail } });
  });

  describe("GET", () => {
    it("returns integrations for the user", async () => {
      const mockInts = [{ id: "1", name: "Slack", url: "http://slack.com", event: "audit.completed" }];
      (db.getIntegrations as any).mockResolvedValue(mockInts);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockInts);
    });
  });

  describe("POST", () => {
    it("creates a new integration", async () => {
      const payload = { name: "Zapier", url: "http://zap.com", event: "audit.completed" };
      const req = new Request("http://localhost/api/settings/integrations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(db.saveIntegration).toHaveBeenCalledWith(mockEmail, payload.name, payload.url, payload.event);
    });
  });

  describe("DELETE", () => {
    it("deletes an integration", async () => {
      const req = new Request("http://localhost/api/settings/integrations?id=1", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);
      expect(db.deleteIntegration).toHaveBeenCalledWith("1");
    });
  });
});
