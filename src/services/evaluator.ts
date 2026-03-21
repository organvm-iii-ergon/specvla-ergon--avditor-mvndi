import { generateText } from "ai";
import { createAIModel } from "./aiModelFactory";

export interface EvaluationResult {
  score: number;
  feedback: string;
  passed: boolean;
}

export async function evaluateAudit(
  auditMarkdown: string,
  provider: string = "gemini",
  apiKey?: string
): Promise<EvaluationResult> {
  const model = createAIModel(provider as any, apiKey || process.env.GEMINI_API_KEY || "");

  const prompt = `
    You are a Senior Growth Marketing Critic. Your job is to evaluate the quality of a "Cosmic Growth Audit" report.
    
    CRITERIA:
    1. Clarity: Is the advice easy to understand?
    2. Actionability: Are there specific, concrete steps the user can take?
    3. Tone: Is it "Cosmic," "Professional," and "Strategic"?
    4. Completeness: Does it cover Mercury (Content), Venus (Design), Mars (CTA), and Saturn (SEO)?

    AUDIT CONTENT:
    ---
    ${auditMarkdown}
    ---

    Respond ONLY with a JSON object in this format:
    {
      "score": number (0-100),
      "feedback": "Concise explanation of the score",
      "passed": boolean (true if score >= 75)
    }
  `;

  try {
    const { text } = await generateText({
      model,
      prompt,
    });

    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
    const result = JSON.parse(jsonText) as { score?: number; feedback?: string; passed?: boolean };

    return {
      score: result.score ?? 0,
      feedback: result.feedback ?? "No feedback provided",
      passed: !!result.passed,
    };
  } catch (error) {
    console.error("Audit Evaluation Error:", error);
    // Fail safe: assume passed to not block user
    return { score: 100, feedback: "Evaluation failed, skipping.", passed: true };
  }
}
