import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(() => null),
  setConfig: vi.fn(),
  getAllConfig: vi.fn(() => ({})),
}));

import { GET, POST } from "./route";
import { auth } from "@/auth";
import * as configLib from "@/lib/config";

const mockAuth = vi.mocked(auth);
const mockGetConfig = vi.mocked(configLib.getConfig);
const mockSetConfig = vi.mocked(configLib.setConfig);
const mockGetAllConfig = vi.mocked(configLib.getAllConfig);

function makeGetRequest(search = ""): Request {
  return new Request(`http://localhost:3000/api/admin/config${search}`, {
    method: "GET",
  });
}

function makePostRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/admin/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/admin/config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: getConfig returns null so admin check falls back to default email
    mockGetConfig.mockReturnValue(null);
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
      user: { email: "notadmin@example.com", name: "Not Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("returns a specific config value when key param is provided", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "adminEmails") return null; // triggers default email
      if (key === "appName") return "Growth Auditor";
      return null;
    });

    const res = await GET(makeGetRequest("?key=appName"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.key).toBe("appName");
    expect(data.value).toBe("Growth Auditor");
  });

  it("returns all config with sensitive keys masked", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockGetConfig.mockReturnValue(null);
    mockGetAllConfig.mockReturnValue({
      appName: "Growth Auditor",
      geminiApiKey: "AIzaSyABCDEFGHIJKLMNOP",
      baseUrl: "http://localhost:3000",
    });

    const res = await GET(makeGetRequest());
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.appName).toBe("Growth Auditor");
    expect(data.baseUrl).toBe("http://localhost:3000");
    // Sensitive key should be masked
    expect(data.geminiApiKey).toMatch(/^AIza\*\*\*/);
    expect(data.geminiApiKey).not.toBe("AIzaSyABCDEFGHIJKLMNOP");
  });
});

describe("POST /api/admin/config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConfig.mockReturnValue(null);
  });

  it("returns 401 when not authenticated", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);

    const res = await POST(makePostRequest({ key: "appName", value: "Test" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not admin", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "notadmin@example.com", name: "Not Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await POST(makePostRequest({ key: "appName", value: "Test" }));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Admin access required");
  });

  it("returns 400 when key is missing", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const res = await POST(makePostRequest({ value: "Test" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Key is required");
  });

  it("updates config and returns success for admin", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "admin@growthauditor.ai", name: "Admin" },
      expires: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    mockSetConfig.mockReturnValue(undefined);

    const res = await POST(makePostRequest({ key: "appName", value: "My App" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.key).toBe("appName");
    expect(data.value).toBe("My App");
    expect(mockSetConfig).toHaveBeenCalledWith("appName", "My App");
  });
});
