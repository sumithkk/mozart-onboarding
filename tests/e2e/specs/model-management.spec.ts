import { clearAuthState, setupTestEnvironment } from "../helpers/setup-msw"
import { expect, test } from "@playwright/test"

import { LoginPage } from "../page-objects/LoginPage"
import { ModelManagementPage } from "../page-objects/ModelManagementPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

test.describe("Model Management", () => {
    test.beforeEach(async ({ page }) => {
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

    test("should allow a user to view model management page", async ({ page }) => {
        test.setTimeout(150000) // Increased timeout for summarization process
        const modelManagementPage = new ModelManagementPage(page)

        await modelManagementPage.goto()
        await modelManagementPage.expectToBeOnModelManagementPage()
    })
    test("should validate all LLM providers exist on the model management page", async ({ page }) => {
        test.setTimeout(150000) // Increased timeout for summarization process
        const modelManagementPage = new ModelManagementPage(page)

        await modelManagementPage.goto()
        await modelManagementPage.expectToBeOnModelManagementPage()

        // Validate all LLM providers exist on the model management page
        await modelManagementPage.expectLLMProviderToBeVisible("OpenAI")
        await modelManagementPage.expectLLMProviderToBeVisible("Claude")
        await modelManagementPage.expectLLMProviderToBeVisible("Gemini")
        await modelManagementPage.expectLLMProviderToBeVisible("Mistral")
        await modelManagementPage.expectLLMProviderToBeVisible("Cohere")
        await modelManagementPage.expectLLMProviderToBeVisible("Perplexity")
        await modelManagementPage.expectLLMProviderToBeVisible("Grok")
    })

    test("should expect all basic models to be visible on the model management page", async ({ page }) => {
        test.setTimeout(150000) // Increased timeout for summarization process
        const modelManagementPage = new ModelManagementPage(page)

        await modelManagementPage.goto()
        await modelManagementPage.expectToBeOnModelManagementPage()

        // Validate all basic models exist on the model management page
        await modelManagementPage.expectModelToBeVisible("Gemini 2.0 Flash")
        await modelManagementPage.expectModelToBeVisible("GPT-4")
        await modelManagementPage.expectModelToBeVisible("GPT-4 O")
        await modelManagementPage.expectModelToBeVisible("GPT-4.1")
        await modelManagementPage.expectModelToBeVisible("Command Nightly")
        await modelManagementPage.expectModelToBeVisible("Mistral Small")
        await modelManagementPage.expectModelToBeVisible("Sonar")
    })

    test("should expect all premium models to be visible on the model management page", async ({ page }) => {
        test.setTimeout(150000) // Increased timeout for summarization process
        const modelManagementPage = new ModelManagementPage(page)

        await modelManagementPage.goto()
        await modelManagementPage.expectToBeOnModelManagementPage()

        // Validate all premium models exist on the model management page
        await modelManagementPage.expectModelToBeVisible("Claude Sonnet 4")
        await modelManagementPage.expectModelToBeVisible("Claude Opus 4")
        await modelManagementPage.expectModelToBeVisible("Gemini 2.5 Flash")
        await modelManagementPage.expectModelToBeVisible("Grok 4")
        await modelManagementPage.expectModelToBeVisible("Mistral Large")
        await modelManagementPage.expectModelToBeVisible("O3")
        await modelManagementPage.expectModelToBeVisible("O4 Mini")
        await modelManagementPage.expectModelToBeVisible("Sonar Deep Research")
    })
})
