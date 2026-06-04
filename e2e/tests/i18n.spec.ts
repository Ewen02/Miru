import { expect, test } from "@playwright/test";

test.describe("i18n — path-prefixed locale routing", () => {
  // The bare path resolves the locale from Accept-Language (next-intl
  // localeDetection). Pin the browser to fr for the default-locale assertions
  // so detection doesn't redirect us to /en.
  test.describe("with a French browser", () => {
    test.use({ locale: "fr-FR" });

    test("default locale (fr) is served at the bare path", async ({ page }) => {
      await page.goto("/pricing");
      await expect(page).toHaveURL(/\/pricing$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(/paies si tu veux/i);
    });

    test("html lang is fr on the bare path", async ({ page }) => {
      await page.goto("/pricing");
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    });

    test("the default locale prefix /fr redirects to the bare path", async ({ page }) => {
      await page.goto("/fr/pricing");
      await expect(page).toHaveURL(/\/pricing$/);
    });
  });

  test("EN is served under the /en prefix", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page).toHaveURL(/\/en\/pricing$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Pay if you want/i);
    await expect(page.locator("body")).toContainText("Free");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("an English browser is auto-detected and redirected to /en", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/pricing");
    await expect(page).toHaveURL(/\/en\/pricing$/);
    await context.close();
  });

  test("EN pages expose hreflang alternates for both locales", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  });
});
