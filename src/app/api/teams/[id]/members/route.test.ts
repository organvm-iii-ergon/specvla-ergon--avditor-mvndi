import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import * as db from "@/lib/db";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  addTeamMember: vi.fn(),
  getTeamMembers: vi.fn(),
}));

describe("Team Members API", () => {
  const mockEmail = "owner@example.com";
  const teamId = "team-123";

  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue({ user: { email: mockEmail } });
  });

  describe("GET", () => {
    it("returns members if user is a member", async () => {
      const mockMembers = [{ email: mockEmail, role: "owner" }];
      (db.getTeamMembers as any).mockResolvedValue(mockMembers);

      const res = await GET({} as any, { params: { id: teamId } });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockMembers);
    });

    it("returns 403 if user is not a member", async () => {
      (db.getTeamMembers as any).mockResolvedValue([{ email: "other@test.com", role: "owner" }]);

      const res = await GET({} as any, { params: { id: teamId } });
      expect(res.status).toBe(403);
    });
  });

  describe("POST", () => {
    it("adds a member if user is owner/admin", async () => {
      (db.getTeamMembers as any).mockResolvedValue([{ email: mockEmail, role: "owner" }]);

      const req = new Request(`http://localhost/api/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: "new@test.com", role: "member" }),
      });

      const res = await POST(req, { params: { id: teamId } });
      expect(res.status).toBe(200);
      expect(db.addTeamMember).toHaveBeenCalledWith(teamId, "new@test.com", "member");
    });

    it("returns 403 if user is just a member", async () => {
      (db.getTeamMembers as any).mockResolvedValue([{ email: mockEmail, role: "member" }]);

      const req = new Request(`http://localhost/api/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: "new@test.com" }),
      });

      const res = await POST(req, { params: { id: teamId } });
      expect(res.status).toBe(403);
    });
  });
});
