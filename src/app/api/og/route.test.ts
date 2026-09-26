import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /api/og", () => {
  it("returns an ImageResponse with 200 status and image content-type", async () => {
    const req = new NextRequest("http://localhost:3000/api/og?score=95&domain=test.com");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("handles request with default parameters", async () => {
    const req = new NextRequest("http://localhost:3000/api/og");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});
