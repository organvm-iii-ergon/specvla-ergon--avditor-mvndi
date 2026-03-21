import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  saveAudit,
  getAudits,
  getAuditById,
  deleteAudit,
  createTeam,
  getTeamsByEmail,
  addTeamMember,
  getTeamMembers,
} from "./db";
import type { AuditRecord } from "./db";

function makeAudit(overrides: Partial<AuditRecord> = {}): AuditRecord {
  return {
    id: crypto.randomUUID(),
    userEmail: `user-${Date.now()}@test.com`,
    link: "https://example.com",
    businessType: "SaaS",
    goals: "Grow revenue",
    markdownAudit: "# Audit\nLooks good.",
    scores: JSON.stringify({ seo: 85, performance: 90 }),
    ...overrides,
  };
}

describe("db audit operations", () => {
  it("saveAudit and getAudits work together", async () => {
    const audit = makeAudit();
    await saveAudit(audit);

    const audits = await getAudits();
    const found = audits.find((a) => a.id === audit.id);

    expect(found).toBeDefined();
    expect(found!.link).toBe(audit.link);
    expect(found!.businessType).toBe(audit.businessType);
    expect(found!.goals).toBe(audit.goals);
    expect(found!.markdownAudit).toBe(audit.markdownAudit);
    expect(found!.scores).toBe(audit.scores);

    // Clean up
    await deleteAudit(audit.id);
  });

  it("getAuditById returns the correct audit", async () => {
    const audit = makeAudit();
    await saveAudit(audit);

    const result = await getAuditById(audit.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(audit.id);
    expect(result!.link).toBe(audit.link);
    expect(result!.userEmail).toBe(audit.userEmail);

    // Clean up
    await deleteAudit(audit.id);
  });

  it("getAuditById returns undefined for non-existent ID", async () => {
    const result = await getAuditById("nonexistent-id-" + crypto.randomUUID());
    expect(result).toBeUndefined();
  });

  it("deleteAudit removes an audit", async () => {
    const audit = makeAudit();
    await saveAudit(audit);

    const beforeDelete = await getAuditById(audit.id);
    expect(beforeDelete).toBeDefined();

    await deleteAudit(audit.id);

    const afterDelete = await getAuditById(audit.id);
    expect(afterDelete).toBeUndefined();
  });

  it("getAudits filters by userEmail", async () => {
    const email = `filter-test-${Date.now()}@test.com`;
    const audit1 = makeAudit({ userEmail: email });
    const audit2 = makeAudit({ userEmail: email });
    const audit3 = makeAudit({ userEmail: "other@test.com" });

    await saveAudit(audit1);
    await saveAudit(audit2);
    await saveAudit(audit3);

    const filtered = await getAudits(email);
    const filteredIds = filtered.map((a) => a.id);

    expect(filteredIds).toContain(audit1.id);
    expect(filteredIds).toContain(audit2.id);
    expect(filteredIds).not.toContain(audit3.id);

    // Clean up
    await deleteAudit(audit1.id);
    await deleteAudit(audit2.id);
    await deleteAudit(audit3.id);
  });
});

describe("db team operations", () => {
  it("createTeam and getTeamsByEmail", async () => {
    const email = `team-owner-${Date.now()}@test.com`;
    const team = await createTeam("Test Team", email);

    expect(team).toBeDefined();
    expect(team.name).toBe("Test Team");
    expect(team.ownerEmail).toBe(email);
    expect(team.id).toBeTruthy();

    const teams = await getTeamsByEmail(email);
    const found = teams.find((t) => t.id === team.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe("Test Team");
  });

  it("getTeamsByEmail returns empty array for unknown email", async () => {
    const teams = await getTeamsByEmail(`unknown-${Date.now()}@test.com`);
    expect(teams).toEqual([]);
  });

  it("addTeamMember and getTeamMembers", async () => {
    const ownerEmail = `owner-${Date.now()}@test.com`;
    const memberEmail = `member-${Date.now()}@test.com`;
    const adminEmail = `admin-${Date.now()}@test.com`;

    const team = await createTeam("Member Test Team", ownerEmail);

    // createTeam auto-adds the owner as a member with role "owner"
    const membersBeforeAdd = await getTeamMembers(team.id);
    const ownerMember = membersBeforeAdd.find((m) => m.email === ownerEmail);
    expect(ownerMember).toBeDefined();
    expect(ownerMember!.role).toBe("owner");

    // Add a regular member
    await addTeamMember(team.id, memberEmail);
    // Add an admin member
    await addTeamMember(team.id, adminEmail, "admin");

    const members = await getTeamMembers(team.id);
    expect(members.length).toBe(3);

    const member = members.find((m) => m.email === memberEmail);
    expect(member).toBeDefined();
    expect(member!.role).toBe("member");
    expect(member!.teamId).toBe(team.id);

    const admin = members.find((m) => m.email === adminEmail);
    expect(admin).toBeDefined();
    expect(admin!.role).toBe("admin");
  });

  it("added team member appears in getTeamsByEmail", async () => {
    const ownerEmail = `owner2-${Date.now()}@test.com`;
    const memberEmail = `member2-${Date.now()}@test.com`;

    const team = await createTeam("Visibility Test Team", ownerEmail);
    await addTeamMember(team.id, memberEmail);

    const memberTeams = await getTeamsByEmail(memberEmail);
    const found = memberTeams.find((t) => t.id === team.id);
    expect(found).toBeDefined();
    expect(found!.name).toBe("Visibility Test Team");
  });
});
