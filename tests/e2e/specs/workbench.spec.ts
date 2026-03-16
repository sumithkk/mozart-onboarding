import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/LoginPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"
import { setupTestEnvironment, clearAuthState } from "../helpers/setup-msw"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

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

    test("should allow user to upload file", async ({ page }) => {
        test.setTimeout(100000)
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()

        // Wait for any cleanup toasts to clear before uploading
        await workbenchPage.waitForTimeout(2000)
        // Wait for any existing toasts to disappear
        try {
            await page.waitForSelector("[data-sonner-toast]", { state: "hidden", timeout: 5000 }).catch(() => { })
        } catch (e) {
            // Toasts might not be visible, continue
        }

        // Upload file
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await workbenchPage.uploadFile(testFilePath)

        // Wait for upload toast specifically (either success or already exists)
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
    })

    test("should allow user to upload file via drag and drop", async ({ page }) => {
        test.setTimeout(100000)
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()

        // Read the actual file content
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        const fileContent = fs.readFileSync(testFilePath)

        // Upload file via drag and drop with actual file content
        // This method already handles toast validation and file existence check internally
        await workbenchPage.uploadFileViaRealDragAndDrop(testFilePath, Array.from(fileContent))

        // The method should have already verified the file exists, but if it didn't throw an error, we're good
    })

    test("should allow user to search file", async ({ page }) => {
        const workbenchPage = new WorkbenchPage(page)
        await workbenchPage.waitForCleanup()

        // Upload file first so we can search for it
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await workbenchPage.uploadFile(testFilePath)

        // Wait for upload toast
        await workbenchPage.waitForToast()
        const toastMessage = await workbenchPage.getToastMessage()
        // Accept either success or "already exists" message
        const isSuccess = toastMessage.includes("File document.pdf uploaded successfully") ||
            toastMessage.includes("uploaded successfully") ||
            toastMessage.includes("already exists")
        expect(isSuccess).toBe(true)

        // Verify file is uploaded before searching
        await workbenchPage.expectFileExists("document.pdf")

        // Search for the file
        await workbenchPage.searchFile("document.pdf")

        // Verify file is still visible after search
        await workbenchPage.expectFileExists("document.pdf")
    })

    test("should allow user to delete file", async ({ page }) => {
        test.setTimeout(100000)
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()

        // First, create a file to delete
        const testFilePath = path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf")
        await workbenchPage.uploadFile(testFilePath)

        // Wait for upload toast
        await workbenchPage.waitForToast()
        let toastMessage = await workbenchPage.getToastMessage()
        expect(toastMessage).toContain("File document.pdf uploaded successfully")

        // Verify file exists
        await workbenchPage.expectFileExists("document.pdf")

        // Wait a bit for the UI to stabilize
        await workbenchPage.waitForTimeout(2000)

        // Now delete the file
        await workbenchPage.deleteFile("document.pdf")

        // Wait for delete toast
        await workbenchPage.waitForToast()
        toastMessage = await workbenchPage.getToastMessage()
        expect(toastMessage).toContain("File deleted successfully")

        // Verify file is deleted
        await workbenchPage.expectFileNotExists("document.pdf")
    })

    test("should allow user to create folder", async ({ page }) => {
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()
        await workbenchPage.createFolder("test-folder")

        // Wait for toast to be visible
        await workbenchPage.waitForToast()
        const toastMessage = await workbenchPage.getToastMessage()
        expect(toastMessage).toContain("Folder created successfully")

        // Verify folder is created
        await workbenchPage.expectFolderExists("test-folder")
    })

    test("should allow user to delete folder", async ({ page }) => {
        test.setTimeout(100000)
        const workbenchPage = new WorkbenchPage(page)

        await workbenchPage.waitForCleanup()

        // First, create a folder to delete
        await workbenchPage.createFolder("test-folder")

        // Wait for create toast
        await workbenchPage.waitForToast()
        let toastMessage = await workbenchPage.getToastMessage()
        expect(toastMessage).toContain("Folder created successfully")

        // Verify folder exists
        await workbenchPage.expectFolderExists("test-folder")

        // Wait a bit for the UI to stabilize
        await workbenchPage.waitForTimeout(2000)

        // Now delete the folder
        await workbenchPage.deleteFolder("test-folder")

        // Wait for delete toast
        await workbenchPage.waitForToast()
        toastMessage = await workbenchPage.getToastMessage()
        expect(toastMessage).toContain("Folder deleted successfully")

        // Verify folder is deleted
        await workbenchPage.expectFolderNotExists("test-folder")
    })

    test("should allow user to upload a file in a folder and then delete it", async ({ page }) => {
        test.setTimeout(300000)
        const workbenchPage = new WorkbenchPage(page)
        await workbenchPage.waitForCleanup()

        await workbenchPage.createFolder("test-folder")
        await workbenchPage.expectFolderExists("test-folder")
        await workbenchPage.navigateToFolder("test-folder")

        // Ensure file doesn't exist in folder before uploading
        try {
            await workbenchPage.deleteFileIfExists("document.pdf")
            await workbenchPage.waitForTimeout(1000)
        } catch (e) {
            // File doesn't exist, which is fine
        }

        await workbenchPage.uploadFile(path.resolve(__dirname, "../../../src/assets/test-resources/document.pdf"))

        // Wait for toast to be visible
        await workbenchPage.waitForToast()
        const toastMessage = await workbenchPage.getToastMessage()
        // Accept either success or "already exists" message
        const isSuccess = toastMessage.includes("File document.pdf uploaded successfully") ||
            toastMessage.includes("already exists")
        expect(isSuccess).toBe(true)

        // Delete file
        await workbenchPage.waitForTimeout(3000)
        await workbenchPage.deleteFile("document.pdf")

        // Wait for toast to be visible
        await workbenchPage.waitForToast()
        const fileDeletionToastMessage = await workbenchPage.getToastMessage()
        expect(fileDeletionToastMessage).toContain("File deleted successfully")

        // Verify file is deleted
        await workbenchPage.expectFileNotExists("document.pdf")

        // Navigate to parent folder
        await workbenchPage.navigateToHomePage()

        // Delete folder
        await workbenchPage.waitForTimeout(3000)
        await workbenchPage.deleteFolder("test-folder")

        // Wait for toast to be visible
        await workbenchPage.waitForToast()
        const folderDeletionToastMessage = await workbenchPage.getToastMessage()
        expect(folderDeletionToastMessage).toContain("Folder deleted successfully")

        // Verify folder is deleted
        await workbenchPage.expectFolderNotExists("test-folder")
    })

})
