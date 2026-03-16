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
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

test.describe("Compose with File Upload", () => {
    test.beforeEach(async ({ page }) => {
        // Increase timeout for beforeEach in UI mode and parallel execution
        test.setTimeout(60000)

        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        // Clear any existing auth state first
        await clearAuthState(page)

        // Navigate to login page
        await page.goto("/auth/login", { waitUntil: "domcontentloaded" })
        // Use domcontentloaded instead of networkidle for better reliability in UI mode
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
    })

    test("should allow user to create conversation with file upload", async ({ page }) => {
        test.setTimeout(200000)
        const composePage = new ComposePage(page)

        // Navigate to compose page
        await composePage.goto()
        await composePage.expectToBeOnCompose()

        // Upload a test file
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await composePage.uploadFile(testFilePath)
        await composePage.expectFileUploaded()

        // Send a message about the file
        await composePage.selectModel("GPT-4 O")
        await composePage.sendMessage("What does this mean?")

        // Wait for and verify response
        await composePage.waitForResponse()
        await composePage.expectResponseReceived()

        // Check that the response contains expected content
        const responseContent = await composePage.getLastMessageContent()
        expect(responseContent).toMatch(/\btest(ing)?\b/i)
    })

    test("should allow user to rename conversation", async ({ page }) => {
        test.setTimeout(150000)

        // Mock the conversations list to return one conversation
        await page.route("**/api/conversation/get*", async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        code: 200,
                        message: "Conversations retrieved",
                        data: {
                            conversations: {
                                "test-conv-123": {
                                    conversationId: "test-conv-123",
                                    id: "test-conv-123",
                                    title: "Original Title",
                                    updatedAt: new Date().toISOString(),
                                    metaData: { type: "compose" },
                                    isShared: false,
                                    isArchived: false,
                                    userId: "test-user-id"
                                }
                            },
                            offset: { compose: 0, interaction: 0 },
                            sharedOffset: { compose: 0, interaction: 0 },
                            hasMore: false
                        }
                    })
                })
            } else {
                await route.continue()
            }
        })

        // Mock the rename endpoint
        await page.route("**/api/conversation/rename", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    code: 200,
                    message: "Conversation renamed successfully",
                    data: { success: true }
                })
            })
        })

        const composePage = new ComposePage(page)
        await composePage.goto()
        await composePage.expectToBeOnCompose()

        // Wait for the conversation list to load and show the new conversation
        await page.waitForSelector("[data-conversation-id]", { timeout: 30000 })

        // Generate a random substring for Title
        const randomSubstring = Math.random().toString(36).substring(2, 15)
        const newTitle = "Test Conversation " + randomSubstring

        // Now rename the conversation
        await composePage.renameConversation(newTitle)
    })

    test("should allow user to delete conversation", async ({ page }) => {
        test.setTimeout(100000)
        const composePage = new ComposePage(page)

        await composePage.goto()
        await composePage.expectToBeOnCompose()

        // Delete conversation
        await composePage.deleteConversation()

        // Verify conversation is deleted
        await composePage.expectToBeOnCompose()
    })

    test("should allow file upload with RAG enabled", async ({ page }) => {
        test.setTimeout(200000)
        const composePage = new ComposePage(page)

        await composePage.goto()
        await composePage.expectToBeOnCompose()

        // Enable RAG mode
        await composePage.toggleRAG()

        // Select a collection
        await composePage.selectCollection("Mozart_collection")

        // Upload file
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await composePage.uploadFile(testFilePath)

        // Send RAG query
        await composePage.sendMessage("Search for specific information in my documents.")

        await composePage.waitForResponse()
        const responseContent = await composePage.getLastMessageContent()

        // Response should include RAG sources
        expect(responseContent).toBeTruthy()
    })
})
