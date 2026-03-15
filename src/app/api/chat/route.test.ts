import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ai-sdk/google", () => ({
  google: vi.fn().mockReturnValue("mock-model"),
}));

vi.mock("ai", () => ({
  streamText: vi.fn().mockReturnValue({
    toTextStreamResponse: () => new Response("streamed text", { status: 200 }),
  }),
}));

import { POST } from "./route";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns streaming response for valid request", async () => {
    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Hello" }],
        auditContext: "Sample audit data",
      })
    );

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("streamed text");
    expect(streamText).toHaveBeenCalledOnce();
    expect(google).toHaveBeenCalledWith("gemini-1.5-flash");
  });

  it("passes auditContext into system prompt", async () => {
    const auditContext = "Business scores: SEO 85, Content 72";

    await POST(
      makeRequest({
        messages: [{ role: "user", content: "Explain my scores" }],
        auditContext,
      })
    );

    const call = vi.mocked(streamText).mock.calls[0][0];
    expect(call.system).toContain(auditContext);
    expect(call.model).toBe("mock-model");
    expect(call.messages).toEqual([{ role: "user", content: "Explain my scores" }]);
  });

  it("returns 500 on error", async () => {
    vi.mocked(streamText).mockImplementationOnce(() => {
      throw new Error("AI service unavailable");
    });

    const res = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Hello" }],
        auditContext: "data",
      })
    );

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("AI service unavailable");
  });
});
