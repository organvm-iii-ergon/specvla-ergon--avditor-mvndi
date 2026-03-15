import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConfig } from "@/lib/config";
import { getAudits, getAuditById, deleteAudit } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (getConfig("adminEmails") || "admin@growthauditor.ai").split(",");
  const isAdmin = adminEmails.some(
    (e) => session.user?.email === e.trim()
  );

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "users") {
      const audits = await getAudits();
      const userMap = new Map<string, { email: string; auditCount: number; lastAudit: string; firstAudit: string }>();

      for (const audit of audits) {
        if (audit.userEmail) {
          if (!userMap.has(audit.userEmail)) {
            userMap.set(audit.userEmail, {
              email: audit.userEmail,
              auditCount: 0,
              lastAudit: audit.createdAt || "",
              firstAudit: audit.createdAt || "",
            });
          }
          const user = userMap.get(audit.userEmail)!;
          user.auditCount++;
          if (audit.createdAt) {
            if (audit.createdAt > user.lastAudit) user.lastAudit = audit.createdAt;
            if (audit.createdAt < user.firstAudit) user.firstAudit = audit.createdAt;
          }
        }
      }

      return NextResponse.json({ users: Array.from(userMap.values()) });
    }

    if (action === "audit") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ error: "Audit ID required" }, { status: 400 });
      }
      const audit = await getAuditById(id);
      return NextResponse.json({ audit });
    }

    const audits = await getAudits();
    return NextResponse.json({ 
      audits: audits.slice(0, 100),
      total: audits.length 
    });
  } catch (error) {
    console.error("Users API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = (getConfig("adminEmails") || "admin@growthauditor.ai").split(",");
  const isAdmin = adminEmails.some(
    (e) => session.user?.email === e.trim()
  );

  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Audit ID required" }, { status: 400 });
    }

    await deleteAudit(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
