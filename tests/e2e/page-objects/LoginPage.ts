import type { Locator, Page } from "@playwright/test"

import { expect } from "@playwright/test"

export class LoginPage {
    readonly page: Page
    readonly emailInput: Locator
    readonly passwordInput: Locator
    readonly loginButton: Locator
    readonly signUpLink: Locator
    readonly forgotPasswordLink: Locator
    readonly googleLoginButton: Locator
    readonly appleLoginButton: Locator
    readonly toast: Locator
    readonly errorMessage: Locator

    constructor(page: Page) {
        this.page = page
        this.emailInput = page.locator('input[id="email"]')
        this.passwordInput = page.locator('input[id="password"]')
        this.loginButton = page.getByRole("button", { name: "Sign In" })
        this.signUpLink = page.getByText("Sign Up")
        this.forgotPasswordLink = page.getByRole('link', { name: 'Forget your password' })
        this.googleLoginButton = page.locator(".g_id_signin")
        this.appleLoginButton = page.getByRole("button", { name: "Sign in with Apple" })
        this.toast = page.locator("[data-sonner-toast]")
        this.errorMessage = page.locator(".error-message")
    }

    async goto() {
        await this.page.goto("/auth/login")
        await this.page.waitForLoadState("domcontentloaded")

        // Wait for Vue app to mount before looking for elements
        await this.page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )

        // Wait for client-side rendering to complete (since SSR is disabled)
        await this.page.waitForSelector('input[id="email"]', { timeout: 10000 })
    }

    async login(email: string, password: string) {
        await this.page.waitForSelector('input[id="email"]', { timeout: 10000 })
        await this.page.waitForSelector('input[id="password"]', { timeout: 10000 })
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
    }

    async loginWithGoogle(email: string, password: string) {
        // Wait for Google Sign-In container to load
        await this.page.waitForSelector(".g_id_signin", { timeout: 10000 })

        // Handle popup window for Google OAuth
        const popupPromise = this.page.waitForEvent("popup")

        // Click the Google Sign-In button
        await this.page.click(".g_id_signin")

        // Wait for the popup to open
        const popup = await popupPromise

        try {
            // Wait for the Google login page to load
            await popup.waitForLoadState("networkidle")

            // Handle email input (try multiple selectors)
            const emailSelectors = ['input[type="email"]', 'input[id="identifierId"]', 'input[name="identifier"]', 'input[autocomplete="username"]']

            let emailInput = null
            for (const selector of emailSelectors) {
                try {
                    await popup.waitForSelector(selector, { timeout: 3000 })
                    emailInput = popup.locator(selector)
                    break
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!emailInput) {
                throw new Error("Could not find email input field")
            }

            // Fill in email
            await emailInput.fill(email)

            // Wait a moment for the form to update
            await popup.waitForTimeout(1000)

            // Click next button (try multiple selectors)
            const nextButtonSelectors = ["#identifierNext", 'button[type="submit"]', 'button[jsname="LgbsSe"]', 'button:has-text("Next")', 'input[type="submit"]', 'div[role="button"]:has-text("Next")', "[data-continue-identifier]", "button:not([disabled])"]

            let nextButtonClicked = false
            for (const selector of nextButtonSelectors) {
                try {
                    // Wait for the button to be visible and enabled
                    await popup.waitForSelector(selector, {
                        state: "visible",
                        timeout: 5000,
                    })

                    // Check if button is enabled
                    const isEnabled = await popup.locator(selector).isEnabled()
                    if (!isEnabled) {
                        continue
                    }

                    await popup.click(selector)
                    nextButtonClicked = true
                    break
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!nextButtonClicked) {
                throw new Error("Could not find or click next button after email input")
            }

            // Wait for navigation after clicking next
            await popup.waitForLoadState("networkidle", { timeout: 15000 })

            // Check if we're on an account selection page
            const accountSelectors = ["[data-email]", "[data-identifier]", 'div[role="button"]:has-text("' + email + '")', 'li[data-value]:has-text("' + email + '")']

            let accountFound = false
            for (const selector of accountSelectors) {
                try {
                    await popup.waitForSelector(selector, { timeout: 3000 })
                    await popup.click(selector)
                    accountFound = true
                    await popup.waitForLoadState("networkidle", { timeout: 10000 })
                    break
                } catch (e) {
                    // Continue to next selector
                }
            }

            // Wait for password page and fill password
            const passwordSelectors = ['input[type="password"]', 'input[name="password"]', 'input[autocomplete="current-password"]', 'input[id="password"]', 'input[aria-label*="password"]', 'input[aria-label*="Password"]']

            let passwordInput = null
            for (const selector of passwordSelectors) {
                try {
                    await popup.waitForSelector(selector, { timeout: 15000 })
                    passwordInput = popup.locator(selector)
                    break
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!passwordInput) {
                throw new Error("Could not find password input field")
            }

            await passwordInput.fill(password)

            // Wait a moment for the form to update
            await popup.waitForTimeout(1000)

            // Click next/submit button for password
            const passwordNextSelectors = ["#passwordNext", 'button[type="submit"]', 'button[jsname="LgbsSe"]', 'button:has-text("Next")', 'button:has-text("Sign in")', 'input[type="submit"]', 'div[role="button"]:has-text("Next")', 'div[role="button"]:has-text("Sign in")', "button:not([disabled])", "[data-continue-password]"]

            let passwordNextClicked = false
            for (const selector of passwordNextSelectors) {
                try {
                    // Wait for the button to be visible and enabled
                    await popup.waitForSelector(selector, {
                        state: "visible",
                        timeout: 5000,
                    })

                    // Check if button is enabled
                    const isEnabled = await popup.locator(selector).isEnabled()
                    if (!isEnabled) {
                        continue
                    }

                    await popup.click(selector)
                    passwordNextClicked = true
                    break
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!passwordNextClicked) {
                throw new Error("Could not find or click next button after password input")
            }

            // Handle potential additional verification steps
            try {
                // Wait a bit to see if there are any additional verification steps
                await popup.waitForTimeout(2000)

                // Check for "Continue" or "Allow" buttons (consent screens)
                const consentSelectors = ['button:has-text("Continue")', 'button:has-text("Allow")', 'button:has-text("Accept")', 'button[id="submit_approve_access"]']

                for (const selector of consentSelectors) {
                    try {
                        await popup.waitForSelector(selector, { timeout: 5000 })
                        await popup.click(selector)
                        break
                    } catch (e) {
                        // Continue to next selector
                    }
                }
            } catch (e) {
                // Ignore - no additional steps needed
            }

            // Wait for popup to close (indicating successful authentication)
            await popup.waitForEvent("close", { timeout: 80000 })
        } catch (error) {
            // If popup is still open, close it
            if (!popup.isClosed()) {
                await popup.close()
            }
            throw error
        }

        // Wait a moment for the authentication to complete
        await this.page.waitForTimeout(2000)
    }

    async loginWithApple() {
        await this.appleLoginButton.click()
    }

    async goToSignUp() {
        await this.signUpLink.click()
    }

    async goToForgotPassword() {
        await this.forgotPasswordLink.click()
    }

    async waitForToast() {
        await this.toast.waitFor({ state: "visible" })
    }

    async getToastMessage() {
        await this.waitForToast()
        return await this.toast.textContent()
    }

    async expectToBeOnLoginPage() {
        await expect(this.page).toHaveURL(/.*\/login/)

        // Wait for Vue app to mount before looking for elements
        await this.page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )

        await this.page.waitForSelector('input[id="email"]', { timeout: 10000 })
        await this.page.waitForSelector('input[id="password"]', { timeout: 10000 })
        await expect(this.emailInput).toBeVisible()
        await expect(this.passwordInput).toBeVisible()
        await expect(this.loginButton).toBeVisible()
    }

    async expectSuccessfulLogin() {
        // First check if login was successful by looking for error messages
        // Wait a bit to see if any error appears
        await this.page.waitForTimeout(2000)
        
        // Check for error toast or error messages
        const errorToast = await this.toast.isVisible().catch(() => false)
        if (errorToast) {
            const toastText = await this.getToastMessage().catch(() => "")
            if (toastText && (toastText.includes("error") || toastText.includes("Error") || toastText.includes("invalid"))) {
                throw new Error(`Login failed: ${toastText}`)
            }
        }
        
        // Wait for redirect to workbench
        await this.page.waitForURL("/workbench/files", { timeout: 30000 })
        
        // Verify we're actually on the workbench page by checking for key elements
        await this.page.waitForSelector('button:has-text("Upload"), h1, h2', { timeout: 10000 }).catch(() => {})
    }

    async expectLoginError(message: string) {
        await this.waitForToast()
        const toastText = await this.getToastMessage()
        expect(toastText).toContain(message)
    }
}
