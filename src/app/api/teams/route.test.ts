import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import * as db from "@/lib/db";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  createTeam: vi.fn(),
  getTeamsByEmail: vi.fn(),
}));

describe("Teams API", () => {
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue({ user: { email: mockEmail } });
  });

  describe("GET", () => {
    it("returns teams for the user", async () => {
      const mockTeams = [{ id: "1", name: "Team A", ownerEmail: mockEmail }];
      (db.getTeamsByEmail as any).mockResolvedValue(mockTeams);

      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockTeams);
    });
  });

  describe("POST", () => {
    it("creates a new team", async () => {
      const payload = { name: "New Team" };
      (db.createTeam as any).mockResolvedValue({ id: "2", ...payload, ownerEmail: mockEmail });

      const req = new Request("http://localhost/api/teams", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe("New Team");
      expect(db.createTeam).toHaveBeenCalledWith("New Team", mockEmail);
    });
  });
});
