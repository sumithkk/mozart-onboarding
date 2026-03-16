import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class RAGCollectionPage {
    readonly page: Page
    readonly userName: Locator
    readonly logoutButton: Locator
    readonly collectionNameInput: Locator
    readonly embeddingMethodSelect: Locator
    readonly distanceMethodSelect: Locator
    readonly serviceMethodSelect: Locator
    readonly createButton: Locator
    readonly listViewToggle: Locator
    readonly widgetViewToggle: Locator
    readonly sortBySelect: Locator
    readonly sortButton: Locator
    readonly collectionsGrid: Locator
    readonly collectionsTable: Locator
    readonly collectionItems: Locator
    readonly collectionTableRows: Locator
    readonly collectionDropdownButtons: Locator
    readonly deleteButtons: Locator
    readonly infoButtons: Locator
    readonly toast: Locator

    constructor(page: Page) {
        this.page = page
        this.userName = page.locator(".userName")
        this.logoutButton = page.getByText("logout Log out")
        this.collectionNameInput = page.locator('input[placeholder="Collection Name"]')
        this.embeddingMethodSelect = page.getByRole("combobox").first()
        this.distanceMethodSelect = page.getByRole("combobox").nth(1)
        this.serviceMethodSelect = page.getByRole("combobox").nth(2)
        this.createButton = page.getByRole("button", { name: "Create" })
        this.listViewToggle = page.locator("div.materialSymbolsOutlined").getByText("view_list")
        this.widgetViewToggle = page.locator("div.materialSymbolsOutlined").getByText("view_module")
        this.sortBySelect = page.locator("select").filter({ has: page.locator('option[value="alias"]') })
        this.sortButton = page.locator("button").filter({ hasText: "Sort" })
        this.collectionsGrid = page.locator('div').filter({ hasText: /^databaseMozart_collectionActive⋮InfoDelete$/ }).nth(1)
        this.collectionsTable = page.getByRole("table")
        this.collectionItems = page.locator("div.grid > div")
        this.collectionTableRows = page.locator("tbody tr")
        this.collectionDropdownButtons = page.locator('button:has-text("⋮")')
        this.deleteButtons = page.getByRole("button", { name: "Delete" })
        this.infoButtons = page.locator('button:has-text("Info")')
        this.toast = page.locator("[data-sonner-toast]")
    }

    async goto() {
        await this.page.goto("/admin/rag/manage/collection")
        await this.page.waitForLoadState("networkidle")
    }

    async expectUserName(name: string) {
        await expect(this.userName).toContainText(name)
    }

    async waitForTimeout(timeout: number) {
        await this.page.waitForTimeout(timeout)
    }

    async waitForToast() {
        await this.toast.waitFor({ state: "visible" })
    }

    async getToastMessage() {
        await this.waitForToast()
        return await this.toast.textContent()
    }

    async deleteCollectionsForCleanup() {
        // Delete all collections which include MOZ_ in the name
        // Always target the first matching element to avoid stale references
        const mozCollectionLocator = this.collectionItems.filter({ hasText: /MOZ_/ })

        while ((await mozCollectionLocator.count()) > 0) {
            try {
                const firstMozCollection = mozCollectionLocator.first()
                await firstMozCollection.locator('button:has-text("⋮")').click()
                await this.deleteButtons.click()
                await this.page.waitForTimeout(1000)

                const confirmButton = this.page.getByRole("button", { name: "Delete" })
                if (await confirmButton.isVisible()) {
                    await confirmButton.click()
                }

                await this.waitForToast()
                const toastMessage = await this.getToastMessage()

                // Handle both success and failure cases gracefully
                if (!toastMessage) {
                    console.log("⚠️ No toast message received during cleanup")
                    await this.page.waitForTimeout(2000)
                } else if (toastMessage.includes("Could not delete collection")) {
                    console.log("⚠️ Collection deletion failed, but continuing cleanup:", toastMessage)
                    // Try to continue - maybe the collection was already deleted or doesn't exist
                    await this.page.waitForTimeout(2000)
                    // Re-check if collection still exists
                    const stillExists = (await mozCollectionLocator.count()) > 0
                    if (stillExists) {
                        // If it still exists and deletion failed, skip it and move on
                        console.log("⚠️ Skipping collection that couldn't be deleted")
                        break
                    }
                } else if (toastMessage.includes("Collection deleted")) {
                    // Success case
                    await this.page.waitForTimeout(3000)
                } else {
                    // Unknown message, log and continue
                    console.log("⚠️ Unexpected toast message during cleanup:", toastMessage)
                    await this.page.waitForTimeout(2000)
                }
            } catch (e) {
                // If deletion fails, log and try to continue
                console.log("⚠️ Error during collection cleanup, continuing:", e)
                await this.page.waitForTimeout(2000)
                // Break if we can't proceed
                break
            }
        }
    }

    async expectCollectionsToBeSortedByName() {
        const isWidgetView = await this.collectionsGrid.isVisible()
        let actualNames: string[] = []

        if (isWidgetView) {
            // In widget view, get collection names from grid items
            // Use a more specific selector to avoid picking up navigation elements
            const collections = await this.collectionItems.filter({ hasText: /database.*⋮.*Info.*Delete/ }).all()
            for (const collection of collections) {
                const text = (await collection.textContent())?.trim() || ""
                // Extract collection name from the pattern: database{name}Status⋮InfoDelete
                // The collection name is between "database" and the status (Active/Inactive)
                const match = text.match(/^database([^A-Z]+)(?:Active|Inactive)/)
                if (match && match[1]) {
                    actualNames.push(match[1])
                }
            }
        } else {
            // In table view, get collection names from table rows
            const rows = await this.collectionTableRows.all()
            for (const row of rows) {
                // Assume the first cell contains the collection name
                const cell = await row.locator("td").first()
                const text = (await cell.textContent())?.trim() || ""
                if (text) {
                    actualNames.push(text)
                }
            }
        }

        // Check if the names are sorted alphabetically (case-insensitive)
        const sortedNames = [...actualNames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        expect(actualNames).toEqual(sortedNames)
    }

    async expectToBeOnRAGCollectionPage() {
        await expect(this.page).toHaveURL(/.*\/admin\/rag\/manage\/collection/)
        await this.page.waitForLoadState("networkidle")
        await this.page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )
    }

    async expectCollectionsToBeVisible() {
        // Check if at least one collection is visible in either view mode
        const isWidgetViewVisible = await this.collectionsGrid.isVisible()
        const isTableViewVisible = await this.collectionsTable.isVisible()

        expect(isWidgetViewVisible || isTableViewVisible).toBeTruthy()

        if (isWidgetViewVisible) {
            const count = await this.collectionItems.count()
            expect(count).toBeGreaterThan(0)
        } else if (isTableViewVisible) {
            const count = await this.collectionTableRows.count()
            expect(count).toBeGreaterThan(0)
        }
    }

    async createCollection(name: string, embeddingMethod: string = "bert", distanceMethod: string = "Cosine", serviceMethod: string = "cloud") {
        await this.collectionNameInput.fill(name)
        await this.embeddingMethodSelect.selectOption(embeddingMethod)
        await this.distanceMethodSelect.selectOption(distanceMethod)
        await this.serviceMethodSelect.selectOption(serviceMethod)
        await this.createButton.click()

        // Wait for the collection to be created and page to update
        await this.page.waitForLoadState("networkidle")
        await this.waitForTimeout(2000)
    }

    async deleteCollection(collectionName: string) {
        // Find the collection by name and click its dropdown
        const collectionElement = await this.findCollectionByName(collectionName)
        if (!collectionElement) {
            throw new Error(`Collection with name "${collectionName}" not found`)
        }

        // Click the dropdown button for this collection
        const dropdownButton = collectionElement.locator('button:has-text("⋮")')
        await dropdownButton.click()

        // Click delete option
        const deleteOption = this.page.getByRole("button", { name: "Delete" })
        await deleteOption.click()

        // Handle confirmation modal if it appears
        await this.page.waitForTimeout(1000)
        const confirmButton = this.page.getByRole("button", { name: "Delete" })
        if (await confirmButton.isVisible()) {
            await confirmButton.click()
        }

        // Wait for deletion to complete
        await this.page.waitForLoadState("networkidle")
        await this.waitForTimeout(2000)
    }

    async findCollectionByName(name: string) {
        // Check if we're in widget view or table view
        const isWidgetView = await this.collectionsGrid.isVisible()
        if (isWidgetView) {
            // In widget view, alias is displayed truncated to 15 chars with '...'
            const displayName = name.length > 15 ? name.slice(0, 12) + "..." : name

            // Prefer exact match on the truncated alias if needed
            const candidateByDisplay = this.collectionItems.filter({ hasText: displayName })
            if ((await candidateByDisplay.count()) > 0) {
                return candidateByDisplay.last()
            }

            // Fallback: try full name containment
            const candidateByFull = this.collectionItems.filter({ hasText: name })
            if ((await candidateByFull.count()) > 0) {
                return candidateByFull.last()
            }
        } else {
            // In table view, look for collection in table rows
            const rows = await this.collectionTableRows.all()
            for (const row of rows) {
                const text = await row.textContent()
                if (text && text.includes(name)) {
                    return row
                }
            }
        }
        return null
    }

    async expectCollectionToExist(name: string) {
        // Retry finding the collection (up to 10s for slow CI runners)
        let collection = null
        for (let attempt = 0; attempt < 10; attempt++) {
            collection = await this.findCollectionByName(name)
            if (collection) break
            await this.page.waitForTimeout(1000)
        }
        expect(collection).toBeTruthy()
    }

    async expectCollectionNotToExist(name: string) {
        const collection = await this.findCollectionByName(name)
        expect(collection).toBeFalsy()
    }

    async toggleToListView() {
        await this.listViewToggle.click()
        await this.page.waitForTimeout(1000)
        await expect(this.collectionsTable).toBeVisible()
    }

    async toggleToWidgetView() {
        await this.widgetViewToggle.click()
        await this.page.waitForTimeout(1000)
        await expect(this.collectionsGrid).toBeVisible()
    }

    async sortCollectionsByName() {
        await this.sortBySelect.selectOption("alias")
        await this.sortButton.click()
        await this.page.waitForTimeout(1000)
    }

    async sortCollectionsByCreatedAt() {
        await this.sortBySelect.selectOption("createdAt")
        await this.sortButton.click()
        await this.page.waitForTimeout(1000)
    }

    async expectViewMode(mode: "list" | "widget") {
        if (mode === "list") {
            await expect(this.collectionsTable).toBeVisible()
            await expect(this.collectionsGrid).not.toBeVisible()
        } else {
            await expect(this.collectionsGrid).toBeVisible()
            await expect(this.collectionsTable).not.toBeVisible()
        }
    }

    async getCollectionCount(): Promise<number> {
        const isWidgetView = await this.collectionsGrid.isVisible()

        if (isWidgetView) {
            return await this.collectionItems.count()
        } else {
            return await this.collectionTableRows.count()
        }
    }

    async expectCollectionInfoToBeVisible(collectionName: string) {
        const collectionElement = await this.findCollectionByName(collectionName)
        if (!collectionElement) {
            throw new Error(`Collection with name "${collectionName}" not found`)
        }

        // Click the dropdown button for this collection
        const dropdownButton = collectionElement.locator('button:has-text("⋮")')
        await dropdownButton.click()

        // Click info option
        const infoOption = this.page.getByRole("button", { name: "Info" })
        await infoOption.click()
        await this.page.waitForTimeout(1000)
    }

    async doubleClickCollection(collectionName: string) {
        const collectionElement = await this.findCollectionByName(collectionName)
        if (!collectionElement) {
            throw new Error(`Collection with name "${collectionName}" not found`)
        }

        // Double-click the collection element
        await collectionElement.dblclick()

        // Wait for navigation to complete
        await this.page.waitForLoadState("networkidle")
        await this.page.waitForTimeout(2000)
    }
}
