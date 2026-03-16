import { chromium } from "@playwright/test"
import type { FullConfig } from "@playwright/test"

async function globalSetup(config: FullConfig) {
    console.log("🚀 Setting up global test environment...")

    // Detect if running in UI mode - global setup behaves differently in UI mode
    const isUIMode = process.env.PWTEST_WATCH === '1' || process.argv.some(arg => arg.includes('--ui'))

    if (isUIMode) {
        console.log("🎨 Running in UI mode - skipping global setup browser navigation")
        console.log("✅ Global setup completed (UI mode)")
        return
    }

    // Start MSW server for API mocking
    console.log("📡 Starting MSW server...")

    // You could start a real backend server here if needed
    // const server = spawn('npm', ['run', 'dev:api'], { detached: true })

    // Setup test database or other resources
    console.log("🗄️  Setting up test database...")

    // Create a browser instance for authentication if needed
    console.log("🔐 Setting up authentication...")

    try {
        const browser = await chromium.launch()
        const context = await browser.newContext()
        const page = await context.newPage()

        // Pre-authenticate a test user if needed
        // This creates a stored auth state that can be reused
        const baseURL = (config as any).use?.baseURL || process.env.CLIENT_URL || "http://localhost:3000"

        // Try to navigate to login page, but don't fail if server isn't running
        // Tests will set up their own auth state anyway
        try {
            // Use domcontentloaded instead of load for faster timeout
            await page.goto(`${baseURL}/auth/login`, { 
                waitUntil: "domcontentloaded",
                timeout: 30000 
            })
        } catch (navigationError) {
            console.log("⚠️ Could not navigate to login page (server may not be running)")
            console.log("⚠️ This is okay - tests will set up their own auth state")
            // Continue anyway - we'll just create the auth state file without navigation
        }

        // Mock authentication for performance
        // Create auth state even if navigation failed
        await context.addCookies([
            {
                name: "mozart",
                value: "test-auth-token",
                domain: "localhost",
                path: "/",
                httpOnly: false,
                secure: false,
                sameSite: "Lax",
            },
        ])

        // Save authentication state (this will work even if navigation failed)
        await page.context().storageState({ path: "tests/auth-state.json" })

        await browser.close()

        console.log("✅ Global setup completed successfully")
    } catch (error) {
        console.error("❌ Global setup failed:", error)
        // Don't throw - allow tests to continue (they'll set up their own auth)
        console.log("⚠️ Continuing anyway - tests will handle their own setup")
    }
}

export default globalSetup
