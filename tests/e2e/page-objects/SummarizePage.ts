import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class SummarizePage {
    readonly page: Page
    readonly summarizeButton: Locator
    readonly pageRangeInput: Locator
    readonly fileViewerContainer: Locator
    readonly fileSummaryContainer: Locator

    constructor(page: Page) {
        this.page = page
        this.summarizeButton = page.locator("button:has-text('Summarize')")
        this.pageRangeInput = page.locator("input[placeholder='Page Range']")
        this.fileViewerContainer = page.locator("div:has-text('File Viewer')").first()
        this.fileSummaryContainer = page.getByRole("heading", { name: "Summary for Page" })
    }

    async waitForTimeout(timeout: number) {
        await this.page.waitForTimeout(timeout)
    }

    async goto() {
        await this.page.goto("/admin/mozart/summarize")
        await this.page.waitForLoadState("networkidle")
    }

    async expectToBeOnSummarizePage() {
        await expect(this.page).toHaveURL(/.*\/admin\/mozart\/summarize/)
        await this.page.waitForLoadState("networkidle")
        await this.page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )
    }

    async selectFile(fileName: string) {
        // Wait for the file to be visible in the workbench
        const fileCard = this.page.locator(`div:has-text('${fileName}')`).first()
        await fileCard.waitFor({ state: "visible", timeout: 10000 })

        // Click on the file card to select it
        await this.page
            .locator("div")
            .filter({ hasText: /^document\.pdf$/ })
            .click()

        // Verify the file is selected (should have isolate class)
        await expect(fileCard).toHaveClass(/isolate/)
    }

    async setPageRange(pageRange: string) {
        await this.pageRangeInput.fill(pageRange)
        await this.pageRangeInput.blur() // Trigger validation
    }

    async clickSummarize() {
        await this.summarizeButton.click()
    }

    async expectSummaryToBeVisible() {
        // Wait for summary content to appear in the file summary container
        await this.fileSummaryContainer.waitFor({ state: "visible", timeout: 10000 })

        // Look for summary content indicators
        const summaryContent = this.page.locator("div:has-text('Summary for Page')").first()
        await expect(summaryContent).toBeVisible({ timeout: 15000 })

        // Verify that actual summary text exists (not just the header)
        const summaryText = this.page.locator("p.text-neutral-700").first()
        await expect(summaryText).toBeVisible({ timeout: 5000 })

        // Verify that the summary contains some actual content
        const summaryTextContent = await summaryText.textContent()
        expect(summaryTextContent).toBeTruthy()
        expect(summaryTextContent?.length).toBeGreaterThan(10)
    }

    async expectFileToBeSelected(fileName: string) {
        const fileCard = this.page.locator(`div:has-text('${fileName}')`).first()
        await expect(fileCard).toHaveClass(/isolate/)
    }

    async expectSummarizeButtonToBeEnabled() {
        await expect(this.summarizeButton).toBeEnabled({ timeout: 5000 })
        await expect(this.summarizeButton).toHaveClass(/bg-mozart-blue-500/)
    }

    async expectSummarizeButtonToBeDisabled() {
        await expect(this.summarizeButton).toBeDisabled({ timeout: 5000 })
        await expect(this.summarizeButton).toHaveClass(/disabled:bg-neutral-300/)
    }
}
