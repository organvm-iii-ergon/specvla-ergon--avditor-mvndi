import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudits, saveAudit } from "@/lib/db";
import { orchestrateCosmicAudit } from "@/services/aiOrchestrator";
import crypto from "crypto";

async function generateAudit(
  link: string,
  businessType: string,
  goals: string,
  userEmail?: string
): Promise<{ id: string; markdownAudit: string; scores: Record<string, number> }> {
  const apiKey = process.env.GEMINI_API_KEY; // allow-secret
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const result = await orchestrateCosmicAudit({
    link, businessType, goals,
    provider: "gemini",
    auth: apiKey,
    isPro: true, // admin-triggered audits get full depth
  });

  const auditId = crypto.randomUUID();
  await saveAudit({
    id: auditId, userEmail, link, businessType, goals,
    markdownAudit: result.markdownAudit,
    scores: JSON.stringify(result.scores || {}),
  });

  return { id: auditId, markdownAudit: result.markdownAudit, scores: result.scores || {} };
}

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "admin@growthauditor.ai").split(",");
  const isAdmin = adminEmails.some(e => session.user?.email === e.trim());

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { action, userEmail, link, businessType, goals } = await req.json();

    if (action === "runMonthlyAudit") {
      if (!userEmail || !link || !businessType || !goals) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const result = await generateAudit(link, businessType, goals, userEmail);
      return NextResponse.json({ success: true, audit: result });
    }

    if (action === "runAllMonthlyAudits") {
      const audits = await getAudits();
      const uniqueUserAudits = new Map<string, typeof audits[0]>();

      for (const audit of audits) {
        if (audit.userEmail && !uniqueUserAudits.has(audit.userEmail)) {
          uniqueUserAudits.set(audit.userEmail, audit);
        }
      }

      let processed = 0;
      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const [, audit] of uniqueUserAudits) {
        try {
          await generateAudit(
            audit.link,
            audit.businessType,
            audit.goals,
            audit.userEmail
          );
          processed++;
          results.push({ email: audit.userEmail!, success: true });
        } catch (e) {
          results.push({ 
            email: audit.userEmail!, 
            success: false, 
            error: e instanceof Error ? e.message : "Unknown error" 
          });
        }
      }

      return NextResponse.json({ success: true, processed, results });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin Action Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
