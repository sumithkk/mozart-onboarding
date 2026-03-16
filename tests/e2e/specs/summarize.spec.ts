import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/LoginPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"
import { SummarizePage } from "../page-objects/SummarizePage"
import { setupTestEnvironment, clearAuthState } from "../helpers/setup-msw"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

test.describe("Summarize", () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(150000)
        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        // Clear any existing auth state first
        await clearAuthState(page)

        // Navigate to login page
        await page.goto("/login")
        await page.waitForLoadState("networkidle")

        // Wait for Vue app to mount before looking for elements
        await page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )

        // Wait for client-side rendering to complete (since SSR is disabled)
        await page.waitForSelector('input[id="email"]', { timeout: 15000 })

        const loginPage = new LoginPage(page)
        const workbenchPage = new WorkbenchPage(page)

        // We're already on the login page from beforeEach
        await loginPage.expectToBeOnLoginPage()

        // Perform login with test credentials
        await loginPage.login(TEST_USER, TEST_PASSWORD)

        // Verify successful login and redirect
        await loginPage.expectSuccessfulLogin()
        await workbenchPage.expectToBeOnWorkbench()
        await workbenchPage.expectUserName(TEST_USER_NAME)
    })

    test.afterEach(async ({ page }) => {
        test.setTimeout(150000)
        const workbenchPage = new WorkbenchPage(page)
        await workbenchPage.goto()
        await workbenchPage.expectToBeOnWorkbench()
        await workbenchPage.waitForCleanup()
    })

    test("should allow a user to summarize a PDF file", async ({ page }) => {
        test.setTimeout(150000) // Increased timeout for summarization process
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()

        // Upload file
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await workbenchPage.uploadFile(testFilePath)

        // Wait for toast to be visible
        await workbenchPage.waitForToast()
        const toastMessage = await workbenchPage.getToastMessage()
        expect(toastMessage).toContain("File document.pdf uploaded successfully")

        // Verify file is uploaded
        await workbenchPage.expectFileExists("document.pdf")

        // Navigate to summarize page
        const summarizePage = new SummarizePage(page)
        await summarizePage.goto()
        await summarizePage.expectToBeOnSummarizePage()

        // Wait for the file to be visible in the workbench section
        await page.waitForSelector("div:has-text('document.pdf')", { timeout: 15000 })

        // Select the uploaded PDF file
        await summarizePage.selectFile("document.pdf")
        await summarizePage.expectFileToBeSelected("document.pdf")

        // Set page range to 1
        await summarizePage.setPageRange("1")

        // Verify the summarize button is enabled
        await summarizePage.expectSummarizeButtonToBeEnabled()

        // Click the summarize button
        await summarizePage.clickSummarize()

        // Wait for the summary process to complete by waiting for summary content to appear
        // This is more reliable than arbitrary timeout - waits for actual content
        await summarizePage.expectSummaryToBeVisible()

        // Verify the specific summary content for page 1
        const summaryContent = page.getByText("PDF: document.pdf")
        await expect(summaryContent).toBeVisible({ timeout: 10000 })
    })
})
