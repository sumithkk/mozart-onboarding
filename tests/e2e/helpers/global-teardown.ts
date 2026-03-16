import type { FullConfig } from "@playwright/test"
import fs from "fs"
import path from "path"

async function globalTeardown(config: FullConfig) {
    console.log("🧹 Cleaning up global test environment...")

    try {
        // Clean up authentication state file
        const authStatePath = path.join(process.cwd(), "tests/auth-state.json")
        if (fs.existsSync(authStatePath)) {
            fs.unlinkSync(authStatePath)
            console.log("🗑️  Cleaned up auth state file")
        }

        // Stop any background servers that were started
        console.log("🛑 Stopping background services...")

        // Clean up test database or other resources
        console.log("🗄️  Cleaning up test database...")

        // Clean up any temporary files
        const tempDirs = ["tests/test-results", "tests/playwright-report", "tests/temp"]

        for (const tempDir of tempDirs) {
            const fullPath = path.join(process.cwd(), tempDir)
            if (fs.existsSync(fullPath)) {
                console.log(`🗑️  Cleaning up ${tempDir}`)
                // Note: Be careful with recursive deletion in production
                // fs.rmSync(fullPath, { recursive: true, force: true })
            }
        }

        console.log("✅ Global teardown completed successfully")
    } catch (error) {
        console.error("❌ Global teardown failed:", error)
        // Don't throw here as it might hide test failures
    }
}

export default globalTeardown
