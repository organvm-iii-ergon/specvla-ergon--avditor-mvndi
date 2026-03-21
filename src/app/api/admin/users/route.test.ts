import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn(),
  getAuditById: vi.fn(),
  deleteAudit: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(() => null),
}));

import { GET, DELETE } from "./route";
import { auth } from "@/auth";
import { getAudits, getAuditById, deleteAudit } from "@/lib/db";

const mockAuth = vi.mocked(auth);
const mockGetAudits = vi.mocked(getAudits);
const mockGetAuditById = vi.mocked(getAuditById);
const mockDeleteAudit = vi.mocked(deleteAudit);

function makeGetRequest(search = ""): Request {
  return new Request(`http://localhost:3000/api/admin/users${search}`, {
    method: "GET",
  });
}

function makeDeleteRequest(search = ""): Request {
  return new Request(`http://localhost:3000/api/admin/users${search}`, {
    method: "DELETE",
  });
}

const sampleAudits = [
  {
    id: "audit-1",
    userEmail: "alice@example.com",
    link: "https://alice.com",
    businessType: "SaaS",
    goals: "grow",
    markdownAudit: "audit content",
    scores: "{}",
    createdAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "audit-2",
    userEmail: "alice@example.com",
    link: "https://alice.com/page",
    businessType: "SaaS",
    goals: "convert",
    markdownAudit: "audit content 2",
    scores: "{}",
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "audit-3",
    userEmail: "bob@example.com",
    link: "https://bob.com",
    businessType: "Agency",
    goals: "leads",
    markdownAudit: "audit content 3",
    scores: "{}",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not admin", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "nobody@example.com", name: "Nobody" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("returns user data aggregated from audits when action=users", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetAudits.mockResolvedValue(sampleAudits as any);

    const res = await GET(makeGetRequest("?action=users"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users).toHaveLength(2);

    const alice = data.users.find((u: { email: string }) => u.email === "alice@example.com");
    expect(alice).toBeDefined();
    expect(alice.auditCount).toBe(2);
    expect(alice.firstAudit).toBe("2026-01-10T00:00:00Z");
    expect(alice.lastAudit).toBe("2026-02-15T00:00:00Z");

    const bob = data.users.find((u: { email: string }) => u.email === "bob@example.com");
    expect(bob).toBeDefined();
    expect(bob.auditCount).toBe(1);
  });

  it("returns a single audit when action=audit and id is provided", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetAuditById.mockResolvedValue(sampleAudits[0] as any);

    const res = await GET(makeGetRequest("?action=audit&id=audit-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.audit).toBeDefined();
    expect(data.audit.id).toBe("audit-1");
    expect(mockGetAuditById).toHaveBeenCalledWith("audit-1");
  });

  it("returns 400 when action=audit but no id is provided", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await GET(makeGetRequest("?action=audit"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Audit ID required");
  });

  it("returns paginated audits list when no action is specified", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockGetAudits.mockResolvedValue(sampleAudits as any);

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.audits).toHaveLength(3);
    expect(data.total).toBe(3);
  });
});

describe("DELETE /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);

    const res = await DELETE(makeDeleteRequest("?id=audit-1"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not admin", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "nobody@example.com", name: "Nobody" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await DELETE(makeDeleteRequest("?id=audit-1"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("returns 400 when no id is provided", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await DELETE(makeDeleteRequest());
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Audit ID required");
  });

  it("deletes the audit and returns success for admin", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockDeleteAudit.mockResolvedValue(undefined);

    const res = await DELETE(makeDeleteRequest("?id=audit-1"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteAudit).toHaveBeenCalledWith("audit-1");
  });
});
