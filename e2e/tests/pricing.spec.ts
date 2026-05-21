import { expect, test } from "@playwright/test";

test.describe("Pricing — donation-style subscription", () => {
  test("loads with the FR title by default", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/paies si tu veux/i);
  });

  test("shows the Free + Sympathisant plan names", async ({ page }) => {
    await page.goto("/pricing");
    const body = await page.textContent("body");
    expect(body).toMatch(/Gratuit/);
    expect(body).toMatch(/Sympathisant/);
  });
});
