import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudits } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "admin@growthauditor.ai").split(",");
  const isAdmin = adminEmails.some(e => session.user?.email === e.trim());

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    if (type === "audits") {
      const audits = await getAudits();
      const uniqueUsers = new Map<string, { email: string; auditCount: number; lastAudit: string }>();
      
      for (const audit of audits) {
        if (audit.userEmail) {
          if (!uniqueUsers.has(audit.userEmail)) {
            uniqueUsers.set(audit.userEmail, {
              email: audit.userEmail,
              auditCount: 0,
              lastAudit: audit.createdAt || "",
            });
          }
          const user = uniqueUsers.get(audit.userEmail)!;
          user.auditCount++;
          if (audit.createdAt && audit.createdAt > user.lastAudit) {
            user.lastAudit = audit.createdAt;
          }
        }
      }

      return NextResponse.json({
        totalAudits: audits.length,
        uniqueUsers: Array.from(uniqueUsers.values()),
        recentAudits: audits.slice(0, 20),
      });
    }

    if (type === "stats") {
      const audits = await getAudits();
      const uniqueEmails = new Set(audits.filter(a => a.userEmail).map(a => a.userEmail));
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentAudits = audits.filter(a => a.createdAt && new Date(a.createdAt) > thirtyDaysAgo);

      return NextResponse.json({
        totalAudits: audits.length,
        totalUsers: uniqueEmails.size,
        auditsLast30Days: recentAudits.length,
      });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
