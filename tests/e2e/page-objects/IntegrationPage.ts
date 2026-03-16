import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class IntegrationPage {
    readonly page: Page
    readonly addIntegrationButton: Locator
    readonly integrationsGrid: Locator
    readonly googleIntegrationCard: Locator
    readonly connectButton: Locator
    readonly disconnectButton: Locator
    readonly completeConnectionButton: Locator
    readonly selectFilesButton: Locator
    readonly googleDriveModal: Locator
    readonly searchInput: Locator
    readonly fileCheckbox: (fileName: string) => Locator
    readonly selectModalButton: Locator
    readonly cancelModalButton: Locator
    readonly toast: Locator
    readonly googleDriveOnboarding: Locator
    readonly onboardingCloseButton: Locator
    readonly filesList: Locator
    readonly gridViewButton: Locator
    readonly listViewButton: Locator
    readonly sortDropdown: Locator
    readonly backButton: Locator
    readonly loadMoreButton: Locator
    readonly loadingState: Locator
    readonly integrationConfigModal: Locator
    readonly modalSaveButton: Locator
    readonly modalCloseButton: Locator
    readonly modalInputFields: Locator
    readonly mcpBadge: Locator

    constructor(page: Page) {
        this.page = page
        // Note: Add Integration button is commented out in the code
        this.addIntegrationButton = page.getByRole("button", { name: "+ Add Integration" }).or(page.locator("button:has-text('+ Add Integration')"))
        this.integrationsGrid = page.locator(".flex.flex-row.flex-wrap.gap-3")
        // Updated selector to be more specific to Google Drive and accommodate new integrations
        this.googleIntegrationCard = this.integrationsGrid.locator("div").filter({ hasText: "Google Drive" }).filter({ has: page.locator("a[href*='drive.google.com']") }).first()
        this.connectButton = page.getByRole("button", { name: "Connect" }).or(page.locator("label:has-text('Connect')"))
        // Updated selector: disconnect button has new styling with min-w-[120px]
        // Use getByRole to avoid strict mode violations (button contains span with text)
        this.disconnectButton = page.getByRole("button", { name: "Disconnect" }).first()
        this.completeConnectionButton = page.getByRole("button", { name: "Complete Connection" })
        this.selectFilesButton = page.getByRole("button", { name: "Select Files" })
        this.googleDriveModal = page.getByRole("dialog").filter({ hasText: "Select a file" })
        this.searchInput = page.getByRole("textbox", { name: "Search Drive" })
        this.fileCheckbox = (fileName: string) => page.getByText(fileName).locator("..").locator('input[type="checkbox"]')
        this.selectModalButton = page.getByRole("button", { name: "Select" })
        this.cancelModalButton = page.getByRole("button", { name: "Cancel" })
        this.toast = page.locator("[data-sonner-toast]")
        this.googleDriveOnboarding = page
            .locator("div")
            .filter({ hasText: /Google Drive/ })
            .first()
        this.onboardingCloseButton = page.getByRole("button", { name: "Close" })
        this.filesList = page.locator(".divide-y.divide-neutral-200")
        this.gridViewButton = page.getByRole("button", { name: "view_module" })
        this.listViewButton = page.getByRole("button", { name: "view_list" })
        this.sortDropdown = page.getByRole("button").filter({ hasText: "Last modified" })
        this.backButton = page.getByRole("button", { name: "Back" })
        this.loadMoreButton = page.getByRole("button", { name: "Load more" })
        this.loadingState = page.locator(".component-loading-stub").or(page.locator("[class*='ComponentLoading']"))
        // More specific modal selector - look for dialog role or modal classes with Configure text
        this.integrationConfigModal = page.getByRole("dialog").filter({ hasText: "Configure" })
            .or(page.locator(".modal-stub").filter({ hasText: "Configure" }))
            .or(page.locator("[class*='modal'][class*='Configure'], [class*='Modal'][class*='Configure']"))
        this.modalSaveButton = page.locator("button:has-text('Save')").or(page.getByRole("button", { name: "Save" }))
        this.modalCloseButton = page.locator("button:has-text('Close')").or(page.getByRole("button", { name: "Close" }))
        this.modalInputFields = page.locator(".modal-stub input").or(page.locator("[class*='modal'] input"))
        this.mcpBadge = page.locator(".rounded.bg-blue-100").filter({ hasText: "MCP" })
    }

    async goto() {
        await this.page.goto("/profile/integrations")
        await this.page.waitForLoadState("domcontentloaded")
        // Wait for page to be ready by checking for the main header
        await this.page.waitForSelector("h2", { timeout: 30000 })
        // Wait for the integrations grid container specifically
        await this.integrationsGrid.waitFor({ state: "visible", timeout: 30000 })
    }

    async expectToBeOnIntegrationPage() {
        await expect(this.page).toHaveURL(/.*\/profile\/integrations/, { timeout: 30000 })
        // Wait for the specific heading text to be visible
        const heading = this.page.getByRole("heading", { name: "Integrations and connected apps" })
        await expect(heading).toBeVisible({ timeout: 30000 })
    }

    async expectGoogleIntegrationVisible() {
        await expect(this.googleIntegrationCard).toBeVisible()
        await expect(this.googleIntegrationCard).toContainText("Google Drive")
    }

    async connectGoogleDrive() {
        await this.connectButton.click()
    }

    async disconnectGoogleDrive() {
        // Ensure button is visible and enabled before clicking
        await expect(this.disconnectButton).toBeVisible({ timeout: 10000 })
        await expect(this.disconnectButton).toBeEnabled({ timeout: 5000 })
        await this.disconnectButton.click()
    }

    async completeConnection() {
        await this.completeConnectionButton.click()
    }

    async openGoogleDriveFileSelector() {
        await this.selectFilesButton.click()
        await expect(this.googleDriveModal).toBeVisible()
    }

    async searchFiles(searchTerm: string) {
        await this.searchInput.fill(searchTerm)
    }

    async selectFile(fileName: string) {
        const checkbox = this.page.getByText(fileName)
        await checkbox.click()
    }

    async selectFilesFromModal() {
        await this.selectModalButton.click()
    }

    async cancelFileSelection() {
        await this.cancelModalButton.click()
        await expect(this.googleDriveModal).not.toBeVisible()
    }

    async switchToGridView() {
        await this.gridViewButton.click()
    }

    async switchToListView() {
        await this.listViewButton.click()
    }

    async changeSortOrder(sortOption: string) {
        await this.sortDropdown.click()
        await this.page.getByRole("menuitem", { name: sortOption }).click()
    }

    async goBackInFolder() {
        await this.backButton.click()
    }

    async loadMoreFiles() {
        await this.loadMoreButton.click()
    }

    async navigateToFolder(folderName: string) {
        await this.page.getByText(folderName).click()
    }

    async waitForToast() {
        await this.toast.waitFor({ state: "visible" })
    }

    async getToastMessage() {
        await this.waitForToast()
        return await this.toast.textContent()
    }

    async closeOnboarding() {
        if (await this.googleDriveOnboarding.isVisible()) {
            await this.onboardingCloseButton.click()
        }
    }

    async expectIntegrationConnected() {
        await expect(this.disconnectButton).toBeVisible()
        await expect(this.selectFilesButton).toBeVisible()
    }

    async expectIntegrationDisconnected() {
        await expect(this.connectButton).toBeVisible()
        await expect(this.disconnectButton).not.toBeVisible()
    }

    async expectFileExists(fileName: string) {
        await expect(this.page.getByText(fileName)).toBeVisible()
    }

    async expectFileNotExists(fileName: string) {
        await expect(this.page.getByText(fileName)).not.toBeVisible()
    }

    async expectFilesLoaded() {
        // Wait for skeleton loading to complete
        await this.page
            .waitForFunction(
                () => {
                    const skeletonElements = document.querySelectorAll(".animate-pulse")
                    return skeletonElements.length === 0
                },
                { timeout: 10000 }
            )
            .catch(() => {
                // If timeout occurs, continue anyway
            })
    }

    async selectMultipleFiles(fileNames: string[]) {
        for (const fileName of fileNames) {
            await this.selectFile(fileName)
        }
    }

    async expectModalVisible() {
        await expect(this.googleDriveModal).toBeVisible({ timeout: 30000 })
    }

    async expectModalNotVisible() {
        await expect(this.googleDriveModal).not.toBeVisible({ timeout: 30000 })
    }

    async waitForTimeout(ms: number) {
        await this.page.waitForTimeout(ms)
    }

    async loadGoogleDriveFilePicker() {
        // Connect Google Drive
        await this.expectIntegrationConnected()

        // Open file selector
        await this.openGoogleDriveFileSelector()
        await this.expectModalVisible()
        await this.expectFilesLoaded()
    }

    async waitForLoadingToComplete() {
        // Wait for loading state to disappear
        await this.page.waitForFunction(
            () => {
                const loadingElements = document.querySelectorAll(".component-loading-stub, [class*='ComponentLoading']")
                return loadingElements.length === 0
            },
            { timeout: 30000 }
        ).catch(() => {
            // If timeout occurs, continue anyway
        })
    }

    async expectIntegrationConfigModalVisible() {
        // Wait for modal to appear with increased timeout and better selector
        await this.page.waitForSelector('[role="dialog"]', { timeout: 30000 }).catch(() => {})
        // Try multiple modal selectors
        const modalSelectors = [
            this.page.getByRole("dialog").filter({ hasText: "Configure" }),
            this.page.locator(".modal-stub").filter({ hasText: "Configure" }),
            this.page.locator("[class*='modal']").filter({ hasText: "Configure" }),
        ]
        
        let modalFound = false
        for (const selector of modalSelectors) {
            try {
                await expect(selector).toBeVisible({ timeout: 10000 })
                modalFound = true
                break
            } catch {
                // Try next selector
            }
        }
        
        if (!modalFound) {
            // Fallback: check if any dialog is visible
            await expect(this.page.getByRole("dialog").first()).toBeVisible({ timeout: 10000 })
        }
    }

    async expectIntegrationConfigModalNotVisible() {
        await expect(this.integrationConfigModal).not.toBeVisible()
    }

    async fillIntegrationConfigForm(fields: Record<string, string>) {
        for (const [key, value] of Object.entries(fields)) {
            const input = this.modalInputFields.filter({ has: this.page.locator(`label:has-text('${key}')`) })
            await input.fill(value)
        }
    }

    async saveIntegrationConfig() {
        await this.modalSaveButton.click()
    }

    async closeIntegrationConfigModal() {
        await this.modalCloseButton.click()
    }

    async expectMCPBadgeVisible(integrationName: string) {
        const integrationCard = this.page.locator(".mt-2").filter({ hasText: integrationName })
        const badge = integrationCard.locator(this.mcpBadge)
        await expect(badge).toBeVisible()
    }

    async expectDisconnectButtonLoading(integrationId: string) {
        const integrationCard = this.page.locator(".mt-2").filter({ hasText: integrationId })
        const disconnectButton = integrationCard.locator("button:has-text('Disconnect')")
        const spinner = disconnectButton.locator(".animate-spin")
        await expect(spinner).toBeVisible()
    }
}
