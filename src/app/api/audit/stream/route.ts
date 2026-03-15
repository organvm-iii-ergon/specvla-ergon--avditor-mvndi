import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { scrapeWebsite } from "@/services/scraper";
import { getStreamingAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import { getPageSpeedInsights } from "@/services/pagespeed";
import { saveAudit } from "@/lib/db";
import crypto from "crypto";
import { auth } from "@/auth";
import { createRateLimiter, getClientIP } from "@/lib/rate-limit";

const rateLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

export async function POST(request: Request) {
  try {
    // 0. Rate limiting
    const ip = getClientIP(request);
    const { limited, remaining } = rateLimiter.check(ip);

    if (limited) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait before generating more audits." }),
        { status: 429, headers: { "Content-Type": "application/json", "X-RateLimit-Remaining": "0" } }
      );
    }

    void remaining;

    // 1. Extract API Key from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header. Please configure your Gemini API Key in Settings." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const geminiKey = authHeader.split(" ")[1];

    const { link, businessType, goals } = await request.json();

    if (!link || !businessType || !goals) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: link, businessType, goals." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = await auth();

    // 2. Fetch context in parallel
    const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
      scrapeWebsite(link),
      captureScreenshot(link).catch(() => null),
      getPageSpeedInsights(link).catch(() => null),
    ]);

    void screenshotBase64; // Vision not used with streamText (text-only prompt)

    // 3. Build prompt for streaming markdown output
    const prompt = getStreamingAuditPrompt(link, businessType, goals, scrapedContent, seoData);

    // 4. Stream the audit using Vercel AI SDK
    const result = streamText({
      model: createGoogleGenerativeAI({ apiKey: geminiKey })("gemini-1.5-flash"), // allow-secret
      prompt,
      onFinish: async ({ text }) => {
        // Save audit to DB in background after stream completes
        const auditId = crypto.randomUUID();
        const scores = parseScoresFromText(text);

        try {
          await saveAudit({
            id: auditId,
            userEmail: session?.user?.email || undefined,
            link,
            businessType,
            goals,
            markdownAudit: text,
            scores: JSON.stringify(scores || {}),
          });
        } catch (dbError) {
          console.error("Failed to save streamed audit to DB:", dbError);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Streaming Audit Error:", error);

    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before trying again." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    if (errorMessage.includes("API key not valid") || errorMessage.includes("401")) {
      return new Response(
        JSON.stringify({ error: "Invalid Gemini API Key. Please check your settings." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (errorMessage.includes("Safety")) {
      return new Response(
        JSON.stringify({ error: "The request was blocked by AI safety filters. Please try rephrasing your goals." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "An unexpected cosmic interference occurred. Failed to generate audit." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function parseScoresFromText(text: string): Record<string, number> | null {
  const scoresMatch = text.match(/## Scores[\s\S]*$/);
  if (!scoresMatch) return null;
  const scores: Record<string, number> = {};
  const lines = scoresMatch[0].split("\n");
  for (const line of lines) {
    const match = line.match(/(\w+):\s*(\d+)/);
    if (match) {
      const key = match[1].toLowerCase();
      scores[key] = parseInt(match[2], 10);
    }
  }
  return Object.keys(scores).length >= 4 ? scores : null;
}
