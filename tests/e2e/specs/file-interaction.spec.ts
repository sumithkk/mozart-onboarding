import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/LoginPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"
import { setupTestEnvironment, clearAuthState } from "../helpers/setup-msw"
import path from "path"
import { fileURLToPath } from "url"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_USER_EMAIL_PASSWORD = process.env.TEST_USER_EMAIL_PASSWORD || "Password@1"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

test.describe("Workbench", () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000)
        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        // Clear any existing auth state first
        await clearAuthState(page)

        // Navigate to login page
        await page.goto("/auth/login")
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
        const workbenchPage = new WorkbenchPage(page)
        await workbenchPage.goto()
        await workbenchPage.expectToBeOnWorkbench()
        await workbenchPage.waitForCleanup()
    })

    test("should allow user to upload file and interact with it", async ({ page }) => {
        test.setTimeout(180000) // 3 minutes should be enough since it works fast locally
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()

        // Upload file
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await workbenchPage.uploadFile(testFilePath)

        // Wait for upload toast specifically (either success or already exists)
        // This ensures we get the upload toast, not a stale toast from cleanup
        try {
            await workbenchPage.waitForToastWithMessage("uploaded successfully", 30000)
        } catch (e) {
            // If that doesn't work, try waiting for "already exists"
            try {
                await workbenchPage.waitForToastWithMessage("already exists", 10000)
            } catch (e2) {
                // Fallback to regular toast wait
                await workbenchPage.waitForToast()
            }
        }

        const toastMessage = await workbenchPage.getToastMessage()
        // Accept either success or "already exists" message
        const isSuccess = toastMessage.includes("File document.pdf uploaded successfully") ||
            toastMessage.includes("uploaded successfully") ||
            toastMessage.includes("already exists")
        expect(isSuccess).toBe(true)

        // Verify file is uploaded
        await workbenchPage.expectFileExists("document.pdf")

        // Open file
        await workbenchPage.openFile("document.pdf")

        // Verify file is opened
        await workbenchPage.expectFileOpened("document.pdf")

        // Start a conversation about the file
        await workbenchPage.sendMessage("What is in this file? Tell me about its content.")

        // Select 4-o mini model

        // Wait for and verify response
        await workbenchPage.waitForResponse()
        await workbenchPage.expectResponseReceived()

        // Check that the response contains "testing"
        const responseContent = await workbenchPage.getLastMessageContent()
        expect(responseContent).toContain("testing")
    })
})
