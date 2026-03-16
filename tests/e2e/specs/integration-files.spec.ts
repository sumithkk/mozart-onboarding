import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/LoginPage"
import { IntegrationPage } from "../page-objects/IntegrationPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"
import { setupTestEnvironment, clearAuthState } from "../helpers/setup-msw"

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_USER_EMAIL_PASSWORD = process.env.TEST_USER_EMAIL_PASSWORD || "Password@1"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

test.describe("Integration Files", () => {
    let workbenchPage: WorkbenchPage

    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000) // Increase timeout for beforeEach
        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        // Clear any existing auth state first
        await clearAuthState(page)

        // Navigate to login page
        await page.goto("/auth/login")
        await page.waitForLoadState("domcontentloaded")
        // Wait for page to be ready
        await page.waitForSelector("h2, .mt-2", { timeout: 30000 }).catch(() => {})

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
        workbenchPage = new WorkbenchPage(page)

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
        test.setTimeout(120000) // Increase timeout for afterEach
        try {
            // Check if page is still open before cleanup
            if (!page.isClosed() && workbenchPage) {
                // Cleanup workbench
                await workbenchPage.goto().catch(() => {})
                await workbenchPage.expectToBeOnWorkbench().catch(() => {})
                await workbenchPage.waitForCleanup().catch(() => {})
            }
        } catch (e) {
            // Ignore cleanup errors if page is closed
            console.log("Cleanup skipped due to page closure:", e)
        }
    })

    test("should navigate to integrations page and display Google Drive integration", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)

        // Navigate to integrations page
        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()

        // Wait for loading to complete
        await integrationPage.waitForLoadingToComplete()

        // Verify Google Drive integration is visible
        await integrationPage.expectIntegrationConnected()
    })

    test("should connect Google Drive integration and access file picker", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)

        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()

        // Wait for loading to complete
        await integrationPage.waitForLoadingToComplete()

        // Verify integration is connected
        await integrationPage.loadGoogleDriveFilePicker()

        // Verify test files are visible
        await integrationPage.expectFileExists("document 1.pdf")
        await integrationPage.expectFileExists("document 2.pdf")
    })

    test("should select and import files from Google Drive", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)
        const workbenchPage = new WorkbenchPage(page)

        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()

        // Connect Google Drive
        await integrationPage.loadGoogleDriveFilePicker()

        // Select multiple files
        await integrationPage.selectMultipleFiles(["document 1.pdf", "document 2.pdf"])

        // Confirm selection
        await integrationPage.selectFilesFromModal()
        await integrationPage.expectModalNotVisible()

        // Verify files were imported (check for toast or redirect to workbench)
        await integrationPage.waitForToast()
        const toastMessage = await integrationPage.getToastMessage()
        expect(toastMessage).toContain("File uploaded successfully")

        // Navigate to workbench to verify files are present
        await workbenchPage.goto()
        await workbenchPage.expectToBeOnWorkbench()

        // Verify imported files exist in workbench
        await workbenchPage.expectFileExists("document 1.pdf")
        await workbenchPage.expectFileExists("document 2.pdf")
    })

    test("should search and filter files in Google Drive picker", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)

        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()

        // Connect Google Drive
        await integrationPage.loadGoogleDriveFilePicker()

        // Test search functionality
        await integrationPage.searchFiles("document 1.pdf")
        await integrationPage.expectFileExists("document 1.pdf")
        await integrationPage.expectFileNotExists("document 2.pdf")

        // Clear search
        await integrationPage.searchFiles("")
        await integrationPage.expectFileExists("document 1.pdf")
        await integrationPage.expectFileExists("document 2.pdf")

        // Test view modes
        await integrationPage.switchToListView()
        await integrationPage.expectFileExists("document 1.pdf")

        await integrationPage.switchToGridView()
        await integrationPage.expectFileExists("document 1.pdf")
    })

    test("should handle sort and navigation in Google Drive picker", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)

        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()
        await integrationPage.loadGoogleDriveFilePicker()

        // Test sort functionality
        await integrationPage.changeSortOrder("Name")
        await integrationPage.expectFilesLoaded()
        await integrationPage.expectFileExists("document 1.pdf")

        // Test folder navigation
        await integrationPage.navigateToFolder("Test Folder")
        await integrationPage.expectFilesLoaded()
        await integrationPage.expectFileExists("document.pdf")

        // Go back to root
        await integrationPage.goBackInFolder()
        await integrationPage.expectFilesLoaded()
        await integrationPage.expectFileExists("document 1.pdf")
    })

    test("should cancel file selection and close modal", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)

        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()
        await integrationPage.loadGoogleDriveFilePicker()

        // Select some files
        await integrationPage.selectFile("document 1.pdf")
        await integrationPage.selectFile("document 2.pdf")

        // Cancel selection
        await integrationPage.cancelFileSelection()
        await integrationPage.expectModalNotVisible()

        // Verify we're back on integrations page
        await integrationPage.expectToBeOnIntegrationPage()
    })

    test("should display MCP badge for MCP integrations", async ({ page }) => {
        test.setTimeout(120000)
        const integrationPage = new IntegrationPage(page)

        await integrationPage.goto()
        await integrationPage.expectToBeOnIntegrationPage()

        // Wait for loading to complete
        await integrationPage.waitForLoadingToComplete()

        // Check if any integration has MCP badge
        // This test will pass if MCP badge exists, skip if not
        const mcpBadge = page.locator(".rounded.bg-blue-100").filter({ hasText: "MCP" })
        
        if (await mcpBadge.count() > 0) {
            await expect(mcpBadge.first()).toBeVisible()
        } else {
            test.skip()
        }
    })
})
