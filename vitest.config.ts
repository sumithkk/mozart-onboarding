import { defineConfig } from "vitest/config"
import { fileURLToPath, URL } from "node:url"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.includes("-"),
                },
            },
        }),
    ],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/unit/**/*.test.ts", "tests/components/**/*.test.ts"],
        exclude: ["tests/e2e/**"],
        typecheck: {
            tsconfig: "./tsconfig.json",
            include: ["tests/**/*.test.ts"],
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: ["node_modules/", "tests/", "dist/", ".output/", ".nuxt/", "nuxt.config.ts", "vitest.config.ts", "playwright.config.ts", "tailwind.config.js", "postcss.config.js", "firebase.*.json", "types/", "src/assets/", "src/public/", "src/plugins/", "src/data/", "src/middleware/", "src/util/staticData.ts", "src/util/eventBus.ts", "**/*.d.ts"],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "~": fileURLToPath(new URL("./src", import.meta.url)),
        },
        extensions: [".ts", ".js", ".vue", ".json"],
    },
    define: {
        // Mock Nuxt composables and utilities
        "process.env": {},
    },
    esbuild: {
        target: "esnext",
    },
})
