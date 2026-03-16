import { test, expect } from "@playwright/test"
import { LoginPage } from "../page-objects/LoginPage"
import { WorkbenchPage } from "../page-objects/WorkbenchPage"
import { setupTestEnvironment, clearAuthState } from "../helpers/setup-msw"
import fs from "fs"

// Get test credentials from environment variables
const TEST_USER = process.env.TEST_USER_EMAIL || "test@example.com"
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || "password"
const TEST_USER_NAME = process.env.TEST_USER_USERNAME || "Test"

test.describe("User Login", () => {
    test.beforeEach(async ({ page }, testInfo) => {
        // Setup MSW for API mocking
        await setupTestEnvironment(page, { enableMSW: true })

        const isGoogleLogin = testInfo.title.includes("Google login")
        if (isGoogleLogin) return

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
    })

    test("should allow a user to login with valid credentials", async ({ page }) => {
        test.setTimeout(100000)
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

    test("should display error message on invalid login", async ({ page }) => {
        const loginPage = new LoginPage(page)

        // We're already on the login page from beforeEach
        await loginPage.expectToBeOnLoginPage()

        // Attempt login with invalid credentials
        await loginPage.login("invalid@test.com", "Password@1")

        // Verify error message is displayed
        await loginPage.expectLoginError("Invalid email or password")
    })

    test("should allow user to log out", async ({ page }) => {
        test.setTimeout(100000)
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

        // Wait for page to stabilize
        await page.waitForLoadState("domcontentloaded")

        // Click on the user menu
        await workbenchPage.userMenu(TEST_USER_NAME).waitFor({ state: "visible", timeout: 10000 })
        await workbenchPage.userMenu(TEST_USER_NAME).click()

        // Wait for menu to appear
        await workbenchPage.logoutButton.waitFor({ state: "visible", timeout: 5000 })
        
        // Click on the logout button
        await workbenchPage.logoutButton.click()

        // Wait for redirect to login page
        await page.waitForURL(/.*\/auth\/login/, { timeout: 10000 })
        await loginPage.expectToBeOnLoginPage()
    })

    test("should redirect to forgot password page", async ({ page }) => {
        const loginPage = new LoginPage(page)

        // We're already on the login page from beforeEach
        await loginPage.goToForgotPassword()

        await expect(page).toHaveURL(/.*\/forgotPassword/)
    })

    test("should redirect to sign up page", async ({ page }) => {
        const loginPage = new LoginPage(page)

        // We're already on the login page from beforeEach
        await loginPage.goToSignUp()

        await expect(page).toHaveURL(/.*\/signUp/)
    })

    test("should handle login form validation", async ({ page }) => {
        const loginPage = new LoginPage(page)

        // We're already on the login page from beforeEach
        // Try to submit empty form
        await loginPage.loginButton.click()

        // Check for form validation messages
        const emailValidation = page.locator('input[id="email"]:invalid')
        const passwordValidation = page.locator('input[id="password"]:invalid')

        await expect(emailValidation).toBeVisible()
        await expect(passwordValidation).toBeVisible()
    })
})
