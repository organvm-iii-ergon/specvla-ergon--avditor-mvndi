import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConfig, setConfig, getAllConfig } from "@/lib/config";

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
    const key = searchParams.get("key");

    if (key) {
      const value = getConfig(key);
      return NextResponse.json({ key, value });
    }

    const config = getAllConfig();
    const safeConfig: Record<string, string> = {};

    const sensitiveKeys = [
      "geminiApiKey",
      "supabaseKey",
      "stripeSecretKey",
      "stripeWebhookSecret",
      "posthogKey",
      "resendApiKey",
      "cronSecret",
      "nextAuthSecret",
    ];

    for (const [k, v] of Object.entries(config)) {
      if (sensitiveKeys.includes(k) && v) {
        safeConfig[k] = v.substring(0, 4) + "***" + v.substring(v.length - 4);
      } else {
        safeConfig[k] = v;
      }
    }

    return NextResponse.json(safeConfig);
  } catch (error) {
    console.error("Config API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    setConfig(key, value);
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error("Config API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
