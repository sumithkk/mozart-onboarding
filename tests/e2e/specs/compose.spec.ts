import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/LoginPage"
import { ComposePage } from "../page-objects/ComposePage"
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

test.describe("Compose with File Upload", () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000)
        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        // Clear any existing auth state first
        await clearAuthState(page)

        // Navigate to login page
        await page.goto("/auth/login")
        await page.waitForLoadState("domcontentloaded")

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

        // Navigate to compose page
        const composePage = new ComposePage(page)
        await composePage.goto()
        await composePage.expectToBeOnCompose()
    })

    test("should allow user to toggle options", async ({ page }) => {
        const composePage = new ComposePage(page)

        // Change model
        await composePage.selectModel("GPT-4")
        await composePage.selectModel("Gemini 2.0 Flash Lite")

        // Toggle options
        await composePage.changeSystemPrompt("Write")
        await composePage.toggleRAG()
        await composePage.toggleMCP()
        await composePage.changeWritingFormat("Creative")
    })

    test("should open dynamic link in a new tab when MCP is enabled", async ({ page }) => {
        test.setTimeout(200000)
        const composePage = new ComposePage(page)

        // Navigate to compose page
        await composePage.goto()
        await composePage.expectToBeOnCompose()

        await composePage.toggleMCP()
        await composePage.selectModel("GPT-4 O")
        await composePage.sendMessage("Give me latest news links on AI")

        // Wait for and verify response
        await composePage.waitForResponse()
        await composePage.expectResponseReceived()
        await composePage.waitForTimeout(12000)

        // Check that the response contains dynamic links and click one
        await composePage.expectDynamicLinksPresent(1)
        const hrefs = await composePage.getDynamicLinkHrefs()
        expect(hrefs.length).toBeGreaterThan(0)
        await composePage.clickFirstDynamicLinkAndVerifyNewTab()
    })
})
