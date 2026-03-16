import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync, statSync } from "fs"
import { join, extname } from "path"

/**
 * Unit tests for component color usage
 * Ensures components use Mozart brand colors instead of default Tailwind blues
 */

/**
 * Recursively find all Vue, TSX, and JSX files in a directory
 */
function findComponentFiles(
    dir: string,
    fileList: string[] = [],
    ignoreDirs: string[] = [
        "node_modules",
        "dist",
        ".nuxt",
        "tests",
        ".output",
    ]
): string[] {
    try {
        const files = readdirSync(dir)

        files.forEach((file) => {
            const filePath = join(dir, file)
            const stat = statSync(filePath)

            if (stat.isDirectory()) {
                if (!ignoreDirs.includes(file)) {
                    findComponentFiles(filePath, fileList, ignoreDirs)
                }
            } else {
                const ext = extname(file)
                if ([".vue", ".tsx", ".jsx"].includes(ext)) {
                    fileList.push(filePath)
                }
            }
        })
    } catch (error) {
        // Skip directories that can't be read
    }

    return fileList
}

describe("Component Color Usage", () => {
    const srcPath = join(process.cwd(), "src")

    describe("Prevent Default Tailwind Blue Usage", () => {
        it("should not use bg-blue-600 in components", () => {
            const files = findComponentFiles(srcPath)
            const violations: string[] = []

            for (const filePath of files) {
                try {
                    const content = readFileSync(filePath, "utf-8")
                    // Check for bg-blue-600 (but allow mozart-blue-600)
                    const bgBlue600Matches = content.match(
                        /\bbg-blue-600\b/g
                    )
                    if (bgBlue600Matches) {
                        const relativePath = filePath.replace(
                            process.cwd() + "/",
                            ""
                        )
                        violations.push(
                            `${relativePath} contains bg-blue-600 (use bg-mozart-blue instead)`
                        )
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            expect(violations).toEqual([])
        })

        it("should not use text-blue-600 in components", () => {
            const files = findComponentFiles(srcPath)
            const violations: string[] = []

            for (const filePath of files) {
                try {
                    const content = readFileSync(filePath, "utf-8")
                    const textBlue600Matches = content.match(
                        /\btext-blue-600\b/g
                    )
                    if (textBlue600Matches) {
                        const relativePath = filePath.replace(
                            process.cwd() + "/",
                            ""
                        )
                        violations.push(
                            `${relativePath} contains text-blue-600 (use text-mozart-blue instead)`
                        )
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            expect(violations).toEqual([])
        })

        it("should not use border-blue-600 in components", () => {
            const files = findComponentFiles(srcPath)
            const violations: string[] = []

            for (const filePath of files) {
                try {
                    const content = readFileSync(filePath, "utf-8")
                    const borderBlue600Matches = content.match(
                        /\bborder-blue-600\b/g
                    )
                    if (borderBlue600Matches) {
                        const relativePath = filePath.replace(
                            process.cwd() + "/",
                            ""
                        )
                        violations.push(
                            `${relativePath} contains border-blue-600 (use border-mozart-blue instead)`
                        )
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            expect(violations).toEqual([])
        })

        it("should not use hover:bg-blue-700 in components", () => {
            const files = findComponentFiles(srcPath)
            const violations: string[] = []

            for (const filePath of files) {
                try {
                    const content = readFileSync(filePath, "utf-8")
                    const hoverBlue700Matches = content.match(
                        /\bhover:bg-blue-700\b/g
                    )
                    if (hoverBlue700Matches) {
                        const relativePath = filePath.replace(
                            process.cwd() + "/",
                            ""
                        )
                        violations.push(
                            `${relativePath} contains hover:bg-blue-700 (use hover:bg-mozart-blue-700 instead)`
                        )
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            expect(violations).toEqual([])
        })

        it("should not use focus:ring-blue-500 in components", () => {
            const files = findComponentFiles(srcPath)
            const violations: string[] = []

            for (const filePath of files) {
                try {
                    const content = readFileSync(filePath, "utf-8")
                    const focusRingBlueMatches = content.match(
                        /\bfocus:ring-blue-500\b/g
                    )
                    if (focusRingBlueMatches) {
                        const relativePath = filePath.replace(
                            process.cwd() + "/",
                            ""
                        )
                        violations.push(
                            `${relativePath} contains focus:ring-blue-500 (use focus:ring-mozart-blue-500 instead)`
                        )
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            expect(violations).toEqual([])
        })
    })

    describe("Key Components Use Mozart Colors", () => {
        it("should use mozart-blue in login page", () => {
            const loginPath = join(
                srcPath,
                "pages/auth/login/index.vue"
            )
            const content = readFileSync(loginPath, "utf-8")

            expect(content).toContain("mozart-blue")
            expect(content).toContain("mozart-blue-700")
            expect(content).toContain("mozart-blue-500")
        })

        it("should use mozart-blue in signup page", () => {
            const signupPath = join(
                srcPath,
                "pages/auth/signUp/index.vue"
            )
            const content = readFileSync(signupPath, "utf-8")

            expect(content).toContain("mozart-blue")
            expect(content).toContain("mozart-blue-700")
            expect(content).toContain("mozart-blue-500")
        })

        it("should use mozart-blue in FileExplorer component", () => {
            const fileExplorerPath = join(
                srcPath,
                "components/ui/FileManagement/FileExplorer.vue"
            )
            const content = readFileSync(fileExplorerPath, "utf-8")

            expect(content).toContain("mozart-blue")
            expect(content).toContain("mozart-blue-500")
            expect(content).toContain("mozart-blue-700")
        })

        it("should use mozart-blue in Toolbar component", () => {
            const toolbarPath = join(
                srcPath,
                "components/ui/FileManagement/Toolbar.vue"
            )
            const content = readFileSync(toolbarPath, "utf-8")

            expect(content).toContain("mozart-blue-700")
        })

        it("should use mozart-blue in UserInfo component", () => {
            const userInfoPath = join(
                srcPath,
                "components/ui/Settings/UserInfo.vue"
            )
            const content = readFileSync(userInfoPath, "utf-8")

            expect(content).toContain("mozart-blue-700")
        })

        it("should use mozart-blue in GeneralSidebar component", () => {
            const sidebarPath = join(
                srcPath,
                "layouts/sidebars/GeneralSidebar.vue"
            )
            const content = readFileSync(sidebarPath, "utf-8")

            expect(content).toContain("mozart-blue")
        })
    })

    describe("Color Pattern Validation", () => {
        it("should use Tailwind utility classes instead of arbitrary values for borders", () => {
            const files = findComponentFiles(srcPath)
            const violations: string[] = []

            for (const filePath of files) {
                try {
                    const content = readFileSync(filePath, "utf-8")
                    // Check for border-t-[#2844a4] pattern (should use border-t-mozart-blue)
                    const arbitraryBorderMatches = content.match(
                        /\bborder-t-\[#2844a4\]/g
                    )
                    if (arbitraryBorderMatches) {
                        const relativePath = filePath.replace(
                            process.cwd() + "/",
                            ""
                        )
                        violations.push(
                            `${relativePath} uses arbitrary border color (use border-t-mozart-blue instead)`
                        )
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }

            expect(violations).toEqual([])
        })
    })
})

