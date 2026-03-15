import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/services/scraper";
import { getCosmicAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import { getPageSpeedInsights } from "@/services/pagespeed";
import { saveAudit } from "@/lib/db";
import crypto from "crypto";
import { auth } from "@/auth";
import { LRUCache } from "lru-cache";

// Simple IP-based rate limiter (5 per hour)
const rateLimit = new LRUCache({
  max: 500, // max 500 IPs
  ttl: 1000 * 60 * 60, // 1 hour
});

export async function POST(request: Request) {
  try {
    // 0. Rate limiting (using a generic IP if headers fail)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const currentUsage = (rateLimit.get(ip) as number) || 0;
    
    if (currentUsage >= 5) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait before generating more audits." }, { status: 429 });
    }
    rateLimit.set(ip, currentUsage + 1);

    // 1. Extract API Key from Authorization header securely
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header. Please configure your Gemini API Key in Settings." }, { status: 401 });
    }
    
    const geminiKey = authHeader.split(" ")[1];

    const { link, businessType, goals } = await request.json();

    if (!link || !businessType || !goals) {
      return NextResponse.json({ error: "Missing required fields: link, businessType, goals." }, { status: 400 });
    }

    const session = await auth();

    // 2. Fetch context in parallel to save time
    const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
      scrapeWebsite(link),
      captureScreenshot(link).catch(() => null), // Fail gracefully if puppeteer breaks
      getPageSpeedInsights(link).catch(() => null) // Fail gracefully if PageSpeed fails
    ]);

    // 3. Initialize AI
    const genAI = new GoogleGenerativeAI(geminiKey);
    // Use gemini-1.5-flash as it supports vision and structured output
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, seoData);

    const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
      { text: prompt }
    ];

    if (screenshotBase64) {
      parts.push({
        inlineData: {
          data: screenshotBase64,
          mimeType: "image/jpeg"
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const text = response.text();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch {
      console.error("Failed to parse Gemini JSON:", text);
      throw new Error("AI returned malformed JSON");
    }

    // 4. Save to database for Persistent History
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

    // Map specific Gemini AI errors
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a moment before trying again." }, { status: 429 });
    }
    if (errorMessage.includes("API key not valid") || errorMessage.includes("401")) {
      return NextResponse.json({ error: "Invalid Gemini API Key. Please check your settings." }, { status: 401 });
    }
    if (errorMessage.includes("Safety")) {
      return NextResponse.json({ error: "The request was blocked by AI safety filters. Please try rephrasing your goals." }, { status: 400 });
    }

    return NextResponse.json({ error: "An unexpected cosmic interference occurred. Failed to generate audit." }, { status: 500 });
  }
}
