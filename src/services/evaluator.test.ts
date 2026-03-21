import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluateAudit } from "./evaluator";
import { generateText } from "ai";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("./aiModelFactory", () => ({
  createAIModel: vi.fn().mockReturnValue({}),
}));

describe("evaluator service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a passed result for a high quality audit", async () => {
    (generateText as any).mockResolvedValue({
      text: JSON.stringify({
        score: 90,
        feedback: "Excellent clarity and actionability.",
        passed: true,
      }),
    });

    const result = await evaluateAudit("Mock audit content");
    expect(result.score).toBe(90);
    expect(result.passed).toBe(true);
    expect(result.feedback).toBe("Excellent clarity and actionability.");
  });

  it("returns a failed result for a low quality audit", async () => {
    (generateText as any).mockResolvedValue({
      text: JSON.stringify({
        score: 40,
        feedback: "Too generic, lacking structure.",
        passed: false,
      }),
    });

    const result = await evaluateAudit("Poor audit content");
    expect(result.score).toBe(40);
    expect(result.passed).toBe(false);
  });

  it("fails safe if the AI service errors", async () => {
    (generateText as any).mockRejectedValue(new Error("AI Down"));

    const result = await evaluateAudit("Any content");
    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
  });
});
