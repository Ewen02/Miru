import { expect, test } from "@playwright/test";

/**
 * Guards the SEO surface: JSON-LD structured data, canonical, and the
 * sitemap/robots metadata routes. These run against the marketing/static
 * pages so they don't depend on the catalog API being populated.
 */
test.describe("SEO", () => {
  test("home emits WebSite + Organization JSON-LD", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((b) => JSON.parse(b)["@type"]);
    expect(types).toContain("WebSite");
    expect(types).toContain("Organization");
    // WebSite node carries a SearchAction wired to /search.
    const website = blocks.map((b) => JSON.parse(b)).find((n) => n["@type"] === "WebSite");
    expect(website.potentialAction?.target?.urlTemplate).toContain("/search?q=");
  });

  test("every page has a self-referencing canonical", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });

  test("robots.txt references the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toMatch(/Sitemap:/i);
  });

  test("sitemap.xml is served and lists URLs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("<loc>");
  });
});
