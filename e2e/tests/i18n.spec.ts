import { expect, test } from "@playwright/test";

test.describe("i18n — cookie-based locale switching", () => {
  test("EN cookie renders the EN pricing copy", async ({ page, context }) => {
    await context.addCookies([
      {
        name: "miru.locale",
        value: "en",
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Pay if you want/i);
    await expect(page.locator("body")).toContainText("Free");
  });

  test("default (no cookie) renders FR", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/paies si tu veux/i);
  });

  test("Accept-Language: en gets EN even without a cookie", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Pay if you want/i);
    await context.close();
  });
});
