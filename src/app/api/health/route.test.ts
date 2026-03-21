import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import * as db from "@/lib/db";

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn(),
}));

describe("Health API", () => {
  it("returns 200 and healthy status if services are up", async () => {
    (db.getAudits as any).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.services.database).toBe("connected");
  });

  it("returns 500 and degraded status if database is down", async () => {
    (db.getAudits as any).mockRejectedValue(new Error("DB Connection Error"));
    const res = await GET();
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.status).toBe("degraded");
    expect(data.services.database).toBe("error");
  });
});
