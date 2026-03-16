import type { Page } from "@playwright/test"

/**
 * Checks if the page is on a proper HTTP/HTTPS URL where storage operations are allowed
 */
async function isStorageAccessible(page: Page): Promise<boolean> {
    try {
        const url = page.url()
        return !!(url && (url.startsWith("http://") || url.startsWith("https://")))
    } catch {
        return false
    }
}

/**
 * Ensures the page is on a proper URL before performing storage operations
 */
async function ensureProperURL(page: Page, fallbackURL: string = "/") {
    const isAccessible = await isStorageAccessible(page)
    if (!isAccessible) {
        await page.goto(fallbackURL)
        await page.waitForLoadState("networkidle")
    }
}

/**
 * Sets up MSW (Mock Service Worker) for the given page
 * This should be called in test setup or beforeEach hooks
 */
export async function setupMSW(page: Page) {
    // Register the service worker
    await page.addInitScript(() => {
        // Create a mock fetch function for MSW to intercept requests
        const originalFetch = window.fetch

        window.fetch = async (...args) => {
            // Let MSW handle the request first
            return originalFetch(...args)
        }
    })

    // Add MSW script to the page
    await page.addInitScript(`
    if (typeof window !== 'undefined') {
      // MSW worker setup for browser environment
      window.__MSW_ENABLED__ = true
    }
  `)
}

/**
 * Enables request interception for API mocking
 * This function sets up route handlers for common API patterns
 */
export async function enableAPIInterception(page: Page) {
    const mockUser = {
        id: "test-user-id",
        userId: "test-user-id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "basic",
        models: ["gpt-4", "gpt-4o", "gpt-4.1", "gemini-2.0-flash-lite", "gemini-2.0-flash", "claude-3-5-sonnet-20241022"],
    }

    const mockModels = {
        OpenAI: {
            models: [
                { model: "gpt-4", model_name: "GPT-4", is_temperature_supported: true },
                { model: "gpt-4o", model_name: "GPT-4 O", is_temperature_supported: true },
                { model: "gpt-4.1", model_name: "GPT-4.1", is_temperature_supported: true },
                { model: "o3", model_name: "O3", is_temperature_supported: false },
                { model: "o4-mini", model_name: "O4 Mini", is_temperature_supported: false },
            ],
            icon: "i-logos-openai-icon",
        },
        Claude: {
            models: [
                { model: "claude-sonnet-4", model_name: "Claude Sonnet 4", is_temperature_supported: true },
                { model: "claude-opus-4", model_name: "Claude Opus 4", is_temperature_supported: true },
            ],
            icon: "i-logos-anthropic-icon",
        },
        Gemini: {
            models: [
                { model: "gemini-2.0-flash-lite", model_name: "Gemini 2.0 Flash Lite", is_temperature_supported: true },
                { model: "gemini-2.0-flash", model_name: "Gemini 2.0 Flash", is_temperature_supported: true },
                { model: "gemini-2.5-flash", model_name: "Gemini 2.5 Flash", is_temperature_supported: true },
            ],
            icon: "i-logos-google-icon",
        },
        Mistral: {
            models: [
                { model: "mistral-small", model_name: "Mistral Small", is_temperature_supported: true },
                { model: "mistral-medium", model_name: "Mistral Medium", is_temperature_supported: true },
                { model: "mistral-large", model_name: "Mistral Large", is_temperature_supported: true },
            ],
            icon: "i-logos-mistral-icon",
        },
        Cohere: {
            models: [
                { model: "command-a", model_name: "Command A", is_temperature_supported: true },
                { model: "command-nightly", model_name: "Command Nightly", is_temperature_supported: true },
            ],
            icon: "i-logos-cohere-icon",
        },
        Perplexity: {
            models: [
                { model: "sonar", model_name: "Sonar", is_temperature_supported: true },
                { model: "sonar-deep-research", model_name: "Sonar Deep Research", is_temperature_supported: true },
            ],
            icon: "i-logos-perplexity-icon",
        },
        Grok: {
            models: [
                { model: "grok-3-fast", model_name: "Grok 3 Fast", is_temperature_supported: true },
                { model: "grok-4", model_name: "Grok 4", is_temperature_supported: true },
            ],
            icon: "i-logos-grok-icon",
        },
    }

    // --- Critical Mocks (Direct Playwright Interception) ---
    // These ensure the app can boot and login without relying on MSW/Backend

    // 1. Auth Login: Bypass login screen
    await page.route("**/api/auth/login", async (route) => {
        const body = route.request().postDataJSON() || {}
        const { email, password } = body
        // Permissive login
        if ((email === "test@example.com" && password === "password") || email) {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    code: 200,
                    message: "Login successful",
                    data: { accessToken: "mock-jwt-token", user: mockUser },
                }),
            })
        } else {
            await route.fulfill({ status: 401, body: JSON.stringify({ message: "Invalid credentials" }) })
        }
    })

    // 2. Auth Session: App checks this on load
    await page.route("**/api/auth/session", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "Session data retrieved",
                data: mockUser,
            }),
        })
    })

    // 3. Better-Auth Session: App checks this too
    await page.route("**/api/auth/get-session", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                user: mockUser,
                session: {
                    id: "test-session-id",
                    userId: mockUser.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
            }),
        })
    })

    // 4. Models: Critical for app initialization (avoids crash)
    await page.route("**/api/config/getModels", async (route) => {
        console.log("[MSW] Intercepting GET /api/config/getModels")
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                status: "success",
                message: "Models retrieved successfully",
                data: mockModels,
            }),
        })
        console.log("[MSW] Successfully returned mock models:", Object.keys(mockModels))
    })

    // 5. User Data
    await page.route("**/api/v2/user/data", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "User data retrieved",
                data: mockUser,
            }),
        })
    })

    // 6. Integration Services 
    await page.route("**/api/user/integration-services", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "Integrations retrieved successfully",
                data: {},
            }),
        })
    })

    // --- File Mocks (Restored for file-interaction.spec.ts) ---
    const mockFileSystemItems: any[] = []

    // File Create - Critical for "uploadFile"
    await page.route("**/api/v2/file/create", async (route) => {
        const id = "FS_" + Date.now()
        const postData = route.request().postData() || ""
        const postDataJson = route.request().postDataJSON() || {}

        // Try to extract parentFolderId from multipart/form-data if not in JSON
        let parentFolderId = postDataJson.parentFolderId || "root"
        let fileName = postDataJson.fileName || "document.pdf"

        if (!postDataJson.parentFolderId && typeof postData === 'string') {
            const folderMatch = postData.match(/name="parentFolderId"\r\n\r\n(.*)\r\n/)
            if (folderMatch) parentFolderId = folderMatch[1].trim()

            const fileMatch = postData.match(/filename="(.*)"/)
            if (fileMatch) fileName = fileMatch[1].trim()
        }

        // Mock a file object in the format expected by the store
        const newFile = {
            id: id, // Store uses 'id' field
            fileId: id, // API uses 'fileId' field
            fileName: fileName,
            name: fileName, // Store also uses 'name' field
            originalName: fileName,
            fileSize: 1024,
            size: 1024, // Store also uses 'size' field
            type: "file",
            path: "/",
            parentFolderId: parentFolderId,
            fileType: "application/pdf",
            mimeType: "application/pdf", // Store uses 'mimeType'
            contentType: "application/pdf",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            url: "http://localhost:3000/mock-file.pdf",
            status: "processed",
            lastModifiedBy: "Test User"
        }
        mockFileSystemItems.push(newFile)

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: `File ${newFile.fileName} uploaded successfully`,
                data: { files: [newFile] },
            }),
        })
    })

    // Folder Create
    await page.route("**/api/v2/folder/create", async (route) => {
        const postData = route.request().postDataJSON() || {}
        const newFolder = {
            id: "FLD_" + Date.now(),
            name: postData.name,
            type: "folder",
            path: postData.path || "/",
            parentFolderId: postData.parentFolderId || "root",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: "mock-user-id",
            isTrashed: false,
            isStarred: false,
            sharedUsers: []
        }
        mockFileSystemItems.push(newFolder)

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "Folder created successfully",
                data: newFolder
            }),
        })
    })

    // File Delete - Critical for "deleteFile"
    await page.route("**/api/v2/file/delete", async (route) => {
        const { fileId } = route.request().postDataJSON() || {}
        // Match by both fileId and id since the mock uses both
        const index = mockFileSystemItems.findIndex(f => f.fileId === fileId || f.id === fileId)
        if (index !== -1) {
            mockFileSystemItems.splice(index, 1)
            console.log(`[MSW] Deleted file with fileId: ${fileId}, remaining items: ${mockFileSystemItems.length}`)
        } else {
            console.log(`[MSW] File with fileId: ${fileId} not found in mockFileSystemItems`)
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "File deleted successfully",
                data: { success: true }
            }),
        })
    })

    // Folder Delete
    await page.route("**/api/v2/folder/delete", async (route) => {
        const { folderId } = route.request().postDataJSON() || {}
        const index = mockFileSystemItems.findIndex(f => f.id === folderId)
        if (index !== -1) {
            mockFileSystemItems.splice(index, 1)
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "Folder deleted successfully",
                data: { success: true }
            }),
        })
    })

    // File listing - getFolderContents
    await page.route("**/api/v2/folder/getFolderContents/**", async (route) => {
        const url = route.request().url()
        // Extract folderId more reliably
        const match = url.match(/getFolderContents\/(.*?)(\?|$)/)
        let folderId = match ? match[1] : "root"

        if (!folderId || folderId === 'getFolderContents') folderId = "root"

        const childFiles: Record<string, any> = {}
        const childFolders: Record<string, any> = {}

        mockFileSystemItems.forEach(item => {
            const parentId = item.parentFolderId || "root"
            const searchId = folderId === "root" ? "root" : folderId

            if (parentId === searchId || (searchId === "root" && parentId === "")) {
                if (item.type === "file") {
                    childFiles[item.fileId] = item
                } else if (item.type === "folder") {
                    childFolders[item.id] = item
                }
            }
        })

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                code: 200,
                message: "Folder contents retrieved",
                data: {
                    folder: { name: folderId === "root" ? "root" : "Folder", path: "/", folderId: folderId },
                    childFolders: childFolders,
                    childFiles: childFiles
                }
            }),
        })
    })

    // Serve Dummy PDF for Viewer
    await page.route("**/mock-file.pdf", async (route) => {
        // Minimal valid PDF header/trailer to allow viewer to initialize (and show buttons)
        const dummyPdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n200\n%%EOF"
        await route.fulfill({
            status: 200,
            contentType: "application/pdf",
            body: dummyPdf
        })
    })

    // --- Chat/Conversation Mocks ---
    // Mock conversation creation and message sending
    await page.route("**/api/v2/conversations", async (route) => {
        console.log("[MSW] Intercepting conversation request:", route.request().method())

        if (route.request().method() === "POST") {
            // Creating new conversation - return mock conversation
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    code: 200,
                    message: "Conversation created",
                    data: {
                        id: "mock-conversation-" + Date.now(),
                        title: "New Conversation",
                        messages: []
                    }
                })
            })
        } else {
            // GET - list conversations
            await route.fulfill({
                status: 200,
                body: JSON.stringify({ code: 200, data: [] })
            })
        }
    })

    // Mock sending messages - ONLY POST requests, let GET through
    await page.route("**/api/v2/conversations/*/messages", async (route) => {
        const method = route.request().method()

        if (method === "POST") {
            console.log("[MSW] Intercepting message send (POST)")

            // Return a mock AI response
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    code: 200,
                    message: "Message sent",
                    data: {
                        id: "msg-" + Date.now(),
                        role: "assistant",
                        content: "This is a mock AI response for testing purposes.",
                        createdAt: new Date().toISOString()
                    }
                })
            })
        } else {
            // GET - let it through (fetching message history)
            console.log("[MSW] Letting GET messages request through")
            try {
                await route.continue()
            } catch {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify({ code: 200, data: [] })
                })
            }
        }
    })

    // Mock streaming responses - only POST
    await page.route("**/api/stream/**", async (route) => {
        if (route.request().method() === "POST") {
            console.log("[MSW] Intercepting stream request (POST)")
            // Return a proper streaming response that closes immediately
            // Format: SSE (Server-Sent Events) with proper closing
            const streamResponse = [
                "data: " + JSON.stringify({ content: "testing", done: false }) + "\n\n",
                "data: " + JSON.stringify({ content: "", done: true }) + "\n\n",
                "data: [DONE]\n\n"
            ].join("")

            await route.fulfill({
                status: 200,
                contentType: "text/event-stream",
                headers: {
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
                body: streamResponse
            })
            console.log("[MSW] Stream response sent and closed")
        } else {
            await route.continue()
        }
    })

    // --- Fallback / catch-all ---
    // Pass other requests to MSW or Network
    await page.route("**/api/**", async (route) => {
        const url = route.request().url()

        try {
            await route.continue()
        } catch {
            // If backend is down, return generic success to prevent crash
            console.log("[MSW] Fallback mock for:", url)
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ code: 200, message: "Mock response" }),
            })
        }
    })

    // Intercept RAG service requests
    await page.route("**/rag/**", async (route) => {
        try { await route.continue() } catch { }
    })
}

/**
 * Sets up authentication state for testing
 * This function mocks the authentication cookie and session
 */
export async function setupAuthState(
    page: Page,
    options: {
        email?: string
        firstName?: string
        lastName?: string
        role?: string
        isAuthenticated?: boolean
    } = {}
) {
    const { email = "test@example.com", firstName = "Test", lastName = "User", role = "basic", isAuthenticated = true } = options

    if (isAuthenticated) {
        // Set authentication cookie
        await page.context().addCookies([
            {
                name: "mozart",
                value: "mock-jwt-token",
                domain: "localhost",
                path: "/",
                httpOnly: false,
                secure: false,
                sameSite: "Lax",
            },
        ])

        // Set user data in localStorage - use addInitScript to ensure it runs when page loads
        await page.addInitScript(
            ({ email, firstName, lastName, role }) => {
                try {
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            userId: "test-user-id",
                            email,
                            firstName,
                            lastName,
                            role,
                            isAuthenticated: true,
                        })
                    )

                    sessionStorage.setItem("mozart", "mock-jwt-token")
                } catch (e) {
                    // Handle cases where localStorage/sessionStorage might not be accessible
                    console.warn("Could not set auth state in storage:", e)
                }
            },
            { email, firstName, lastName, role }
        )
    }
}

/**
 * Clears authentication state
 */
export async function clearAuthState(page: Page) {
    // Clear cookies
    await page.context().clearCookies()

    // Clear storage - only if we're on a proper HTTP/HTTPS URL
    try {
        const url = page.url()
        if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
            await page.evaluate(() => {
                try {
                    localStorage.clear()
                    sessionStorage.clear()
                } catch (e) {
                    // Handle cases where localStorage/sessionStorage might not be accessible
                    console.warn("Could not clear storage:", e)
                }
            })
        }
    } catch (error) {
        // If page.evaluate fails, we can continue without clearing storage
        console.warn("Could not clear auth state:", error)
    }
}

/**
 * Waits for the page to be fully loaded and stable
 */
export async function waitForPageReady(page: Page) {
    // Wait for domcontentloaded instead of networkidle for better reliability
    await page.waitForLoadState("domcontentloaded")

    // Wait for Vue app to mount
    await page.waitForFunction(
        () => {
            const nuxtElement = document.querySelector("#__nuxt")
            return document.readyState === "complete" && nuxtElement !== null && nuxtElement.innerHTML.trim() !== ""
        },
        { timeout: 20000 }
    ).catch(() => {
        // If Vue mounting check fails, continue anyway
    })

    // Wait for any pending API calls to complete
    await page.waitForTimeout(500)
}

/**
 * Sets up common test environment
 */
export async function setupTestEnvironment(
    page: Page,
    options: {
        enableMSW?: boolean
        enableAuth?: boolean
        authOptions?: Parameters<typeof setupAuthState>[1]
    } = {}
) {
    const { enableMSW = true, enableAuth = false, authOptions = {} } = options

    console.log("[Setup] Starting test environment setup", { enableMSW, enableAuth, url: page.url() })

    if (enableMSW) {
        console.log("[Setup] Enabling MSW and API interception...")
        await setupMSW(page)
        await enableAPIInterception(page)
        console.log("[Setup] MSW and API interception enabled")
    }

    if (enableAuth) {
        console.log("[Setup] Setting up auth state...")
        await setupAuthState(page, authOptions)
        console.log("[Setup] Auth state setup complete")
    }

    console.log("[Setup] Test environment setup complete")
}

/**
 * Mocks a specific API endpoint with custom response
 */
export async function mockAPIEndpoint(
    page: Page,
    endpoint: string,
    response: any,
    options: {
        method?: string
        status?: number
        delay?: number
    } = {}
) {
    const { method = "GET", status = 200, delay = 0 } = options

    await page.route(`**${endpoint}`, async (route) => {
        if (route.request().method() === method) {
            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay))
            }

            await route.fulfill({
                status,
                contentType: "application/json",
                body: JSON.stringify(response),
            })
        } else {
            await route.continue()
        }
    })
}

/**
 * Simulates network errors for testing error handling
 */
export async function simulateNetworkError(page: Page, endpoint: string, errorType: "timeout" | "connection" | "server" = "server") {
    await page.route(`**${endpoint}`, async (route) => {
        switch (errorType) {
            case "timeout":
                // Simulate timeout by delaying indefinitely
                await new Promise(() => { }) // Never resolves
                break
            case "connection":
                await route.abort("connectionfailed")
                break
            case "server":
            default:
                await route.fulfill({
                    status: 500,
                    contentType: "application/json",
                    body: JSON.stringify({ error: "Internal Server Error" }),
                })
                break
        }
    })
}

/**
 * Gets the current authentication state from the page
 */
export async function getAuthState(page: Page) {
    try {
        const url = page.url()
        if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            return {
                cookie: null,
                userData: null,
                sessionToken: null,
                isAuthenticated: false,
            }
        }

        return await page.evaluate(() => {
            try {
                const cookie = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("mozart="))
                    ?.split("=")[1]

                const userData = localStorage.getItem("user")
                const sessionToken = sessionStorage.getItem("mozart")

                return {
                    cookie,
                    userData: userData ? JSON.parse(userData) : null,
                    sessionToken,
                    isAuthenticated: !!(cookie || sessionToken),
                }
            } catch (e) {
                console.warn("Could not get auth state:", e)
                return {
                    cookie: null,
                    userData: null,
                    sessionToken: null,
                    isAuthenticated: false,
                }
            }
        })
    } catch (error) {
        console.warn("Could not evaluate auth state:", error)
        return {
            cookie: null,
            userData: null,
            sessionToken: null,
            isAuthenticated: false,
        }
    }
}

/**
 * Safely clears authentication state after ensuring proper URL navigation
 */
export async function safelyClearAuthState(page: Page, navigationURL: string = "/auth/login") {
    // Ensure we're on a proper URL first
    await ensureProperURL(page, navigationURL)

    // Now safely clear auth state
    await clearAuthState(page)
}

/**
 * Safely gets authentication state after ensuring proper URL navigation
 */
export async function safelyGetAuthState(page: Page, navigationURL: string = "/auth/login") {
    // Ensure we're on a proper URL first
    await ensureProperURL(page, navigationURL)

    // Now safely get auth state
    return await getAuthState(page)
}
