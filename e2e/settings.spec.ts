import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("saves and persists AI provider and API key", async ({ page }) => {
    await page.goto("/settings");

    // Default tab should be AI Engine
    await expect(page.getByRole("button", { name: "AI Engine", exact: true })).toBeVisible();

    // Configure Gemini key
    const providerSelect = page.locator("#provider");
    await providerSelect.selectOption("gemini");

    const input = page.locator("#apikey");
    await input.fill("AIzaSyTestKey123");
    await page.getByRole("button", { name: /Align AI Engine/i }).click();

    // Verify success feedback
    await expect(page.getByRole("button", { name: /Alignment Saved/i })).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(providerSelect).toHaveValue("gemini");
    await expect(input).toHaveValue("AIzaSyTestKey123");

    // Switch provider to OpenAI and save key
    await providerSelect.selectOption("openai");
    await input.fill("sk-test-openai-key-123");
    await page.getByRole("button", { name: /Align AI Engine/i }).click();
    await expect(page.getByRole("button", { name: /Alignment Saved/i })).toBeVisible();

    // Reload and verify persistence for OpenAI
    await page.reload();
    await expect(providerSelect).toHaveValue("openai");
    await expect(input).toHaveValue("sk-test-openai-key-123");
  });

  test("navigates between settings tabs", async ({ page }) => {
    await page.goto("/settings");

    // AI Engine tab active by default
    await expect(page.locator("#provider")).toBeVisible();
    await expect(page.locator("#apikey")).toBeVisible();

    // Switch to Integrations tab
    await page.getByRole("button", { name: "Integrations", exact: true }).click();
    await expect(page.getByText("External Orbits")).toBeVisible();
    await expect(page.getByRole("button", { name: /Add Webhook Integration/i })).toBeVisible();

    // Switch to Privacy tab
    await page.getByRole("button", { name: "Privacy", exact: true }).click();
    await expect(page.getByText("Strategic Sovereignty")).toBeVisible();
    await expect(page.getByText("Export Strategic History")).toBeVisible();

    // Return to AI Engine tab
    await page.getByRole("button", { name: "AI Engine", exact: true }).click();
    await expect(page.locator("#provider")).toBeVisible();
  });
});
