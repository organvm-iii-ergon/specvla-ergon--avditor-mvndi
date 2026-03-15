import { Resend } from "resend";
import { getConfig } from "@/lib/config";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY || getConfig("resendApiKey"); // allow-secret
  if (!apiKey || apiKey === "re_test_placeholder") return null; // allow-secret
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return getConfig("emailFrom") || "hello@growthauditor.ai";
}

function getAppName(): string {
  return getConfig("appName") || "Growth Auditor";
}

export async function sendAuditCompleteEmail(
  to: string,
  auditLink: string,
  scores: Record<string, number>
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  try {
    await resend.emails.send({
      from: `${getAppName()} <${getFromAddress()}>`,
      to,
      subject: `Your Cosmic Growth Audit is Ready ✦`,
      html: `
        <h1>Your Growth Audit is Complete</h1>
        <p>Here are your alignment scores:</p>
        <ul>
          <li>Mercury (Communication): ${scores.communication || 0}/100</li>
          <li>Venus (Aesthetic): ${scores.aesthetic || 0}/100</li>
          <li>Mars (Drive): ${scores.drive || 0}/100</li>
          <li>Saturn (Structure): ${scores.structure || 0}/100</li>
        </ul>
        <p><a href="${auditLink}">View your full audit →</a></p>
        <p>Stay cosmic,<br/>${getAppName()} Team</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send audit complete email:", error);
    return false;
  }
}

export async function sendMonthlyDeltaEmail(
  to: string,
  auditLink: string,
  currentScores: Record<string, number>,
  previousScores: Record<string, number>
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const delta = (key: string) => {
    const diff = (currentScores[key] || 0) - (previousScores[key] || 0);
    return diff > 0 ? `+${diff}` : `${diff}`;
  };

  try {
    await resend.emails.send({
      from: `${getAppName()} <${getFromAddress()}>`,
      to,
      subject: `Your Monthly Cosmic Delta Report ✦`,
      html: `
        <h1>Monthly Alignment Report</h1>
        <p>Your scores have evolved:</p>
        <ul>
          <li>Mercury: ${currentScores.communication || 0}/100 (${delta("communication")})</li>
          <li>Venus: ${currentScores.aesthetic || 0}/100 (${delta("aesthetic")})</li>
          <li>Mars: ${currentScores.drive || 0}/100 (${delta("drive")})</li>
          <li>Saturn: ${currentScores.structure || 0}/100 (${delta("structure")})</li>
        </ul>
        <p><a href="${auditLink}">View full report →</a></p>
        <p>Stay cosmic,<br/>${getAppName()} Team</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send monthly delta email:", error);
    return false;
  }
}

export async function sendLeadAlertEmail(
  leadEmail: string,
  auditId?: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const adminEmails = (getConfig("adminEmails") || "admin@growthauditor.ai")
    .split(",")
    .map((e) => e.trim());

  try {
    await resend.emails.send({
      from: `${getAppName()} <${getFromAddress()}>`,
      to: adminEmails[0],
      subject: `New Lead Captured: ${leadEmail}`,
      html: `
        <h1>New Lead</h1>
        <p><strong>Email:</strong> ${leadEmail}</p>
        ${auditId ? `<p><strong>Audit ID:</strong> ${auditId}</p>` : ""}
        <p>Check your admin panel for details.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send lead alert email:", error);
    return false;
  }
}
