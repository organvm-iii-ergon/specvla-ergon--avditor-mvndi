import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, auditContext } = await req.json();

    const systemPrompt = `You are the "Oracle" - an expert cosmic growth marketing consultant.
    You have just generated the following audit for the user's business:
    
    ${auditContext}
    
    Answer the user's questions about this audit specifically. Stay in character (professional but slightly mystical, focused on alignment, bottlenecks, and manifestation). Keep your answers actionable and concise.`;

    const result = streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat error", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
