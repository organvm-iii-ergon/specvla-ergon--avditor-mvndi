import { generateText } from "ai";
import { createAIModel, type AIProvider } from "./aiModelFactory";
import { getCosmicAuditPrompt } from "./promptTemplates";
import { evaluateAudit } from "./evaluator";
import { scrapeWebsite } from "./scraper";
import { captureScreenshot } from "./vision";
import { getPageSpeedInsights } from "./pagespeed";

export interface OrchestratedAuditRequest {
  link: string;
  businessType: string;
  goals: string;
  provider: AIProvider;
  auth: string;
  isPro: boolean;
  language?: string;
}

export interface OrchestratedAuditResponse {
  markdownAudit: string;
  scores: any;
  evaluationScore: number;
  iterations: number;
}

/**
 * THE SUBMERGED ORCHESTRATOR
 * Implements the Deep-Disclosure Covenant by handling 90% of the 
 * audit complexity beneath the API surface.
 */
export async function orchestrateCosmicAudit(
  data: OrchestratedAuditRequest
): Promise<OrchestratedAuditResponse> {
  const credential = data.auth; // allow-secret
  const isPro = data.isPro;

  // 1. Submerged Context Gathering (Parallel)
  const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
    scrapeWebsite(data.link, isPro ? 3 : 1),
    captureScreenshot(data.link).catch(() => null),
    getPageSpeedInsights(data.link).catch(() => null),
  ]);

  const model = createAIModel(data.provider, credential);
  const prompt = getCosmicAuditPrompt(data.link, data.businessType, data.goals, scrapedContent, seoData, data.language);

  // 2. Initial Generation
  let { text } = await generateText({
    model,
    messages: [{
      role: "user",
      content: [
        { type: "text" as const, text: prompt },
        ...(screenshotBase64 ? [{ type: "image" as const, image: screenshotBase64 }] : [])
      ],
    }],
  });

  let parsedResult = parseAIResponse(text);
  let iterations = 1;

  // 3. Latent Evaluation Loop (LLM-as-a-Judge)
  // Submerged logic: The user never sees this struggle for alignment.
  const evaluation = await evaluateAudit(parsedResult.markdownAudit, data.provider, credential);
  
  if (!evaluation.passed && iterations < 2) {
    const retryPrompt = `${prompt}\n\nREFINEMENT NEEDED: Previous attempt scored ${evaluation.score}/100. Feedback: ${evaluation.feedback}. Align more deeply.`;
    
    const retryResult = await generateText({
      model,
      messages: [{
        role: "user",
        content: [{ type: "text" as const, text: retryPrompt }],
      }],
    });

    parsedResult = parseAIResponse(retryResult.text);
    iterations++;
  }

  return {
    ...parsedResult,
    evaluationScore: evaluation.score,
    iterations,
  };
}

function parseAIResponse(text: string) {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonText);
  } catch {
    console.error("Failed to parse submerged AI response:", text);
    throw new Error("Alignment failed: The stars returned malformed data.");
  }
}
