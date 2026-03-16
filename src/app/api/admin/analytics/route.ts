import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudits, getLeads } from "@/lib/db";

export async function GET() {
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
    const audits = await getAudits();
    const leads = await getLeads();

    const now = new Date();

    // Audit volume by day (last 30 days)
    const auditDayCounts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      auditDayCounts.set(key, 0);
    }
    for (const audit of audits) {
      if (audit.createdAt) {
        const dayKey = new Date(audit.createdAt).toISOString().slice(0, 10);
        if (auditDayCounts.has(dayKey)) {
          auditDayCounts.set(dayKey, (auditDayCounts.get(dayKey) || 0) + 1);
        }
      }
    }
    const auditsByDay = Array.from(auditDayCounts.entries()).map(([date, count]) => ({ date, count }));

    // Top domains (top 10)
    const domainCounts = new Map<string, number>();
    for (const audit of audits) {
      let domain = audit.link;
      try {
        const urlStr = domain.startsWith("http") ? domain : `https://${domain}`;
        domain = new URL(urlStr).hostname;
      } catch {
        // Use raw link if URL parsing fails
      }
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
    const topDomains = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Average scores
    let commTotal = 0, aesthTotal = 0, driveTotal = 0, structTotal = 0;
    let scoreCount = 0;
    for (const audit of audits) {
      if (audit.scores) {
        try {
          const s = JSON.parse(audit.scores);
          if (typeof s.communication === "number") {
            commTotal += s.communication;
            aesthTotal += s.aesthetic ?? 0;
            driveTotal += s.drive ?? 0;
            structTotal += s.structure ?? 0;
            scoreCount++;
          }
        } catch {
          // Skip unparseable scores
        }
      }
    }
    const avgScores = {
      communication: scoreCount > 0 ? Math.round((commTotal / scoreCount) * 10) / 10 : 0,
      aesthetic: scoreCount > 0 ? Math.round((aesthTotal / scoreCount) * 10) / 10 : 0,
      drive: scoreCount > 0 ? Math.round((driveTotal / scoreCount) * 10) / 10 : 0,
      structure: scoreCount > 0 ? Math.round((structTotal / scoreCount) * 10) / 10 : 0,
    };

    // Business type breakdown
    const bizCounts = new Map<string, number>();
    for (const audit of audits) {
      const bt = audit.businessType || "Unknown";
      bizCounts.set(bt, (bizCounts.get(bt) || 0) + 1);
    }
    const businessTypes = Array.from(bizCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Lead funnel
    const leadDayCounts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      leadDayCounts.set(key, 0);
    }
    for (const lead of leads) {
      if (lead.createdAt) {
        const dayKey = new Date(lead.createdAt).toISOString().slice(0, 10);
        if (leadDayCounts.has(dayKey)) {
          leadDayCounts.set(dayKey, (leadDayCounts.get(dayKey) || 0) + 1);
        }
      }
    }
    const leadsByDay = Array.from(leadDayCounts.entries()).map(([date, count]) => ({ date, count }));

    const totalLeads = leads.length;
    const conversionRate = audits.length > 0
      ? Math.round((totalLeads / audits.length) * 1000) / 10
      : 0;

    return NextResponse.json({
      auditsByDay,
      topDomains,
      avgScores,
      businessTypes,
      leadsByDay,
      totalLeads,
      conversionRate,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
