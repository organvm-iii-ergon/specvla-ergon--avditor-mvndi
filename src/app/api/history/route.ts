import { NextResponse } from "next/server";
import { getAudits } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    // Only allow fetching if logged in, or fallback to an empty array for guests
    if (!session?.user?.email) {
      return NextResponse.json({ audits: [] });
    }

    const audits = await getAudits(session.user.email);
    return NextResponse.json({ audits });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
