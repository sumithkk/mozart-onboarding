# Testing Quick Reference

A quick reference guide for testing commands, patterns, and common scenarios in the Mozart frontend project.

## Test Commands

### Unit & Component Tests (Vitest)
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test -- button.test.ts

# Run tests matching pattern
npm run test -- --grep "login"
```

### End-to-End Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test login.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests with trace
npx playwright test --trace on
```

### Combined Testing
```bash
# Run all tests (unit + E2E)
npm run test:all
```

## File Structure Quick Reference

```
tests/
├── unit/                     # Unit tests (*.test.ts)
│   ├── composables/
│   ├── utilities/
│   └── stores/
├── components/               # Component tests (*.test.ts)
│   ├── common/
│   ├── ui/
│   └── layout/
├── e2e/                      # End-to-end tests (*.spec.ts)
│   ├── specs/
│   │   ├── auth/
│   │   ├── features/
│   │   └── critical-paths/
│   ├── page-objects/
│   ├── fixtures/
│   └── helpers/
├── fixtures/                 # Test data files
│   ├── documents/
│   ├── images/
│   └── data/
└── setup.ts                 # Global test setup
```

## Testing Patterns

### Unit Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"

describe("ComponentName", () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    describe("functionName", () => {
        it("should do something when condition is met", () => {
            // Arrange
            const input = "test input"
            
            // Act
            const result = functionToTest(input)
            
            // Assert
            expect(result).toBe("expected output")
        })
    })
})
```

### Component Test Template
```typescript
import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Component from "@/components/Component.vue"

describe("Component", () => {
    const createWrapper = (props = {}) => {
        return mount(Component, {
            props: {
                defaultProp: "default value",
                ...props,
            },
        })
    }

    it("renders correctly", () => {
        const wrapper = createWrapper()
        expect(wrapper.exists()).toBe(true)
    })

    it("emits event when action occurs", async () => {
        const wrapper = createWrapper()
        await wrapper.find("button").trigger("click")
        expect(wrapper.emitted("eventName")).toBeTruthy()
    })
})
```

### E2E Test Template
```typescript
import { test, expect } from "@playwright/test"
import { PageObjectName } from "../page-objects/PageObjectName"
import { setupTestEnvironment } from "../helpers/setup-msw"

test.describe("Feature Name", () => {
    test.beforeEach(async ({ page }) => {
        await setupTestEnvironment(page, { 
            enableAuth: true,
            enableMSW: true
        })
    })

    test("should perform action successfully", async ({ page }) => {
        const pageObject = new PageObjectName(page)
        
        await pageObject.goto()
        await pageObject.performAction()
        
        await expect(pageObject.successMessage).toBeVisible()
    })
})
```

### Page Object Template
```typescript
import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class PageObjectName {
    readonly page: Page
    readonly element: Locator
    readonly button: Locator

    constructor(page: Page) {
        this.page = page
        this.element = page.locator('[data-testid="element"]')
        this.button = page.getByRole("button", { name: "Button Text" })
    }

    async goto() {
        await this.page.goto("/page-url")
        await this.page.waitForLoadState("networkidle")
    }

    async performAction() {
        await this.button.click()
    }

    async expectToBeVisible() {
        await expect(this.element).toBeVisible()
    }
}
```

## Common Selectors

### Playwright Selectors
```typescript
// By role
page.getByRole("button", { name: "Submit" })
page.getByRole("textbox", { name: "Email" })

// By test ID
page.locator('[data-testid="login-form"]')

// By text
page.getByText("Welcome")
page.locator('text="Exact text"')

// By CSS selector
page.locator('.class-name')
page.locator('#element-id')

// By attribute
page.locator('[aria-label="Close"]')
```

### Vue Test Utils Selectors
```typescript
// Find by element
wrapper.find("button")
wrapper.find(".class-name")

// Find by component
wrapper.findComponent(ChildComponent)

// Find by attribute
wrapper.find('[data-testid="element"]')

// Find by text
wrapper.find('text="Button Text"')
```

## API Mocking

### MSW Handler Template
```typescript
import { http, HttpResponse } from "msw"

export const handlers = [
    http.get("/api/endpoint", () => {
        return HttpResponse.json({
            code: 200,
            data: { message: "Success" }
        })
    }),

    http.post("/api/endpoint", async ({ request }) => {
        const data = await request.json()
        return HttpResponse.json({
            code: 201,
            data: { id: "new-id", ...data }
        })
    }),

    // Error response
    http.get("/api/error", () => {
        return HttpResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        )
    })
]
```

### Page Route Mocking
```typescript
// Mock API response
await page.route("**/api/endpoint", route => {
    route.fulfill({
        status: 200,
        body: JSON.stringify({ data: "mock data" })
    })
})

// Mock with delay
await page.route("**/api/slow-endpoint", async route => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    route.continue()
})
```

## Environment Variables

### Test Configuration
```bash
# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_USER_USERNAME=TestUser

# API URLs
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:3001
RAG_SERVICE_URL=http://localhost:3002

# Test environment
NODE_ENV=test
```

## Authentication Setup

### Setup Auth State
```typescript
await setupAuthState(page, {
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "admin",
    isAuthenticated: true
})
```

### Clear Auth State
```typescript
await clearAuthState(page)
```

### Google OAuth Storage
```typescript
test.use({ storageState: "storage/google.json" })
```

## Debugging

### Console Logging
```typescript
// In unit tests
console.log("Debug info:", debugData)

// In E2E tests
await page.evaluate(() => console.log("Browser console"))
```

### Screenshots
```typescript
// Take screenshot
await page.screenshot({ path: "debug-screenshot.png" })

// Screenshot on failure (automatic in config)
screenshot: "only-on-failure"
```

### Video Recording
```typescript
// Record video (automatic in config)
video: "retain-on-failure"
```

### Step-by-step Debugging
```bash
# Debug specific test
npx playwright test --debug test-name.spec.ts

# Debug with headed browser
npx playwright test --headed --debug
```

## Coverage Thresholds

Current coverage requirements:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Common Assertions

### Unit/Component Tests
```typescript
// Basic assertions
expect(value).toBe(expected)
expect(value).toEqual(expected)
expect(value).toBeTruthy()
expect(value).toBeFalsy()

// Array/Object assertions
expect(array).toContain(item)
expect(object).toHaveProperty("key")
expect(array).toHaveLength(3)

// Function assertions
expect(mockFunction).toHaveBeenCalled()
expect(mockFunction).toHaveBeenCalledWith(arg1, arg2)
expect(mockFunction).toHaveBeenCalledTimes(2)

// Vue Test Utils assertions
expect(wrapper.exists()).toBe(true)
expect(wrapper.text()).toContain("expected text")
expect(wrapper.classes()).toContain("class-name")
expect(wrapper.emitted("eventName")).toBeTruthy()
```

### E2E Tests
```typescript
// Visibility assertions
await expect(page.locator("selector")).toBeVisible()
await expect(page.locator("selector")).toBeHidden()

// Text assertions
await expect(page.locator("selector")).toContainText("text")
await expect(page.locator("selector")).toHaveText("exact text")

// Attribute assertions
await expect(page.locator("selector")).toHaveAttribute("attr", "value")
await expect(page.locator("selector")).toHaveClass("class-name")

// URL assertions
await expect(page).toHaveURL("/expected-url")
await expect(page).toHaveTitle("Expected Title")

// Count assertions
await expect(page.locator("selector")).toHaveCount(3)
```

## Performance Tips

### Parallel Execution
```typescript
// Run tests in parallel (default)
test.describe.configure({ mode: "parallel" })

// Run tests serially
test.describe.configure({ mode: "serial" })
```

### Test Isolation
```typescript
// Use test.beforeEach for setup
test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page)
})

// Clean up after tests
test.afterEach(async ({ page }) => {
    await clearTestState(page)
})
```

### Efficient Waits
```typescript
// Wait for specific condition
await page.waitForSelector('[data-testid="loaded"]')

// Wait for network idle
await page.waitForLoadState("networkidle")

// Wait for function to return truthy
await page.waitForFunction(() => window.dataLoaded)
```

## Troubleshooting

### Common Issues

#### Test Timeout
```typescript
// Increase timeout
test.setTimeout(60000)

// Or in config
timeout: 30000
```

#### Element Not Found
```typescript
// Wait for element
await page.waitForSelector('selector', { timeout: 10000 })

// Use retry assertion
await expect(page.locator('selector')).toBeVisible({ timeout: 10000 })
```

#### Flaky Tests
```typescript
// Use toPass for retry
await expect(async () => {
    await expect(page.locator('selector')).toBeVisible()
}).toPass({ timeout: 10000 })
```

#### Mock Not Working
```typescript
// Ensure mock is setup before navigation
await page.route('**/api/**', mockHandler)
await page.goto('/page')
```

This quick reference should help you write tests efficiently and debug issues quickly! 