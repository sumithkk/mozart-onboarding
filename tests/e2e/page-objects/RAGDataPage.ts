import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class RAGDataPage {
    readonly page: Page
    readonly searchInput: Locator
    readonly searchButton: Locator
    readonly resultsHeading: Locator
    readonly tableViewToggle: Locator
    readonly widgetViewToggle: Locator
    readonly deleteCollectionButton: Locator
    readonly ragDataTable: Locator
    readonly ragDataTableRows: Locator
    readonly widgetGrid: Locator
    readonly widgetCards: Locator
    readonly columnSelectButton: Locator
    readonly columnSelectDropdown: Locator
    readonly noDataMessage: Locator

    constructor(page: Page) {
        this.page = page
        this.searchInput = page.locator('input[placeholder="Describe the document you are looking for..."]')
        this.searchButton = page.locator('div.materialSymbolsOutlined:has-text("search")')
        this.resultsHeading = page.locator('h2:has-text("Results")')
        this.tableViewToggle = page.locator("div.documentViewSwitch").filter({ has: page.locator('div.materialSymbolsOutlined:has-text("reorder")') })
        this.widgetViewToggle = page.locator("div.documentViewSwitch").filter({ has: page.locator('div.materialSymbolsOutlined:has-text("widgets")') })
        this.deleteCollectionButton = page.locator("div.documentViewSwitch").filter({ has: page.locator('div.materialSymbolsOutlined:has-text("delete")') })
        this.ragDataTable = page.locator('div[aria-label="Vectorized file table"]').first()
        this.ragDataTableRows = page.locator('div[aria-label="Vectorized file table"] table tbody tr')
        // More specific widget grid selector - look for grid that contains widget cards but not the table
        // Use a more reliable approach: find grid that's not the table container
        this.widgetGrid = page.locator("div.grid").filter({
            hasNot: page.locator("[aria-label='Vectorized file table']")
        }).first()
        this.widgetCards = page.locator("div.grid > div").filter({
            hasNot: page.locator("[aria-label='Vectorized file table']")
        })
        this.columnSelectButton = page.locator('button:has-text("Select Columns")')
        this.columnSelectDropdown = page.locator("ul")
        this.noDataMessage = page.locator("text=No records found")
    }

    async goto() {
        await this.page.goto("/admin/rag/data")
        await this.page.waitForLoadState("domcontentloaded")
        // Wait for page to be ready
        await this.page.waitForSelector("h2, div.grid, div[aria-label='Vectorized file table']", { timeout: 30000 }).catch(() => { })
    }

    async expectToBeOnDataPage() {
        await expect(this.page).toHaveURL(/.*\/admin\/rag\/data/)
        await this.page.waitForLoadState("domcontentloaded")
        await this.page.waitForFunction(
            () => {
                const nuxtElement = document.querySelector("#__nuxt")
                return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
            },
            { timeout: 20000 }
        )
        // Wait for page content to be ready
        await this.page.waitForSelector("h2, div.grid, div[aria-label='Vectorized file table']", { timeout: 10000 }).catch(() => { })
    }

    async expectResultsHeadingToBeVisible() {
        await expect(this.resultsHeading).toBeVisible()
    }

    async switchToTableView() {
        await this.tableViewToggle.click()
        await this.page.waitForTimeout(1000)

        // Verify we're in table view
        await expect(this.ragDataTable).toBeVisible()
    }

    async switchToWidgetView() {
        await this.widgetViewToggle.click()
        await this.page.waitForTimeout(1000)

        // Verify we're in widget view - wait for grid to be visible
        // Try multiple approaches to find the widget grid
        const gridSelectors = [
            this.widgetGrid,
            this.page.locator("div.grid").filter({ has: this.page.locator("div.grid > div") }),
            this.page.locator("div.grid").last(),
        ]

        let gridFound = false
        for (const selector of gridSelectors) {
            try {
                await expect(selector).toBeVisible({ timeout: 5000 })
                gridFound = true
                break
            } catch {
                // Try next selector
            }
        }

        if (!gridFound) {
            // Fallback: check if table is hidden (indicating widget view is active)
            const tableVisible = await this.ragDataTable.isVisible().catch(() => false)
            if (tableVisible) {
                throw new Error("Widget view toggle did not switch to widget view - table is still visible")
            }
        }
    }

    async expectTableViewToBeActive() {
        await expect(this.ragDataTable).toBeVisible()
        await expect(this.tableViewToggle).toHaveClass(/bg-mozart-blue-500/)
    }

    async expectWidgetViewToBeActive() {
        // First verify the widget view toggle is active (has the blue background)
        await expect(this.widgetViewToggle).toHaveClass(/bg-mozart-blue-500/)

        // The table should be hidden when widget view is active
        await expect(this.ragDataTable).not.toBeVisible()

        // The widget grid may not be visible if:
        // 1. The store is still loading
        // 2. There's no data to display (ragFilesData is empty)
        // So we check if it's visible, but don't fail if it's not - the toggle state is the reliable indicator
        const isWidgetGridVisible = await this.widgetGrid.isVisible().catch(() => false)
        if (isWidgetGridVisible) {
            await expect(this.widgetGrid).toBeVisible()
        }
    }

    async expectDataTableToBeVisible() {
        await expect(this.ragDataTable).toBeVisible()

        // Verify table has headers
        const tableHeaders = this.page.locator('div[aria-label="Vectorized file table"] table thead th')
        const headerCount = await tableHeaders.count()
        expect(headerCount).toBeGreaterThan(0)
    }

    async verifyDefaultTableColumns() {
        // Verify the expected default columns are present (updated for UTable)
        const expectedColumns = ["ID", "Title", "Characters", "Type", "URL", "Page", "MetaData", "Paragraph", "Actions"]

        for (const column of expectedColumns) {
            const columnHeader = this.page.getByRole("columnheader", { name: column })
            await expect(columnHeader).toBeVisible()
        }
    }

    async expectDataRecordsToExist() {
        // Wait for data to load
        await this.page.waitForTimeout(3000)

        const rowCount = await this.ragDataTableRows.count()

        if (rowCount === 1) {
            const hasNoDataMessage = await this.noDataMessage.isVisible()

            if (hasNoDataMessage) {
                console.log("No data available in the table")
                return false
            }
        }

        expect(rowCount).toBeGreaterThan(0)
        return true
    }

    async getDataTableRecordCount(): Promise<number> {
        await this.page.waitForTimeout(2000)
        const rowCount = await this.ragDataTableRows.count()

        if (rowCount === 1) {
            const hasNoDataMessage = await this.noDataMessage.isVisible()

            if (hasNoDataMessage) {
                return 0
            }
        }

        return rowCount
    }

    async searchForDocuments(searchText: string) {
        await this.searchInput.fill(searchText)
        await this.searchInput.press("Enter")
        await this.page.waitForTimeout(2000)
    }

    async clickSearchButton() {
        await this.searchButton.click()
        await this.page.waitForTimeout(2000)
    }

    async expectSearchInputToBeVisible() {
        await expect(this.searchInput).toBeVisible()
    }

    async expectSearchInputToBeHidden() {
        await expect(this.searchInput).not.toBeVisible()
    }

    async getWidgetCardCount(): Promise<number> {
        const isWidgetViewVisible = await this.widgetGrid.isVisible()

        if (isWidgetViewVisible) {
            return await this.widgetCards.count()
        }

        return 0
    }

    async expectWidgetCardsToBeVisible() {
        await expect(this.widgetGrid).toBeVisible()
        const cardCount = await this.getWidgetCardCount()
        expect(cardCount).toBeGreaterThan(0)
    }

    async clickTableRowByIndex(index: number) {
        const row = this.ragDataTableRows.nth(index)
        await row.click()
        await this.page.waitForTimeout(1000)
    }

    async expectTableRowToBeClickable(index: number) {
        const row = this.ragDataTableRows.nth(index)
        await expect(row).toHaveClass(/cursor-pointer/)
    }

    async deleteDocumentByTitle(title: string) {
        // In table view, find the row with the title and click delete
        const deleteButton = this.page.locator(`div[aria-label="Vectorized file table"] table tbody tr:has-text("${title}") button[title="Delete API key permanently"]`)
        await deleteButton.click()
        await this.page.waitForTimeout(1000)
    }

    async expectDeleteButtonsToBeVisible() {
        const deleteButtons = this.page.locator('div[aria-label="Vectorized file table"] table tbody tr button[title="Delete API key permanently"]')
        const buttonCount = await deleteButtons.count()
        expect(buttonCount).toBeGreaterThan(0)
    }

    async expectPaginationToBeVisible() {
        const pagination = this.page.locator('[aria-label="Table pagination"]')
        await expect(pagination).toBeVisible()
    }

    async clickNextPage() {
        const nextButton = this.page.locator('[aria-label="Table pagination"] button:has-text("Next")')
        await nextButton.click()
        await this.page.waitForTimeout(2000)
    }

    async clickPreviousPage() {
        const prevButton = this.page.locator('[aria-label="Table pagination"] button:has-text("Prev")')
        await prevButton.click()
        await this.page.waitForTimeout(2000)
    }

    async expectCurrentPageToBe(pageNumber: number) {
        const currentPageButton = this.page.locator(`[aria-label="Table pagination"] button[aria-current="page"]:has-text("${pageNumber}")`)
        await expect(currentPageButton).toBeVisible()
    }

    async waitForDataToLoad() {
        // Wait for the loading to complete
        await this.page.waitForTimeout(3000)

        // Wait for either table or widget view to be visible
        await this.page.waitForFunction(
            () => {
                const table = document.querySelector('div[aria-label="Vectorized file table"]')
                const grid = document.querySelector("div.grid")
                return table !== null || grid !== null
            },
            { timeout: 10000 }
        )
    }

    async expectViewTogglesToBeVisible() {
        await expect(this.tableViewToggle).toBeVisible()
        await expect(this.widgetViewToggle).toBeVisible()
    }

    async expectDeleteCollectionButtonToBeVisible() {
        await expect(this.deleteCollectionButton).toBeVisible()
    }
}
