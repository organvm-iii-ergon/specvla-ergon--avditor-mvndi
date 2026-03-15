import { NextResponse } from "next/server";
import { saveLead } from "@/lib/db";
import { createRateLimiter, getClientIP } from "@/lib/rate-limit";
import { sendLeadAlertEmail } from "@/services/email";

const limiter = createRateLimiter({ max: 10, windowMs: 60 * 60 * 1000 });

export async function POST(request: Request) {
  const ip = getClientIP(request);
  const { limited } = limiter.check(ip);
  if (limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, auditId, source } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    await saveLead(email, auditId, source || "audit_gate");

    sendLeadAlertEmail(email, auditId).catch(() => {}); // fire and forget

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead capture error:", err);
    return NextResponse.json(
      { error: "Failed to save lead." },
      { status: 500 }
    );
  }
}
