import { streamText } from 'ai';
import { createAIModel, type AIProviderType } from '@/services/aiModelFactory';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header. Please configure your API Key in Settings." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = authHeader.split(" ")[1]; // allow-secret

    // Determine AI provider from header (defaults to gemini)
    const provider = (req.headers.get("X-AI-Provider") || "gemini") as AIProviderType;

    const { messages, auditContext } = await req.json();

    const systemPrompt = `You are the "Oracle" - an expert cosmic growth marketing consultant.
    You have just generated the following audit for the user's business:

    ${auditContext}

    Answer the user's questions about this audit specifically. Stay in character (professional but slightly mystical, focused on alignment, bottlenecks, and manifestation). Keep your answers actionable and concise.`;

    const model = createAIModel(provider, apiKey); // allow-secret

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Chat error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500 });
  }
}
