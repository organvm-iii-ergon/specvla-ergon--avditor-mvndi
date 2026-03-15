import { generateText } from "ai";
import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/services/scraper";
import { getCosmicAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import { getPageSpeedInsights } from "@/services/pagespeed";
import { saveAudit } from "@/lib/db";
import crypto from "crypto";
import { auth } from "@/auth";
import { createRateLimiter, getClientIP } from "@/lib/rate-limit";
import { createAIModel, type AIProviderType } from "@/services/aiModelFactory";

const rateLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

export async function POST(request: Request) {
  try {
    // 0. Rate limiting
    const ip = getClientIP(request);
    const { limited, remaining } = rateLimiter.check(ip);

    if (limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before generating more audits." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    void remaining; // Available for response headers if needed

    // 1. Extract API Key from Authorization header securely
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header. Please configure your API Key in Settings." }, { status: 401 });
    }

    const apiKey = authHeader.split(" ")[1]; // allow-secret

    // 2. Determine AI provider from header (defaults to gemini)
    const provider = (request.headers.get("X-AI-Provider") || "gemini") as AIProviderType;

    const { link, businessType, goals } = await request.json();

    if (!link || !businessType || !goals) {
      return NextResponse.json({ error: "Missing required fields: link, businessType, goals." }, { status: 400 });
    }

    const session = await auth();

    // 3. Fetch context in parallel to save time
    const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
      scrapeWebsite(link),
      captureScreenshot(link).catch(() => null), // Fail gracefully if puppeteer breaks
      getPageSpeedInsights(link).catch(() => null) // Fail gracefully if PageSpeed fails
    ]);

    // 4. Build prompt and call AI via Vercel AI SDK (multi-provider)
    const model = createAIModel(provider, apiKey); // allow-secret
    const prompt = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, seoData);

    type TextPart = { type: "text"; text: string };
    type ImagePart = { type: "image"; image: string; mimeType: "image/jpeg" };
    type ContentPart = TextPart | ImagePart;

    const contentParts: ContentPart[] = [
      { type: "text", text: prompt },
    ];

    if (screenshotBase64) {
      contentParts.push({
        type: "image",
        image: screenshotBase64,
        mimeType: "image/jpeg",
      });
    }

    const { text } = await generateText({
      model,
      messages: [{
        role: "user",
        content: contentParts,
      }],
    });

    let parsedResult;
    try {
      // Extract JSON from the response — some providers wrap it in markdown code fences
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
      parsedResult = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse AI JSON:", text);
      throw new Error("AI returned malformed JSON");
    }

    // 5. Save to database for Persistent History
    const auditId = crypto.randomUUID();

    try {
      await saveAudit({
        id: auditId,
        userEmail: session?.user?.email || undefined,
        link,
        businessType,
        goals,
        markdownAudit: parsedResult.markdownAudit,
        scores: JSON.stringify(parsedResult.scores || {})
      });
    } catch (dbError) {
      console.error("Failed to save audit to DB:", dbError);
      // We don't fail the request if DB fails, just log it
    }

    // Return the id, audit text, and scores to the client
    return NextResponse.json({
      id: auditId,
      audit: parsedResult.markdownAudit,
      scores: parsedResult.scores
    });
  } catch (error: unknown) {
    console.error("Audit Error:", error);

    // Map specific AI provider errors
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("rate")) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a moment before trying again." }, { status: 429 });
    }
    if (errorMessage.includes("API key not valid") || errorMessage.includes("401") || errorMessage.includes("Unauthorized") || errorMessage.includes("invalid x-api-key")) {
      return NextResponse.json({ error: "Invalid API Key. Please check your settings." }, { status: 401 });
    }
    if (errorMessage.includes("Safety")) {
      return NextResponse.json({ error: "The request was blocked by AI safety filters. Please try rephrasing your goals." }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected cosmic interference occurred. Failed to generate audit." }, { status: 500 });
  }
}
