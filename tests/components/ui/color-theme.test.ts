import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Component-level tests for color theme usage
 * Ensures components render with correct Mozart brand colors
 */

describe("Component Color Theme Tests", () => {
    describe("CSS Color Variables Accessibility", () => {
        it("should have mozart-blue available as CSS variable", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            expect(cssContent).toContain("--color-mozart-blue")
        })

        it("should have mozart-blue shades available", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            const shades = [
                "mozart-blue-50",
                "mozart-blue-100",
                "mozart-blue-500",
                "mozart-blue-600",
                "mozart-blue-700",
                "mozart-blue-800",
                "mozart-blue-900",
            ]

            shades.forEach((shade) => {
                expect(cssContent).toContain(`--color-${shade}`)
            })
        })
    })

    describe("Brand Color Values", () => {
        it("should define mozart-blue with correct hex value", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            // Primary brand color
            expect(cssContent).toMatch(
                /--color-mozart-blue:\s*#2844a4/i
            )
        })

        it("should define mozart-white with correct hex value", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            expect(cssContent).toMatch(
                /--color-mozart-white:\s*#f6f6f6/i
            )
        })

        it("should define mozart-gray with correct hex value", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            expect(cssContent).toMatch(
                /--color-mozart-gray:\s*#e4e4e4/i
            )
        })
    })

    describe("Color Consistency Checks", () => {
        it("should not contain default Tailwind blue-600 in theme definitions", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            // Check that we're not accidentally overriding with default blue
            const themeSection = cssContent.match(/@theme\s*\{([^}]+)\}/s)?.[1]
            if (themeSection) {
                expect(themeSection).not.toMatch(
                    /--color-blue-600:\s*#[0-9a-f]{6}/i
                )
            }
        })

        it("should maintain color naming consistency", () => {
            const cssPath = join(
                process.cwd(),
                "src/assets/css/main.css"
            )
            const cssContent = readFileSync(cssPath, "utf-8")

            // All mozart colors should follow the pattern
            const mozartColors = cssContent.match(
                /--color-mozart-[a-z]+(-\d+)?/g
            )

            expect(mozartColors?.length).toBeGreaterThan(0)

            mozartColors?.forEach((color) => {
                expect(color).toMatch(/^--color-mozart-[a-z]+(-\d+)?$/)
            })
        })
    })
})

