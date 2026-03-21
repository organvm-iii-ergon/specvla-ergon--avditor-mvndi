import { describe, it, expect } from "vitest";
import {
  AuditSchema,
  ScheduleSchema,
  FeedbackSchema,
  BrandingSchema,
  IntegrationSchema,
} from "./schemas";

describe("AuditSchema", () => {
  const validAudit = {
    link: "https://example.com",
    businessType: "SaaS",
    goals: "Grow revenue and expand market share",
  };

  it("passes with valid input", () => {
    const result = AuditSchema.safeParse(validAudit);
    expect(result.success).toBe(true);
  });

  it("defaults language to English when omitted", () => {
    const result = AuditSchema.safeParse(validAudit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("English");
    }
  });

  it("fails when link is missing", () => {
    const { link: _link, ...withoutLink } = validAudit;
    const result = AuditSchema.safeParse(withoutLink);
    expect(result.success).toBe(false);
  });

  it("fails when link is not a valid URL", () => {
    const result = AuditSchema.safeParse({ ...validAudit, link: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("fails when goals is too short", () => {
    const result = AuditSchema.safeParse({ ...validAudit, goals: "hi" });
    expect(result.success).toBe(false);
  });

  it("fails when businessType is too short", () => {
    const result = AuditSchema.safeParse({ ...validAudit, businessType: "A" });
    expect(result.success).toBe(false);
  });

  it("passes when optional teamId is provided", () => {
    const result = AuditSchema.safeParse({
      ...validAudit,
      teamId: "team-abc-123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamId).toBe("team-abc-123");
    }
  });

  it("passes when optional teamId is omitted", () => {
    const result = AuditSchema.safeParse(validAudit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.teamId).toBeUndefined();
    }
  });

  it("passes with explicit language override", () => {
    const result = AuditSchema.safeParse({ ...validAudit, language: "French" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("French");
    }
  });
});

describe("ScheduleSchema", () => {
  const validSchedule = {
    link: "https://example.com",
    businessType: "Agency",
    goals: "Generate more leads from organic search",
    frequency: "weekly" as const,
  };

  it("passes with valid weekly frequency", () => {
    const result = ScheduleSchema.safeParse(validSchedule);
    expect(result.success).toBe(true);
  });

  it("passes with valid monthly frequency", () => {
    const result = ScheduleSchema.safeParse({
      ...validSchedule,
      frequency: "monthly",
    });
    expect(result.success).toBe(true);
  });

  it("fails with invalid frequency value", () => {
    const result = ScheduleSchema.safeParse({
      ...validSchedule,
      frequency: "daily",
    });
    expect(result.success).toBe(false);
  });

  it("fails when frequency is missing", () => {
    const { frequency: _freq, ...withoutFreq } = validSchedule;
    const result = ScheduleSchema.safeParse(withoutFreq);
    expect(result.success).toBe(false);
  });

  it("fails when link is not a valid URL", () => {
    const result = ScheduleSchema.safeParse({
      ...validSchedule,
      link: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("passes with optional teamId", () => {
    const result = ScheduleSchema.safeParse({
      ...validSchedule,
      teamId: "team-xyz",
    });
    expect(result.success).toBe(true);
  });
});

describe("FeedbackSchema", () => {
  const validFeedback = {
    auditId: "123e4567-e89b-12d3-a456-426614174000",
    score: 0.8,
  };

  it("passes with valid input", () => {
    const result = FeedbackSchema.safeParse(validFeedback);
    expect(result.success).toBe(true);
  });

  it("passes with score of 0 (min boundary)", () => {
    const result = FeedbackSchema.safeParse({ ...validFeedback, score: 0 });
    expect(result.success).toBe(true);
  });

  it("passes with score of 1 (max boundary)", () => {
    const result = FeedbackSchema.safeParse({ ...validFeedback, score: 1 });
    expect(result.success).toBe(true);
  });

  it("fails when score is below 0", () => {
    const result = FeedbackSchema.safeParse({ ...validFeedback, score: -0.1 });
    expect(result.success).toBe(false);
  });

  it("fails when score is above 1", () => {
    const result = FeedbackSchema.safeParse({ ...validFeedback, score: 1.1 });
    expect(result.success).toBe(false);
  });

  it("fails when auditId is not a valid UUID", () => {
    const result = FeedbackSchema.safeParse({
      ...validFeedback,
      auditId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("passes with optional section and comment provided", () => {
    const result = FeedbackSchema.safeParse({
      ...validFeedback,
      section: "Mercury",
      comment: "Very helpful breakdown",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.section).toBe("Mercury");
      expect(result.data.comment).toBe("Very helpful breakdown");
    }
  });

  it("passes when optional section and comment are omitted", () => {
    const result = FeedbackSchema.safeParse(validFeedback);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.section).toBeUndefined();
      expect(result.data.comment).toBeUndefined();
    }
  });
});

describe("BrandingSchema", () => {
  it("passes with a valid logo URL", () => {
    const result = BrandingSchema.safeParse({
      logoUrl: "https://cdn.example.com/logo.png",
    });
    expect(result.success).toBe(true);
  });

  it("fails when logoUrl is not a valid URL", () => {
    const result = BrandingSchema.safeParse({ logoUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("fails when logoUrl is missing", () => {
    const result = BrandingSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("fails when logoUrl is an empty string", () => {
    const result = BrandingSchema.safeParse({ logoUrl: "" });
    expect(result.success).toBe(false);
  });
});

describe("IntegrationSchema", () => {
  const validIntegration = {
    name: "My Webhook",
    url: "https://hooks.example.com/notify",
    event: "audit.completed" as const,
  };

  it("passes with valid input and audit.completed event", () => {
    const result = IntegrationSchema.safeParse(validIntegration);
    expect(result.success).toBe(true);
  });

  it("passes with lead.captured event", () => {
    const result = IntegrationSchema.safeParse({
      ...validIntegration,
      event: "lead.captured",
    });
    expect(result.success).toBe(true);
  });

  it("passes with comparison.completed event", () => {
    const result = IntegrationSchema.safeParse({
      ...validIntegration,
      event: "comparison.completed",
    });
    expect(result.success).toBe(true);
  });

  it("fails with an invalid event value", () => {
    const result = IntegrationSchema.safeParse({
      ...validIntegration,
      event: "audit.started",
    });
    expect(result.success).toBe(false);
  });

  it("fails when event is missing", () => {
    const { event: _event, ...withoutEvent } = validIntegration;
    const result = IntegrationSchema.safeParse(withoutEvent);
    expect(result.success).toBe(false);
  });

  it("fails when url is not a valid URL", () => {
    const result = IntegrationSchema.safeParse({
      ...validIntegration,
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("fails when name is too short", () => {
    const result = IntegrationSchema.safeParse({
      ...validIntegration,
      name: "X",
    });
    expect(result.success).toBe(false);
  });
});
