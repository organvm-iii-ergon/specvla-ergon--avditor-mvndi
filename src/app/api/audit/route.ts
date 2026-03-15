import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { link, businessType, goals, geminiKey } = await request.json();

    if (!geminiKey) {
      return NextResponse.json({ error: "Gemini API Key is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert growth marketing consultant with a specialty in "Cosmic Strategy." 
      You blend high-performance marketing data with intuitive, high-level business alignment.
      
      Analyze the following website or social media profile and produce a structured growth audit.
      
      Website or profile: ${link}
      Business type: ${businessType}
      Goals: ${goals}
      
      Structure the report with these sections:
      
      1. Overview: The Current Energy. A quick summary of the digital presence.
      2. Current Strengths: Working with the Flow. What is working well?
      3. Growth Bottlenecks: Mercury Retrograde points. What exactly is limiting their growth or conversion?
      4. Astro-Growth Insights: Specialized cosmic/intuitive advice for the brand's evolution (e.g. Venusian aesthetics, Mars-like execution).
      5. Immediate Improvements: Strategic Alignment. 3-5 things they can fix today.
      6. Strategic Opportunities: Expansion Windows. High-level growth paths.
      
      CRITICAL LEAD GEN INSTRUCTION:
      At the end of the report, you MUST provide a "Call to Action" for each of the following three "Paths to Manifestation":
      
      - Path 1 (The Builder): If the user wants the "Growth Bottlenecks" fixed for them immediately by an expert (Done For You).
      - Path 2 (The Vault): If the user wants the exact templates and pointers to fix these "Immediate Improvements" themselves (Done With You).
      - Path 3 (The Oracle): If the user needs a deep-dive consulting session to explore the "Strategic Opportunities" further (Consulting).
      
      Use professional yet slightly "mystical" and authoritative language. Use Markdown for formatting. Ensure the tone makes the user feel that scaling is inevitable if they align with one of these paths.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ audit: text });
  } catch (error: any) {
    console.error("Audit Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate audit" }, { status: 500 });
  }
}
