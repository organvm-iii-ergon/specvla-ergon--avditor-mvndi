import { z } from "zod";

/**
 * THE SUBMERGED SCHEMAS
 * Centralized runtime validation for the entire platform.
 * Implements the Deep-Disclosure Covenant by ensuring data 
 * integrity beneath the surface.
 */

export const AuditSchema = z.object({
  link: z.string().url("A valid cosmic URL is required."),
  businessType: z.string().min(2, "Business type must be defined."),
  goals: z.string().min(5, "Manifestation goals require more depth."),
  teamId: z.string().optional(),
  language: z.string().optional().default("English"),
});

export const ScheduleSchema = z.object({
  link: z.string().url(),
  businessType: z.string().min(2),
  goals: z.string().min(5),
  frequency: z.enum(["weekly", "monthly"]),
  teamId: z.string().optional(),
});

export const FeedbackSchema = z.object({
  auditId: z.string().uuid(),
  score: z.number().min(0).max(1),
  section: z.string().optional(),
  comment: z.string().optional(),
});

export const BrandingSchema = z.object({
  logoUrl: z.string().url("A valid image URL is required."),
});

export const IntegrationSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
  event: z.enum(["audit.completed", "lead.captured", "comparison.completed"]),
});
