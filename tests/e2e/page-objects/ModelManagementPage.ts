import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class ModelManagementPage {
    readonly page: Page
    readonly userName: Locator
    readonly toast: Locator
    readonly llmProvider: (llmProvider: string) => Locator
    readonly model: (model: string) => Locator
    constructor(page: Page) {
        this.page = page
        this.userName = page.locator(".userName")
        this.toast = page.locator("[data-sonner-toast]")
        this.llmProvider = (llmProvider: string) => page.getByRole("heading", { name: llmProvider, exact: true })
        // Find h4 element with exact model name match - models are displayed in h4 tags
        // Use getByRole with exact match to avoid matching partial names (e.g., "Claude Sonnet 4" vs "Claude Sonnet 4.5")
        this.model = (model: string) => page.getByRole("heading", { name: model, exact: true })
    }

    async goto() {
        await this.page.goto("/admin/modelManagement")
        await this.page.waitForLoadState("networkidle")
    }
    async waitForToast() {
        await this.toast.waitFor({ state: "visible" })
    }

    async getToastMessage() {
        await this.waitForToast()
        return await this.toast.textContent()
    }

    async expectToBeOnModelManagementPage() {
        await expect(this.page).toHaveURL(/.*\/admin\/modelManagement/, { timeout: 30000 })

        // Wait for the page to be fully loaded
        await this.page.waitForLoadState("networkidle")

        // Wait for Vue components to render
        await this.page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )

        // Check if the user name is visible
        await expect(this.userName).toBeVisible({ timeout: 30000 })

        // Wait for models to load - wait for loading spinner to disappear or for model cards to appear
        await this.page.waitForFunction(
            () => {
                // Check if loading spinner is gone
                const loadingSpinner = document.querySelector(".materialSymbolsOutlined.animate-spin")
                if (loadingSpinner && loadingSpinner.textContent?.includes("sync")) {
                    return false
                }
                // Check if at least one model card exists (h4 with model name)
                const modelCards = document.querySelectorAll("h4")
                return modelCards.length > 0
            },
            { timeout: 30000 }
        )

        // Additional wait to ensure models are fully rendered
        await this.page.waitForTimeout(1000)
    }

    async waitForTimeout(timeout: number) {
        await this.page.waitForTimeout(timeout)
    }

    async expectLLMProviderToBeVisible(llmProvider: string) {
        await expect(this.llmProvider(llmProvider)).toBeVisible({ timeout: 30000 })
    }

    async expectModelToBeVisible(model: string) {
        // First, ensure the page is still open and models are loaded
        await this.page.waitForLoadState("domcontentloaded")
        
        // Wait for at least one model to be visible (indicates models have loaded)
        await this.page.waitForSelector("h4", { timeout: 30000 })
        
        // Now check for the specific model
        const modelLocator = this.model(model)
        // Wait for the model to be visible (this will automatically scroll if needed)
        await expect(modelLocator).toBeVisible({ timeout: 30000 })
    }
}
