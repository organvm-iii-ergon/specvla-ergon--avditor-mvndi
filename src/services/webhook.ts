import crypto from 'crypto';
import { getConfig } from "@/lib/config";
import { getIntegrations } from "@/lib/db";

function signPayload(payload: string, secret: string): string { // allow-secret
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export interface WebhookPayload {
  event: "audit.completed" | "lead.captured" | "comparison.completed";
  timestamp: string;
  data: Record<string, unknown>;
}

export async function sendWebhook(payload: WebhookPayload, userEmail?: string): Promise<boolean> {
  const primaryWebhookUrl = getConfig("webhookUrl");
  let primarySuccess = !!primaryWebhookUrl;

  if (primaryWebhookUrl) {
    try {
      const webhookSecret = getConfig("webhookSecret");
      const body = JSON.stringify(payload);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "GrowthAuditor/1.0",
        "X-Webhook-Event": payload.event,
      };
      if (webhookSecret) {
        headers["X-Webhook-Signature"] = signPayload(body, webhookSecret);
      }
      const response = await fetch(primaryWebhookUrl, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000),
      });
      primarySuccess = response.ok;
    } catch (error) {
      console.error("Primary webhook error:", error);
      primarySuccess = false;
    }
  }

  // Push to user-defined integrations
  if (userEmail) {
    try {
      const integrations = await getIntegrations(userEmail);
      const relevantIntegrations = (integrations as { name: string; url: string; event: string }[]).filter(i => i.event === payload.event);
      
      for (const integration of relevantIntegrations) {
        fetch(integration.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "GrowthAuditor/1.0",
            "X-Integration-Name": integration.name,
          },
          body: JSON.stringify({ ...payload, integrationName: integration.name }),
        }).catch(err => console.error(`User integration ${integration.name} failed`, err));
      }
    } catch (err) {
      console.error("Failed to fetch user integrations for webhook", err);
    }
  }

  return primarySuccess;
}

export async function sendAuditWebhook(auditData: {
  id: string;
  link: string;
  businessType: string;
  goals: string;
  scores: Record<string, number>;
  userEmail?: string;
}): Promise<boolean> {
  return sendWebhook({
    event: "audit.completed",
    timestamp: new Date().toISOString(),
    data: auditData,
  }, auditData.userEmail);
}

export async function sendLeadWebhook(leadData: {
  email: string;
  auditId?: string;
  source: string;
}, userEmail?: string): Promise<boolean> {
  return sendWebhook({
    event: "lead.captured",
    timestamp: new Date().toISOString(),
    data: leadData,
  }, userEmail);
}
