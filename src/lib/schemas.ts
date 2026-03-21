import { z } from "zod";

/**
 * Validates audit submission input.
 * Used by /api/audit/stream (streaming endpoint).
 * Shape matches the inline auditSchema in /api/audit/route.ts
 * with the addition of an optional language field.
 */
export const AuditSchema = z.object({
  link: z.string().url(),
  businessType: z.string().min(2),
  goals: z.string().min(5),
  teamId: z.string().optional(),
  language: z.string().optional().default("English"),
});

/**
 * Validates section feedback on a completed audit.
 * Used by /api/audit/feedback.
 */
export const FeedbackSchema = z.object({
  auditId: z.string().uuid(),
  section: z.string().optional(),
  score: z.number().min(0).max(1),
  comment: z.string().optional(),
});

/**
 * Validates agency branding configuration (Pro feature).
 * Used by /api/settings/branding.
 */
export const BrandingSchema = z.object({
  logoUrl: z.string().url(),
});

/**
 * Validates webhook/integration configuration.
 * Used by /api/settings/integrations.
 */
export const IntegrationSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  event: z.enum(["audit.completed", "lead.captured", "comparison.completed"]),
});

/**
 * Validates scheduled audit configuration (Pro feature).
 * Used by /api/settings/schedules.
 */
export const ScheduleSchema = z.object({
  link: z.string().url(),
  businessType: z.string().min(2),
  goals: z.string().min(5),
  frequency: z.enum(["weekly", "monthly"]),
  teamId: z.string().optional(),
});
