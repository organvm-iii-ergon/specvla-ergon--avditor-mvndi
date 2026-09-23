import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage renders 8 pillars, click-to-expand, and alignment form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Digital Alignment/i })).toBeVisible();

    // Verify all 8 pillar cards
    const pillars = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Neptune"];
    for (const pillar of pillars) {
      await expect(page.getByRole("button", { name: new RegExp(pillar, "i") })).toBeVisible();
    }

    // Test pillar click-to-expand
    await page.getByRole("button", { name: /Sun/i }).click();
    await expect(page.getByText("Sun — Identity")).toBeVisible();
    await expect(page.getByText(/Brand positioning, unique value proposition/i)).toBeVisible();

    // Click Sun again to toggle/close
    await page.getByRole("button", { name: /Sun/i }).click();
    await expect(page.getByText("Sun — Identity")).not.toBeVisible();

    // Test form toggle
    await page.getByRole("button", { name: /Initiate Alignment/i }).click();
    await expect(page.locator("#link")).toBeVisible();
    await expect(page.locator("#business")).toBeVisible();
    await expect(page.locator("#goals")).toBeVisible();
    await expect(page.getByRole("button", { name: /Generate Strategic Audit/i })).toBeVisible();
  });

  test("nav links work", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Compare", exact: true }).click();
    await expect(page).toHaveURL(/\/compare/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: /Competitor Analysis/i })).toBeVisible();

    await page.getByRole("link", { name: "Methodology", exact: true }).click();
    await expect(page).toHaveURL(/\/about/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: /The Cosmic Pillars/i })).toBeVisible();

    await page.getByRole("link", { name: "Examples", exact: true }).click();
    await expect(page).toHaveURL(/\/examples/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "Cosmic Growth in Action" })).toBeVisible();

    await page.getByRole("link", { name: "History", exact: true }).click();
    await expect(page).toHaveURL(/\/history/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: /Cosmic Archive/i })).toBeVisible({ timeout: 20000 });

    await page.getByRole("link", { name: "Settings", exact: true }).click();
    await expect(page).toHaveURL(/\/settings/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: /Settings/i })).toBeVisible();
    await expect(page.locator("#apikey")).toBeVisible();
  });

  test("about page has methodology pillars", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "Mercury" })).toBeVisible();
    await expect(page.getByText("Communication")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Venus" })).toBeVisible();
    await expect(page.getByText("Aesthetic")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mars" })).toBeVisible();
    await expect(page.getByText("Drive")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Saturn" })).toBeVisible();
    await expect(page.getByText("Structure")).toBeVisible();
  });

  test("examples page shows case studies", async ({ page }) => {
    await page.goto("/examples");
    await expect(page.getByText("Acme Corp SaaS")).toBeVisible();
    await expect(page.getByText("Zenith Creatives")).toBeVisible();
  });

  test("compare page renders form and handles third URL option", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByRole("heading", { name: "Competitor Analysis" })).toBeVisible();

    await expect(page.locator("#url-0")).toBeVisible();
    await expect(page.locator("#url-1")).toBeVisible();
    await expect(page.locator("#url-2")).not.toBeVisible();

    // Add 3rd URL
    await page.getByRole("button", { name: /\+ Add URL 3/i }).click();
    await expect(page.locator("#url-2")).toBeVisible();

    // Remove 3rd URL
    await page.getByRole("button", { name: /Remove/i }).click();
    await expect(page.locator("#url-2")).not.toBeVisible();

    // Submit comparison without API key
    await page.locator("#url-0").fill("https://site1.com");
    await page.locator("#url-1").fill("https://site2.com");
    await page.locator("#compare-business").fill("Creative Studio");
    await page.locator("#compare-goals").fill("Increase leads");

    await page.getByRole("button", { name: /Run Comparison/i }).click();
    await expect(page.getByText("Please configure your AI provider API key in Settings first.")).toBeVisible();
  });
});
