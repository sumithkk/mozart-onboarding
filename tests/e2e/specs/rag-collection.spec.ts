import { clearAuthState, setupTestEnvironment } from "../helpers/setup-msw"
import { expect, test } from "@playwright/test"

import { LoginPage } from "../page-objects/LoginPage"
import { RAGCollectionPage } from "../page-objects/RAGCollectionPage"
import { RAGDataPage } from "../page-objects/RAGDataPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_USER_EMAIL_PASSWORD = process.env.TEST_USER_EMAIL_PASSWORD || "Password@1"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"
const TEST_COLLECTION_NAME = `MOZ_${Math.random().toString(36).substring(2, 6)}`

test.describe("RAG Collection Management", () => {
    let ragCollectionPage: RAGCollectionPage
    let ragDataPage: RAGDataPage

    test.beforeEach(async ({ page }) => {
        test.setTimeout(300000)
        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        // Clear any existing auth state first
        await clearAuthState(page)

        // Navigate to login page
        await page.goto("/auth/login")
        await page.waitForLoadState("domcontentloaded")

        // Wait for Vue app to mount before looking for elements
        // Use a more reliable check with multiple conditions
        await page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                const isReady = document.readyState === "complete" || document.readyState === "interactive"
                const hasNuxt = nuxtElement !== null
                const hasContent = nuxtElement && nuxtElement.innerHTML.trim() !== ""
                // Also check if email input exists (indicates page is ready)
                const hasEmailInput = document.querySelector('input[id="email"]') !== null
                return isReady && hasNuxt && (hasContent || hasEmailInput)
            },
            { timeout: 30000 }
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

        // Navigate to RAG collection page
        ragCollectionPage = new RAGCollectionPage(page)
        ragDataPage = new RAGDataPage(page)
        await ragCollectionPage.goto()
        await ragCollectionPage.expectToBeOnRAGCollectionPage()
    })

    test.afterEach(async ({ page }) => {
        // Delete all collections which include MOZ_ in the name
        const ragCollectionPage = new RAGCollectionPage(page)
        await ragCollectionPage.deleteCollectionsForCleanup()
    })

    test("should display at least one collection", async ({ page }) => {
        // Test that collections are visible and there's at least one
        await ragCollectionPage.expectCollectionsToBeVisible()

        const collectionCount = await ragCollectionPage.getCollectionCount()
        expect(collectionCount).toBeGreaterThan(0)
    })

    test("should create a new collection", async ({ page }) => {
        // Get initial collection count
        const initialCount = await ragCollectionPage.getCollectionCount()

        // Create a new collection
        await ragCollectionPage.createCollection(TEST_COLLECTION_NAME, "bert", "Cosine", "cloud")
        await ragCollectionPage.waitForTimeout(2000)

        // Verify collection was created
        await ragCollectionPage.expectCollectionToExist(TEST_COLLECTION_NAME)

        // Verify collection count increased
        const newCount = await ragCollectionPage.getCollectionCount()
        expect(newCount).toBe(initialCount + 1)
    })

    test("should delete a collection", async ({ page }) => {
        // First create a collection to delete
        await ragCollectionPage.createCollection(TEST_COLLECTION_NAME)

        // Verify it exists
        await ragCollectionPage.expectCollectionToExist(TEST_COLLECTION_NAME)

        // Get initial count
        const initialCount = await ragCollectionPage.getCollectionCount()

        // Delete the collection
        await ragCollectionPage.deleteCollection(TEST_COLLECTION_NAME)
        await page.waitForTimeout(2000)

        // Verify collection was deleted
        await ragCollectionPage.expectCollectionNotToExist(TEST_COLLECTION_NAME)

        // Verify collection count decreased
        const newCount = await ragCollectionPage.getCollectionCount()
        expect(newCount).toBe(initialCount - 1)
    })

    test("should toggle between list and widget view", async ({ page }) => {
        // Test should start in widget view (default)
        await ragCollectionPage.expectViewMode("widget")

        // Toggle to list view
        await ragCollectionPage.toggleToListView()
        await ragCollectionPage.expectViewMode("list")

        // Toggle back to widget view
        await ragCollectionPage.toggleToWidgetView()
        await ragCollectionPage.expectViewMode("widget")
    })

    test("should sort collections by name", async ({ page }) => {
        // Create multiple collections with different names to test sorting
        const collectionNames = [`MOZ_ZZZZ`, `MOZ_AAAA`, `MOZ_ABCD`]

        // Create collections in reverse alphabetical order
        for (const name of collectionNames) {
            await ragCollectionPage.createCollection(name)
        }

        // Sort by name
        await ragCollectionPage.sortCollectionsByName()

        // Verify collections exist (basic check)
        for (const name of collectionNames) {
            await ragCollectionPage.expectCollectionToExist(name)
        }

        // Verify collections are sorted by name
        await ragCollectionPage.expectCollectionsToBeSortedByName()
    })

    test("should handle collection with different embedding methods", async ({ page }) => {
        const testCollectionName = `MOZ_Stella`

        // Create collection with Stella embedding
        await ragCollectionPage.createCollection(testCollectionName, "stella", "Euclidean", "local")

        // Verify collection was created
        await ragCollectionPage.expectCollectionToExist(testCollectionName)
    })

    test("should handle migration to data page and verify records", async ({ page }) => {
        // Verify collection exists
        await ragCollectionPage.expectCollectionToExist("Mozart_")

        // Double-click collection to navigate to data page
        await ragCollectionPage.doubleClickCollection("Mozart_")

        // Verify we're on the data page
        await ragDataPage.expectToBeOnDataPage()

        // Wait for data to load
        await ragDataPage.waitForDataToLoad()

        // Verify page elements are visible
        await ragDataPage.expectResultsHeadingToBeVisible()
        await ragDataPage.expectViewTogglesToBeVisible()

        // Switch to table view to verify table structure
        await ragDataPage.switchToTableView()

        // Verify the data table is visible
        await ragDataPage.expectDataTableToBeVisible()

        // Verify table columns
        await ragDataPage.verifyDefaultTableColumns()

        // Get record count and verify records exist or handle empty state
        const recordCount = await ragDataPage.getDataTableRecordCount()
        if (recordCount > 0) {
            // If we have records, verify they exist
            await ragDataPage.expectDataRecordsToExist()
            console.log(`Found ${recordCount} records in the data table`)
        } else {
            console.log("No records found in the data table - this is acceptable for an empty collection")
        }

        // Also test widget view
        await ragDataPage.switchToWidgetView()
        await page.waitForTimeout(1000)
    })

    test("should navigate directly to data page and verify view switching", async ({ page }) => {
        // Navigate directly to data page (demonstrating RAGDataPage reusability)
        await ragDataPage.goto()
        await ragDataPage.expectToBeOnDataPage()

        // Wait for data to load
        await ragDataPage.waitForDataToLoad()

        // Test view switching functionality
        await ragDataPage.expectViewTogglesToBeVisible()

        // Start in table view (default)
        await ragDataPage.switchToTableView()
        await ragDataPage.expectTableViewToBeActive()

        // Switch to widget view
        await ragDataPage.switchToWidgetView()
        await ragDataPage.expectWidgetViewToBeActive()

        // Switch back to table view
        await ragDataPage.switchToTableView()
        await ragDataPage.expectTableViewToBeActive()

        // Verify delete collection button is visible
        await ragDataPage.expectDeleteCollectionButtonToBeVisible()
    })
})
