import { expect, test } from "@playwright/test";

test.describe("i18n — path-prefixed locale routing", () => {
  test("default locale (fr) is served at the bare path", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/paies si tu veux/i);
  });

  test("EN is served under the /en prefix", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page).toHaveURL(/\/en\/pricing$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Pay if you want/i);
    await expect(page.locator("body")).toContainText("Free");
  });

  test("the default locale prefix /fr redirects to the bare path", async ({ page }) => {
    await page.goto("/fr/pricing");
    await expect(page).toHaveURL(/\/pricing$/);
  });

  test("html lang reflects the URL locale", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/pricing");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("EN pages expose hreflang alternates for both locales", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  });
});
