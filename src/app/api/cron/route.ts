import { NextResponse } from "next/server";
import { getAudits, saveAudit, getScheduledAudits, updateScheduledAudit } from "@/lib/db";
import { scrapeWebsite } from "@/services/scraper";
import { getCosmicAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import { getPageSpeedInsights } from "@/services/pagespeed";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY || "re_test_placeholder");

async function generateMonthlyAudit(
  link: string,
  businessType: string,
  goals: string,
  userEmail?: string
): Promise<void> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("GEMINI_API_KEY not set for monthly audit");
    return;
  }

  const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
    scrapeWebsite(link).catch(() => ""),
    captureScreenshot(link).catch(() => null),
    getPageSpeedInsights(link).catch(() => null),
  ]);

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, seoData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [{ text: prompt }];
  if (screenshotBase64) {
    parts.push({
      inlineData: {
        data: screenshotBase64,
        mimeType: "image/jpeg",
      },
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = (await result.response).text();
  const parsedResult = JSON.parse(text);

  const auditId = crypto.randomUUID();
  await saveAudit({
    id: auditId,
    userEmail,
    link,
    businessType,
    goals,
    markdownAudit: parsedResult.markdownAudit,
    scores: JSON.stringify(parsedResult.scores || {}),
  });

  if (userEmail && resend) {
    const scores = parsedResult.scores || {};
    await resend.emails.send({
      from: "Growth Auditor <hello@growthauditor.ai>",
      to: userEmail,
      subject: "Your Monthly Cosmic Delta Report ✦",
      html: `
        <h1>Your Monthly Alignment Report</h1>
        <p>Your scores have evolved:</p>
        <ul>
          <li>Mercury (Communication): ${scores.communication}/100</li>
          <li>Venus (Aesthetic): ${scores.aesthetic}/100</li>
          <li>Mars (Drive): ${scores.drive}/100</li>
          <li>Saturn (Structure): ${scores.structure}/100</li>
        </ul>
        <p>Log in to see your full audit.</p>
        <p>Stay cosmic,</p>
        <p>The Growth Auditor Team</p>
      `,
    });
  }
}

function isDue(frequency: "weekly" | "monthly", lastRunAt?: string): boolean {
  if (!lastRunAt) return true;

  const last = new Date(lastRunAt).getTime();
  const now = Date.now();
  const daysSinceLast = (now - last) / (1000 * 60 * 60 * 24);

  if (frequency === "weekly") return daysSinceLast >= 7;
  return daysSinceLast >= 30;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const expectedSecret = `Bearer ${process.env.CRON_SECRET || "dev_cron_secret"}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let processed = 0;

    // Primary path: use scheduled_audits table
    const schedules = await getScheduledAudits();
    const enabledSchedules = schedules.filter((s) => s.enabled);

    if (enabledSchedules.length > 0) {
      for (const schedule of enabledSchedules) {
        if (!isDue(schedule.frequency, schedule.lastRunAt)) {
          continue;
        }

        try {
          await generateMonthlyAudit(
            schedule.link,
            schedule.businessType,
            schedule.goals,
            schedule.userEmail
          );
          await updateScheduledAudit(schedule.id, {
            lastRunAt: new Date().toISOString(),
          });
          processed++;
        } catch (e) {
          console.error(`Failed to process scheduled audit ${schedule.id} for ${schedule.userEmail}:`, e);
        }
      }

      return NextResponse.json({ success: true, processedSchedules: processed });
    }

    // Fallback: re-audit all users' most recent audit (legacy behavior)
    const allAudits = await getAudits();
    const uniqueUserAudits = new Map<string, (typeof allAudits)[0]>();

    for (const audit of allAudits) {
      if (audit.userEmail && !uniqueUserAudits.has(audit.userEmail)) {
        uniqueUserAudits.set(audit.userEmail, audit);
      }
    }

    for (const [, audit] of uniqueUserAudits) {
      try {
        await generateMonthlyAudit(
          audit.link,
          audit.businessType,
          audit.goals,
          audit.userEmail
        );
        processed++;
      } catch (e) {
        console.error(`Failed to process audit for ${audit.userEmail}:`, e);
      }
    }

    return NextResponse.json({ success: true, processedUsers: processed, fallback: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cron Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
