import { defineConfig, devices } from "@playwright/test"
import * as dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./tests/e2e/specs",
    /* Run tests in files in parallel - DISABLED to prevent resource contention */
    /* When multiple E2E tests hit localhost:3000 simultaneously, the dev server */
    /* gets overwhelmed, causing page load timeouts and Vue mounting failures */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Run tests sequentially to avoid dev server overload */
    workers: 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [["list"], ["html", { open: "never" }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.CLIENT_URL || "http://localhost:3000",

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",

        /* Screenshot on failure */
        screenshot: "only-on-failure",

        /* Video recording */
        video: "retain-on-failure",

        /* Extra HTTP headers */
        extraHTTPHeaders: {
            Accept: "application/json",
        },

        /* Allow popups for OAuth flows */
        permissions: ["clipboard-read", "clipboard-write"],

        /* Browser context settings for OAuth */
        storageState: process.env.CI ? "storage/google.json" : undefined,

        /* Enable third-party cookies for OAuth */
        contextOptions: {
            ignoreHTTPSErrors: true,
        },
    },

    /* Global setup and teardown */
    globalSetup: "./tests/e2e/helpers/global-setup.ts",
    globalTeardown: "./tests/e2e/helpers/global-teardown.ts",

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },

        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Assuming dev server is already running */
    // webServer: {
    //     command: 'npm run dev',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120 * 1000,
    // },
})
