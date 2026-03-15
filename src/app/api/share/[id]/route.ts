import { NextResponse } from "next/server";
import { getAuditById } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const audit = await getAuditById(id);

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: audit.id,
      link: audit.link,
      businessType: audit.businessType,
      goals: audit.goals,
      markdownAudit: audit.markdownAudit,
      scores: JSON.parse(audit.scores || "{}"),
      createdAt: audit.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Share Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
