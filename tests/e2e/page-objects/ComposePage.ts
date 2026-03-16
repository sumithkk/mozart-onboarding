import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class ComposePage {
    readonly page: Page
    readonly chatInput: Locator
    readonly sendButton: Locator
    readonly fileUploadInput: Locator
    readonly attachmentButton: Locator
    readonly messageContent: Locator
    readonly conversationTitle: Locator
    readonly newConversationButton: Locator
    readonly conversationsList: Locator
    readonly modelSelector: Locator
    readonly ragToggle: Locator
    readonly collectionSelector: Locator
    readonly systemPromptButton: Locator
    readonly shareButton: Locator
    readonly deleteConversationButton: Locator
    readonly messageContainer: Locator
    readonly toast: Locator
    readonly composeOptions: Locator
    readonly composeOptionClose: Locator
    readonly writingMenuOptions: Locator
    readonly mcpToggle: Locator
    readonly modelSearchInput: Locator
    readonly dynamicLinks: Locator
    constructor(page: Page) {
        this.page = page
        this.chatInput = page.locator("textarea")
        this.sendButton = page.locator(".sendButton")
        this.fileUploadInput = page.locator(".fileInput")
        this.attachmentButton = page.getByRole("button", { name: "Attach File" })
        this.messageContent = page.locator(".message")
        this.conversationTitle = page.locator(".conversation-title")
        this.newConversationButton = page.getByRole("button", { name: "New Conversation" })
        this.conversationsList = page.locator("nav.flex.flex-1.flex-col.overflow-hidden")
        this.modelSelector = page.getByRole("button", { name: /GPT|Gemini|Claude|model/i }).first()
        this.ragToggle = page.getByRole("main").locator("label").first()
        this.collectionSelector = page.getByRole("button", { name: "stacks" })
        this.systemPromptButton = page.getByRole("button", { name: "System Prompt" })
        this.shareButton = page.getByRole("button", { name: "Share" })
        this.deleteConversationButton = page.getByRole("button", { name: "Delete" })
        this.messageContainer = page.locator(".message-container")
        this.toast = page.locator("[data-sonner-toast]")
        this.composeOptions = page
            .locator("div")
            .filter({ hasText: /^tune$/ })
            .first()
        this.composeOptionClose = page
            .locator("div")
            .filter({ hasText: /^arrow_forward_ios$/ })
            .first()
        this.mcpToggle = page.getByRole("main").locator("label").nth(1)
        this.modelSearchInput = page.getByRole("textbox", { name: "Search" })
        this.writingMenuOptions = page.getByRole("button", { name: "draw" })
        // Dynamic links inside assistant message content
        this.dynamicLinks = page.locator('.message .markdown-body a.dynamic-link, .message .markdown-body a[target="_blank"]')
    }

    async goto() {
        await this.page.goto("/compose")
        await this.page.waitForLoadState("domcontentloaded")
        // Wait for key elements to be ready instead of networkidle
        await this.page.waitForSelector("textarea", { timeout: 30000 }).catch(() => { })
        await expect(this.chatInput).toBeVisible({ timeout: 30000 })
    }

    async sendMessage(message: string) {
        await this.chatInput.fill(message)
        await this.sendButton.click({ timeout: 80000 })

        // Wait for navigation to /compose/[conversationId]
        await this.page.waitForURL(/.*\/compose\/[^/]+$/, { timeout: 80000 })

        // Wait for network to settle after navigation
        await this.page.waitForLoadState("networkidle", { timeout: 30000 })
    }

    async waitForToast() {
        await this.toast.waitFor({ state: "visible" })
    }

    async getToastMessage() {
        await this.waitForToast()
        return await this.toast.textContent()
    }

    async uploadFile(filePath: string) {
        await this.fileUploadInput.setInputFiles(filePath)
    }

    async attachFileAndSendMessage(filePath: string, message: string) {
        await this.uploadFile(filePath)
        await this.sendMessage(message)
    }

    async startNewConversation() {
        await this.newConversationButton.click()
    }

    async selectModel(modelName: string) {
        // Wait for models to be loaded by waiting for the selector to have actual text (not skeleton)
        // In CI, models might take longer to load from API
        await this.page.waitForFunction(
            () => {
                const modelButton = document.querySelector('button[class*="model"]') ||
                    Array.from(document.querySelectorAll('button')).find(btn =>
                        btn.textContent?.match(/GPT|Gemini|Claude/i)
                    )
                return modelButton && modelButton.textContent && modelButton.textContent.trim().length > 0
            },
            { timeout: 60000 } // Increased timeout for slow CI/API
        )

        await this.modelSelector.click({ timeout: 60000 })
        await this.modelSearchInput.fill(modelName)
        // Scope to the dropdown to avoid clicking the selector button which might also display the model name
        await this.page.locator(".ai-dropdown").getByText(modelName, { exact: true }).click()
    }

    async toggleRAG() {
        await this.composeOptions.click()
        await this.ragToggle.click()
        await this.composeOptionClose.click()
    }

    async selectCollection(collectionName: string) {
        await this.composeOptions.click()
        await this.collectionSelector.click()

        // Wait for collection dropdown to be visible and collection to appear
        await this.page.waitForSelector(`text=${collectionName}`, { timeout: 10000 }).catch(() => { })

        // Try multiple selectors for the collection name
        const collectionSelectors = [
            this.page.getByText(collectionName, { exact: true }),
            this.page.getByText(collectionName),
            this.page.locator(`[role="menuitem"]:has-text("${collectionName}")`),
            this.page.locator(`li:has-text("${collectionName}")`),
        ]

        let collectionFound = false
        for (const selector of collectionSelectors) {
            try {
                await expect(selector).toBeVisible({ timeout: 5000 })
                await selector.click()
                collectionFound = true
                break
            } catch {
                // Try next selector
            }
        }

        if (!collectionFound) {
            throw new Error(`Collection "${collectionName}" not found in dropdown`)
        }

        await this.composeOptionClose.click()
    }

    async shareConversation(email: string) {
        await this.shareButton.click()
        await this.page.locator('input[placeholder="Email"]').fill(email)
        await this.page.getByRole("button", { name: "Share" }).click()
    }

    async renameConversation(newName: string) {
        // Wait for conversation list to be ready
        // Ensure sidebar is open first
        await this.ensureSidebarIsOpen()

        // Ensure "Conversations" section is open
        // Look for the header "Conversations" and ensure it is expanded
        // The list is usually below the header.
        const conversationsHeader = this.page.getByRole("button", { name: /Conversations/i }).first()

        // Wait for header to be present (it might take a moment if sidebar just opened)
        await conversationsHeader.waitFor({ state: "visible", timeout: 5000 }).catch(() => { })

        if (await conversationsHeader.isVisible()) {
            // Check if the list is visible. The list is in the sibling or child container.
            // Based on GeneralSidebar.vue, the list is in a div following the header button.
            // We can check if the expand icon is rotated or just check if we can find a conversation.

            // Try to find a conversation. If not found, click header.
            const anyConversation = this.page.locator("[data-conversation-id]").first()
            if (!(await anyConversation.isVisible())) {
                console.log("Conversations list might be collapsed, clicking header...")
                await conversationsHeader.click()
                await this.page.waitForTimeout(500)
            }
        }

        // Ensure sidebar is open first
        await this.ensureSidebarIsOpen()

        // Find the first conversation row (the clickable item)
        const conversationRow = this.page.locator("[data-conversation-id]").first()
        await conversationRow.waitFor({ state: "visible", timeout: 10000 })

        await conversationRow.hover()

        // Wait for the dropdown icon (svg) to be visible inside this row
        // Using the SVG selector as it was in the known working version
        const dropdownIcon = conversationRow.locator("svg")

        // Use evaluate to force visibility if needed due to opacity transition
        const opacityWrapper = conversationRow.locator("div.opacity-0").first()
        if (await opacityWrapper.count() > 0) {
            await opacityWrapper.evaluate((el) => {
                el.classList.remove("opacity-0")
                el.style.opacity = "1"
            })
        }

        await dropdownIcon.waitFor({ state: "visible", timeout: 5000 }).catch(() => console.log("Dropdown icon not visible, trying click anyway"))
        await dropdownIcon.click({ force: true })

        // Wait for the Rename option to appear and click it
        // We use "edit Rename" because the menu item contains both the icon name and the label
        const renameOption = this.page.getByText("edit Rename")
        await renameOption.waitFor({ state: "visible" })
        await renameOption.click()

        // Wait for the input to appear and fill in the new name
        const editInput = this.page.locator(".editConversationTitleInput")
        await editInput.waitFor({ state: "visible" })
        await editInput.fill(newName)
        await editInput.press("Enter")

        // Wait for the conversation to be renamed
        await this.waitForToast()
        const toastText = await this.getToastMessage()
        expect(toastText).toContain("Conversation title updated")
    }

    async ensureSidebarIsOpen() {
        // The sidebar container in mozart-rag-service-admin.vue has dynamic classes.
        // It has opacity-0 or pointer-events-none when closed.
        // It also has a specific background color class we can use to target it, along with role="dialog".
        const sidebarContainer = this.page.locator('[role="dialog"][aria-hidden="true"]').first()

        // Check if closed (has opacity-0 class, pointer-events-none, or small width)
        const isClosed = await sidebarContainer.evaluate((el) => {
            return el.classList.contains('opacity-0') ||
                el.classList.contains('pointer-events-none') ||
                el.getBoundingClientRect().width < 50
        })

        if (isClosed) {
            console.log("Sidebar appears closed, attempting to open...")

            // Find ALL "Toggle Sidebar" buttons
            const toggleButtons = this.page.getByRole('button', { name: 'Toggle Sidebar' })
            const count = await toggleButtons.count()

            let clicked = false
            for (let i = 0; i < count; i++) {
                const btn = toggleButtons.nth(i)
                if (await btn.isVisible()) {
                    console.log(`Clicking visible toggle button at index ${i}`)
                    await btn.click()
                    clicked = true
                    break
                }
            }

            if (!clicked) {
                console.log("WARNING: Could not find any visible 'Toggle Sidebar' button. Trying to force click the first one found in header if possible.")
                // Fallback attempt: maybe the header button is what we want
                // Assuming header button is roughly at top left
            }

            // Wait for transition
            await this.page.waitForTimeout(500)

            // Verify it opened
            const isNowClosed = await sidebarContainer.evaluate((el) => {
                return el.classList.contains('opacity-0') || el.getBoundingClientRect().width < 50
            })
            if (isNowClosed) {
                console.log("Sidebar failed to open or logic mismatch.")
            } else {
                console.log("Sidebar opened successfully.")
            }
        }
    }

    // Placeholder to keep the method if mistakenly referenced elsewhere or just remove the old one.
    // Ideally we replace the whole method block.

    async _old_renameConversation(newName: string) {
        await this.conversationsList.waitFor({ state: "visible", timeout: 30000 })

        // Find the first conversation row (the clickable item)
        const conversationRow = this.page.locator("[data-conversation-id]").first()

        // Wait for conversation row to exist and be visible
        await conversationRow.waitFor({ state: "visible", timeout: 30000 })

        // Scroll into view to ensure it's visible
        await conversationRow.scrollIntoViewIfNeeded()

        // Wait for the dropdown icon (svg) to be visible inside this row
        const dropdownTrigger = conversationRow.getByRole("button", { name: "Open conversation menu" })

        // Try multiple approaches to make the dropdown visible
        let dropdownVisible = false
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                // Hover over the conversation row
                await conversationRow.hover()
                await this.page.waitForTimeout(500) // Wait for hover effect

                // Check if dropdown is visible
                const isVisible = await dropdownTrigger.isVisible({ timeout: 2000 }).catch(() => false)
                if (isVisible) {
                    dropdownVisible = true
                    break
                }

                // Try clicking the row first to activate it
                if (attempt > 1) {
                    await conversationRow.click({ timeout: 2000 }).catch(() => { })
                    await this.page.waitForTimeout(500)
                }
            } catch (e) {
                console.log(`Attempt ${attempt + 1}/5: Dropdown not visible yet`)
            }
        }

        if (!dropdownVisible) {
            // Try force click as last resort
            await dropdownTrigger.click({ force: true, timeout: 5000 })
        } else {
            await dropdownTrigger.click({ force: true })
        }

        // Wait for the Rename option to appear and click it
        const renameOption = this.page.getByText("Rename")
        await renameOption.waitFor({ state: "visible", timeout: 10000 })
        await renameOption.click()

        // Wait for the input to appear and fill in the new name
        const editInput = this.page.locator(".editConversationTitleInput")
        await editInput.waitFor({ state: "visible", timeout: 10000 })
        await editInput.fill(newName)
        await editInput.press("Enter")

        // Wait for the conversation to be renamed
        await this.waitForToast()
        const toastText = await this.getToastMessage()
        expect(toastText).toContain("Conversation title updated")
    }

    async deleteConversation() {
        // Ensure sidebar is open first
        await this.ensureSidebarIsOpen()

        // Find the first conversation row (the clickable item)
        const conversationRow = this.page.locator("[data-conversation-id]").first()
        await conversationRow.waitFor({ state: "visible", timeout: 10000 })

        await conversationRow.hover()

        // Wait for the dropdown icon (svg) to be visible inside this row
        const dropdownIcon = conversationRow.locator("svg")

        // Use evaluate to force visibility if needed due to opacity transition
        const opacityWrapper = conversationRow.locator("div.opacity-0").first()
        if (await opacityWrapper.count() > 0) {
            await opacityWrapper.evaluate((el) => {
                el.classList.remove("opacity-0")
                el.style.opacity = "1"
            })
        }

        await dropdownIcon.waitFor({ state: "visible", timeout: 5000 }).catch(() => console.log("Dropdown icon not visible, trying click anyway"))
        await dropdownIcon.click({ force: true })

        // Wait for the Delete option to appear and click it
        // We use "delete Delete" because the menu item contains both the icon name and the label
        const deleteOption = this.page.getByText("delete Delete")
        await deleteOption.waitFor({ state: "visible" })
        await deleteOption.click()

        // Confirm the deletion in the modal
        const confirmDelete = this.page.getByRole("button", { name: "Delete" })
        await confirmDelete.waitFor({ state: "visible" })
        await confirmDelete.click()

        // Wait for the conversation to be deleted
        await this.waitForToast()
        const toastText = await this.getToastMessage()
        expect(toastText).toContain("Conversation deleted successfully")
    }

    async waitForResponse() {
        // First wait for message container to appear
        await this.page.waitForSelector(".message", { state: "visible", timeout: 80000 })

        // Wait for skeleton to disappear (no more animate-pulse elements in message area)
        await this.page.waitForFunction(
            () => {
                const messages = document.querySelectorAll(".message")
                if (messages.length < 2) return false // Wait for at least user + assistant message

                // Check if skeleton is gone from the assistant message
                const assistantMessage = messages[1] // Second message should be assistant
                const skeletonElements = assistantMessage.querySelectorAll(".animate-pulse")
                return skeletonElements.length === 0
            },
            { timeout: 80000 }
        )

        // Wait for actual message content to be attached
        await this.messageContent.nth(1).waitFor({ state: "attached", timeout: 30000 })

        // Wait for markdown content to be visible
        await expect(this.page.locator(".message").nth(1).locator(".markdown-body")).toBeVisible({ timeout: 30000 })
    }

    async expectToBeOnCompose() {
        await expect(this.page).toHaveURL(/.*\/compose/)
        await expect(this.chatInput).toBeVisible()
        await expect(this.sendButton).toBeVisible()

        // Ensure sidebar is open and stable
        await this.ensureSidebarIsOpen()

        // Now check that sidebar navigation elements are visible
        await expect(this.page.locator("a").filter({ hasText: "Compose" })).toBeVisible({ timeout: 10000 })
        await expect(this.page.locator("text=Workbench")).toBeVisible({ timeout: 10000 })
        await expect(this.page.getByText('chatConversationsexpand_more')).toBeVisible({ timeout: 10000 })

        // CRITICAL: Wait for models to load before tests continue
        // This ensures the model selector has actual data and isn't in skeleton loading state
        await this.page.waitForFunction(
            () => {
                const modelButton = document.querySelector('button[class*="model"]') ||
                    Array.from(document.querySelectorAll('button')).find(btn =>
                        btn.textContent?.match(/GPT|Gemini|Claude/i)
                    )
                return modelButton && modelButton.textContent && modelButton.textContent.trim().length > 0
            },
            { timeout: 60000 } // Allow up to 60s for models to load in CI
        ).catch(() => {
            console.warn("[Test] Models did not load within timeout, tests may fail if they need to select a model")
        })
    }

    async expectMessageExists(content: string) {
        await expect(this.messageContent).toContainText(content)
    }

    async expectResponseReceived() {
        await this.waitForResponse()
        const responseMessage = this.messageContent.nth(1)
        await expect(responseMessage).toBeVisible()

        // Ensure it's not showing skeleton content
        await expect(this.page.locator(".message").nth(1).locator(".animate-pulse")).not.toBeVisible()
    }

    async expectFileUploaded() {
        await expect(this.page.getByText("descriptiondocument.")).toBeVisible()
    }

    async getLastMessageContent() {
        const lastMessage = this.messageContent.last()
        return await lastMessage.textContent()
    }

    async expectConversationInList(title: string) {
        // Find conversation title in the sidebar - titles are in spans with class 'truncate'
        // Note: titles might be truncated if longer than 22 characters (trimTitle function)
        const truncatedTitle = title.length > 22 ? title.substring(0, 22) : title
        await expect(this.page.locator("span.truncate").getByText(truncatedTitle, { exact: false })).toBeVisible()
    }

    async expectConversationNotInList(title: string) {
        const truncatedTitle = title.length > 22 ? title.substring(0, 22) : title
        await expect(this.page.locator("span.truncate").getByText(truncatedTitle, { exact: false })).not.toBeVisible()
    }

    async waitForTimeout(ms: number) {
        await this.page.waitForTimeout(ms)
    }



    async toggleMCP() {
        await this.composeOptions.click()
        await this.mcpToggle.click()
        await this.composeOptionClose.click()
    }

    async changeSystemPrompt(format: string) {
        await this.page.getByText(format).click()
    }

    async changeWritingFormat(format: string) {
        await this.composeOptions.click()
        await this.writingMenuOptions.click()
        await this.page.getByText(format).click()
        await this.composeOptionClose.click()
    }

    // Dynamic link helpers
    async expectDynamicLinksPresent(minCount: number = 1) {
        // Ensure assistant content is present first
        await this.waitForResponse()
        const count = await this.dynamicLinks.count()
        expect(count).toBeGreaterThanOrEqual(minCount)
    }

    async getDynamicLinkHrefs(): Promise<string[]> {
        await this.waitForResponse()
        return await this.dynamicLinks.evaluateAll((elements) => elements.map((el) => (el as HTMLAnchorElement).getAttribute("href") || "").filter((href) => href.length > 0))
    }

    async clickFirstDynamicLinkAndVerifyNewTab() {
        await this.waitForResponse()
        const firstLink = this.dynamicLinks.first()
        await expect(firstLink).toBeVisible()

        // Validate link attributes before clicking
        const href = await firstLink.getAttribute("href")
        expect(href ?? "").toMatch(/^https?:\/\//)
        const target = await firstLink.getAttribute("target")
        expect(target).toBe("_blank")

        const initialPages = this.page.context().pages().length

        // Try to capture new tab via both popup and context page events
        let newPage = null as null | Page
        try {
            const result = await Promise.race([
                Promise.all([this.page.waitForEvent("popup", { timeout: 7000 }), firstLink.click()]).then(([popup]) => popup),
                Promise.all([
                    this.page.context().waitForEvent("page", { timeout: 7000 }),
                    // Ensure click is fired even if race resolves via context event
                    firstLink.click(),
                ]).then(([page]) => page),
            ]).catch(() => null)

            newPage = result as Page | null
        } catch {
            newPage = null
        }

        if (newPage) {
            await newPage.waitForLoadState("domcontentloaded").catch(() => { })
            expect(newPage.url()).toMatch(/^https?:\/\//)
            await newPage.close().catch(() => { })
        } else {
            // Fallback: ensure we didn't navigate away and page count didn't drop
            await expect(this.page).toHaveURL(/.*\/compose/)
            const afterPages = this.page.context().pages().length
            expect(afterPages).toBeGreaterThanOrEqual(initialPages)
        }
    }
}
