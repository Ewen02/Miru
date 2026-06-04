import { expect, test } from "@playwright/test";

test.describe("Pricing — donation-style subscription", () => {
  // Pin the browser to French so the bare /pricing path isn't auto-redirected
  // to /en by next-intl locale detection.
  test.use({ locale: "fr-FR" });

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
