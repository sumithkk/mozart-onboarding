import { describe, it, expect, beforeAll } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

/**
 * Unit tests for Mozart brand color theme
 * Ensures color definitions remain intact and match brand guidelines
 */
describe("Mozart Brand Color Theme", () => {
    let cssContent: string

    beforeAll(() => {
        const cssPath = join(
            process.cwd(),
            "src/assets/css/main.css"
        )
        cssContent = readFileSync(cssPath, "utf-8")
    })

    describe("CSS Color Variables", () => {
        it("should define mozart-blue primary color (#2844A4)", () => {
            expect(cssContent).toContain("--color-mozart-blue: #2844a4")
        })

        it("should define mozart-white (#F6F6F6)", () => {
            expect(cssContent).toContain("--color-mozart-white: #f6f6f6")
        })

        it("should define mozart-gray (#E4E4E4)", () => {
            expect(cssContent).toContain("--color-mozart-gray: #e4e4e4")
        })

        it("should define all mozart-blue shade variants", () => {
            const expectedShades = [
                "--color-mozart-blue-50",
                "--color-mozart-blue-100",
                "--color-mozart-blue-200",
                "--color-mozart-blue-300",
                "--color-mozart-blue-400",
                "--color-mozart-blue-500",
                "--color-mozart-blue-600",
                "--color-mozart-blue-700",
                "--color-mozart-blue-800",
                "--color-mozart-blue-900",
            ]

            expectedShades.forEach((shade) => {
                expect(cssContent).toContain(shade)
            })
        })

        it("should define mozart-blue-600 as primary brand color", () => {
            expect(cssContent).toMatch(
                /--color-mozart-blue-600:\s*#2844a4/i
            )
        })

        it("should define mozart-blue-700 as darker hover state", () => {
            expect(cssContent).toMatch(
                /--color-mozart-blue-700:\s*#1e3594/i
            )
        })

        it("should define mozart-blue-800 for gradients", () => {
            expect(cssContent).toMatch(
                /--color-mozart-blue-800:\s*#1a2a7a/i
            )
        })

        it("should define mozart-blue-900 for darkest shade", () => {
            expect(cssContent).toMatch(
                /--color-mozart-blue-900:\s*#151f60/i
            )
        })

        it("should define logoColor as mozart-blue", () => {
            expect(cssContent).toMatch(/--logoColor:\s*#2844a4/i)
        })
    })

    describe("Color Values Integrity", () => {
        it("should use correct hex values for brand colors", () => {
            const colorValues = {
                "--color-mozart-blue": "#2844a4",
                "--color-mozart-white": "#f6f6f6",
                "--color-mozart-gray": "#e4e4e4",
                "--color-mozart-blue-600": "#2844a4",
                "--color-mozart-blue-700": "#1e3594",
                "--color-mozart-blue-800": "#1a2a7a",
                "--color-mozart-blue-900": "#151f60",
            }

            Object.entries(colorValues).forEach(([variable, value]) => {
                const regex = new RegExp(
                    `${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*${value.replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    )}`,
                    "i"
                )
                expect(cssContent).toMatch(regex)
            })
        })

        it("should define rgba values for opacity variants", () => {
            expect(cssContent).toContain("--color-mozart-blue-50: rgba(40, 68, 164, 0.05)")
            expect(cssContent).toContain("--color-mozart-blue-100: rgba(40, 68, 164, 0.1)")
            expect(cssContent).toContain("--color-mozart-blue-200: rgba(40, 68, 164, 0.2)")
            expect(cssContent).toContain("--color-mozart-blue-300: rgba(40, 68, 164, 0.3)")
            expect(cssContent).toContain("--color-mozart-blue-400: rgba(40, 68, 164, 0.4)")
            expect(cssContent).toContain("--color-mozart-blue-500: rgba(40, 68, 164, 0.5)")
        })
    })

    describe("Tailwind Integration", () => {
        it("should define colors in @theme block", () => {
            expect(cssContent).toContain("@theme")
            expect(cssContent).toContain("--color-mozart-blue")
        })

        it("should not contain default Tailwind blue-600 in theme", () => {
            // Should not have default blue-600 overriding mozart-blue
            // Note: This checks that we're not accidentally using defaults
            const blue600Matches = cssContent.match(/blue-600/g)
            // Allow for comments or references, but not theme definitions
            if (blue600Matches) {
                blue600Matches.forEach((match) => {
                    const context = cssContent.substring(
                        cssContent.indexOf(match) - 50,
                        cssContent.indexOf(match) + 50
                    )
                    // Should not be in a theme definition
                    expect(context).not.toMatch(
                        /--color-blue-600:\s*#[0-9a-f]{6}/i
                    )
                })
            }
        })
    })

    describe("CSS Variable Consistency", () => {
        it("should maintain consistent naming convention", () => {
            const mozartColorVars = cssContent.match(
                /--color-mozart-blue(-\d+)?/g
            )
            expect(mozartColorVars?.length).toBeGreaterThan(0)

            mozartColorVars?.forEach((varName) => {
                expect(varName).toMatch(/^--color-mozart-blue(-\d+)?$/)
            })
        })
    })
})

