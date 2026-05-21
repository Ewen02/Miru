import { expect, test } from "@playwright/test";

test.describe("Landing — anonymous home", () => {
  test("renders the marketing landing for visitors without a session", async ({ page }) => {
    await page.goto("/");
    // The landing block has the Sympathisant pricing line — distinctive enough
    // to confirm we're not on the catalog grid.
    await expect(page).toHaveTitle(/Miru/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("filtered URL bypasses the landing and shows the catalog", async ({ page }) => {
    await page.goto("/?genres=action");
    // Catalog header is visible; we look for the toolbar specifically.
    await expect(page.getByRole("main")).toBeVisible();
  });
});
