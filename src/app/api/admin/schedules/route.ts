import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConfig } from "@/lib/config";
import {
  getScheduledAudits,
  saveScheduledAudit,
  updateScheduledAudit,
  deleteScheduledAudit,
} from "@/lib/db";

async function checkAdmin(): Promise<{ isAdmin: boolean; error?: NextResponse }> {
  const session = await auth();

  if (!session?.user?.email) {
    return { isAdmin: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const adminEmails = (getConfig("adminEmails") || "admin@growthauditor.ai").split(",");
  const isAdmin = adminEmails.some((e) => session.user?.email === e.trim());

  if (!isAdmin) {
    return { isAdmin: false, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { isAdmin: true };
}

export async function GET(req: Request) {
  const { isAdmin, error } = await checkAdmin();
  if (!isAdmin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail") || undefined;
    const schedules = await getScheduledAudits(userEmail);
    return NextResponse.json({ schedules });
  } catch (err) {
    console.error("Schedules GET Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { isAdmin, error } = await checkAdmin();
  if (!isAdmin) return error;

  try {
    const body = await req.json();
    const { userEmail, link, businessType, goals, frequency } = body;

    if (!userEmail || !link || !businessType || !goals) {
      return NextResponse.json({ error: "Missing required fields: userEmail, link, businessType, goals" }, { status: 400 });
    }

    const id = await saveScheduledAudit({
      userEmail,
      link,
      businessType,
      goals,
      frequency: frequency || "monthly",
      enabled: true,
    });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Schedules POST Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { isAdmin, error } = await checkAdmin();
  if (!isAdmin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    await deleteScheduledAudit(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Schedules DELETE Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { isAdmin, error } = await checkAdmin();
  if (!isAdmin) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    const updates = await req.json();
    await updateScheduledAudit(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Schedules PATCH Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
