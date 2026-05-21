import { defineConfig, devices } from "@playwright/test";

const WEB_URL = process.env.E2E_WEB_URL ?? "http://localhost:3000";
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3001";
const IS_CI = !!process.env.CI;

/**
 * Playwright config — assumes the api and web servers are already running
 * in local dev (the `dev` turbo task starts both). In CI we boot them with
 * webServer below.
 *
 * Tests live under /e2e/tests and use a single Chromium project by default.
 * Add Firefox/WebKit projects once the CI footprint is justified.
 */
export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  workers: 1,
  reporter: IS_CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: WEB_URL,
    extraHTTPHeaders: {
      "x-e2e": "1",
    },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: IS_CI
    ? [
        {
          command: "pnpm --filter api dev",
          url: API_URL + "/health",
          timeout: 120_000,
          reuseExistingServer: false,
        },
        {
          command: "pnpm --filter web dev",
          url: WEB_URL,
          timeout: 120_000,
          reuseExistingServer: false,
        },
      ]
    : undefined,
});
