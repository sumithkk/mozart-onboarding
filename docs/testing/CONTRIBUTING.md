# Contributing to Testing

This guide provides comprehensive instructions for adding tests to the Mozart frontend project. Follow these guidelines to ensure your tests are maintainable, reliable, and consistent with the existing codebase.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Test Types and When to Use Them](#test-types-and-when-to-use-them)
3. [Unit Testing Guidelines](#unit-testing-guidelines)
4. [Component Testing Guidelines](#component-testing-guidelines)
5. [End-to-End Testing Guidelines](#end-to-end-testing-guidelines)
6. [API Mocking Guidelines](#api-mocking-guidelines)
7. [Test Data Management](#test-data-management)
8. [File Naming and Organization](#file-naming-and-organization)
9. [Writing Quality Tests](#writing-quality-tests)
10. [Common Patterns and Examples](#common-patterns-and-examples)
11. [Testing Checklist](#testing-checklist)
12. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before writing tests, ensure you have:

1. **Node.js** (version specified in `.nvmrc`)
2. **Dependencies installed**: `npm install`
3. **Development server running**: `npm run dev` (for E2E tests)
4. **Environment variables configured** (see `.env.example`)

### Setting Up Test Environment

1. **Install test dependencies**:
   ```bash
   npm install
   ```

2. **Run tests to verify setup**:
   ```bash
   npm run test          # Unit tests
   npm run test:e2e      # E2E tests
   ```

3. **Install Playwright browsers** (if not already done):
   ```bash
   npx playwright install
   ```

## Test Types and When to Use Them

### Unit Tests
**Use for:**
- Testing individual functions and composables
- Testing utility functions
- Testing business logic in isolation
- Testing Pinia store actions and getters

**Don't use for:**
- Testing component rendering (use component tests)
- Testing user interactions (use E2E tests)
- Testing API integrations (use component/E2E tests)

### Component Tests
**Use for:**
- Testing Vue component behavior
- Testing component props and events
- Testing conditional rendering
- Testing component styling and classes

**Don't use for:**
- Testing complex user workflows (use E2E tests)
- Testing server-side functionality
- Testing cross-component interactions

### End-to-End Tests
**Use for:**
- Testing complete user workflows
- Testing authentication flows
- Testing cross-page navigation
- Testing real API integrations
- Testing critical business processes

**Don't use for:**
- Testing individual functions (use unit tests)
- Testing component props (use component tests)
- Testing every possible UI state

## Unit Testing Guidelines

### File Structure

Create unit tests in the `tests/unit/` directory:

```
tests/unit/
├── composables/
│   ├── useAuth.test.ts
│   ├── useUser.test.ts
│   └── useFileSystem.test.ts
├── utilities/
│   ├── formatters.test.ts
│   └── validators.test.ts
└── stores/
    ├── auth.test.ts
    └── user.test.ts
```

### Example Unit Test

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import useAuth from "../../../src/composables/useAuth"

describe("useAuth", () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    describe("login", () => {
        it("should call login API with correct credentials", async () => {
            const { login } = useAuth()
            const mockCredentials = {
                email: "test@example.com",
                password: "password123"
            }

            await login(mockCredentials)

            // Assert the API was called with correct data
            expect(mockApiCall).toHaveBeenCalledWith(
                "/api/auth/login",
                mockCredentials
            )
        })

        it("should handle login errors gracefully", async () => {
            const { login } = useAuth()
            // Mock API to throw error
            vi.mocked(mockApiCall).mockRejectedValueOnce(new Error("Invalid credentials"))

            await expect(login({ email: "test@example.com", password: "wrong" }))
                .rejects.toThrow("Invalid credentials")
        })
    })
})
```

### Unit Test Best Practices

1. **Test one thing at a time**
2. **Use descriptive test names**
3. **Mock external dependencies**
4. **Test both success and error cases**
5. **Use `beforeEach` for setup**
6. **Clean up mocks after each test**

## Component Testing Guidelines

### File Structure

Create component tests in the `tests/components/` directory:

```
tests/components/
├── common/
│   ├── Button.test.ts
│   ├── Input.test.ts
│   └── Modal.test.ts
├── ui/
│   ├── FileExplorer.test.ts
│   └── Chat.test.ts
└── layout/
    ├── Header.test.ts
    └── Sidebar.test.ts
```

### Example Component Test

```typescript
import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Button from "@/components/common/Button.vue"

describe("Button", () => {
    const createWrapper = (props = {}) => {
        return mount(Button, {
            props: {
                text: "Click me",
                variant: "primary",
                ...props,
            },
        })
    }

    describe("Rendering", () => {
        it("renders with correct text", () => {
            const wrapper = createWrapper({ text: "Custom Text" })
            expect(wrapper.text()).toContain("Custom Text")
        })

        it("applies variant classes correctly", () => {
            const wrapper = createWrapper({ variant: "secondary" })
            expect(wrapper.classes()).toContain("btn-secondary")
        })
    })

    describe("Interaction", () => {
        it("emits click event when clicked", async () => {
            const wrapper = createWrapper()
            await wrapper.find("button").trigger("click")
            expect(wrapper.emitted("click")).toBeTruthy()
        })

        it("does not emit click when disabled", async () => {
            const wrapper = createWrapper({ disabled: true })
            await wrapper.find("button").trigger("click")
            expect(wrapper.emitted("click")).toBeFalsy()
        })
    })

    describe("Accessibility", () => {
        it("has proper ARIA attributes", () => {
            const wrapper = createWrapper({ loading: true })
            expect(wrapper.attributes("aria-busy")).toBe("true")
        })
    })
})
```

### Component Test Best Practices

1. **Use wrapper factory pattern**
2. **Test props, events, and slots**
3. **Test conditional rendering**
4. **Test CSS classes and styling**
5. **Test accessibility attributes**
6. **Mock child components when necessary**

## End-to-End Testing Guidelines

### File Structure

Create E2E tests in the `tests/e2e/specs/` directory:

```
tests/e2e/specs/
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── oauth.spec.ts
├── features/
│   ├── file-management.spec.ts
│   ├── chat.spec.ts
│   └── document-upload.spec.ts
└── critical-paths/
    ├── user-onboarding.spec.ts
    └── payment-flow.spec.ts
```

### Creating Page Objects

Always create page objects for reusable functionality:

```typescript
// tests/e2e/page-objects/DocumentUploadPage.ts
import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class DocumentUploadPage {
    readonly page: Page
    readonly uploadButton: Locator
    readonly fileInput: Locator
    readonly progressBar: Locator
    readonly successMessage: Locator

    constructor(page: Page) {
        this.page = page
        this.uploadButton = page.getByRole("button", { name: "Upload Document" })
        this.fileInput = page.locator('input[type="file"]')
        this.progressBar = page.locator('[data-testid="upload-progress"]')
        this.successMessage = page.locator('[data-testid="success-message"]')
    }

    async goto() {
        await this.page.goto("/documents/upload")
        await this.page.waitForLoadState("networkidle")
    }

    async uploadFile(filePath: string) {
        await this.fileInput.setInputFiles(filePath)
        await this.uploadButton.click()
    }

    async waitForUploadComplete() {
        await expect(this.progressBar).toHaveAttribute("aria-valuenow", "100")
        await expect(this.successMessage).toBeVisible()
    }
}
```

### Example E2E Test

```typescript
import { test, expect } from "@playwright/test"
import { DocumentUploadPage } from "../page-objects/DocumentUploadPage"
import { setupTestEnvironment } from "../helpers/setup-msw"

test.describe("Document Upload", () => {
    test.beforeEach(async ({ page }) => {
        await setupTestEnvironment(page, { 
            enableAuth: true,
            enableMSW: true
        })
    })

    test("should upload document successfully", async ({ page }) => {
        const uploadPage = new DocumentUploadPage(page)
        
        await uploadPage.goto()
        await uploadPage.uploadFile("tests/fixtures/test-document.pdf")
        await uploadPage.waitForUploadComplete()
        
        await expect(page.locator('[data-testid="document-list"]'))
            .toContainText("test-document.pdf")
    })

    test("should handle upload errors gracefully", async ({ page }) => {
        const uploadPage = new DocumentUploadPage(page)
        
        // Mock API to return error
        await page.route("**/api/documents/upload", route => {
            route.fulfill({
                status: 400,
                body: JSON.stringify({ error: "File too large" })
            })
        })
        
        await uploadPage.goto()
        await uploadPage.uploadFile("tests/fixtures/large-document.pdf")
        
        await expect(page.locator('[data-testid="error-message"]'))
            .toContainText("File too large")
    })
})
```

### E2E Test Best Practices

1. **Use Page Object Model**
2. **Test critical user journeys**
3. **Mock external APIs**
4. **Use proper wait strategies**
5. **Test error scenarios**
6. **Keep tests independent**

## API Mocking Guidelines

### Adding New API Handlers

Add new handlers in `tests/e2e/fixtures/handlers.ts`:

```typescript
import { http, HttpResponse } from "msw"
import { mockData } from "./mock-data"

export const handlers = [
    // New handler example
    http.post("http://localhost:3001/api/documents/upload", async ({ request }) => {
        const formData = await request.formData()
        const file = formData.get("file") as File
        
        if (!file) {
            return HttpResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return HttpResponse.json(
                { error: "File too large" },
                { status: 400 }
            )
        }
        
        return HttpResponse.json({
            code: 200,
            message: "Document uploaded successfully",
            data: {
                id: "new-doc-id",
                name: file.name,
                size: file.size,
                status: "uploaded"
            }
        })
    }),
    
    // ... existing handlers
]
```

### Adding Mock Data

Add corresponding mock data in `tests/e2e/fixtures/mock-data.ts`:

```typescript
export const mockData = {
    // New mock data
    uploadedDocument: {
        id: "new-doc-id",
        name: "test-document.pdf",
        size: 1024000,
        type: "application/pdf",
        status: "uploaded",
        createdAt: Date.now(),
        uploadedBy: "test-user-id"
    },
    
    // ... existing mock data
}
```

### Mock Data Best Practices

1. **Use realistic data**
2. **Match production data structure**
3. **Include edge cases**
4. **Use consistent IDs**
5. **Include timestamps**

## Test Data Management

### Creating Test Fixtures

Create test files in `tests/fixtures/`:

```
tests/fixtures/
├── documents/
│   ├── test-document.pdf
│   ├── large-document.pdf
│   └── invalid-document.txt
├── images/
│   ├── avatar.jpg
│   └── logo.png
└── data/
    ├── users.json
    └── organizations.json
```

### Using Test Data

```typescript
import { test, expect } from "@playwright/test"
import path from "path"

test("should upload PDF document", async ({ page }) => {
    const filePath = path.join(__dirname, "../fixtures/documents/test-document.pdf")
    
    await page.setInputFiles('input[type="file"]', filePath)
    // ... rest of test
})
```

## File Naming and Organization

### Naming Conventions

1. **Test files**: `*.test.ts` for unit/component tests, `*.spec.ts` for E2E tests
2. **Page objects**: `*Page.ts` (e.g., `LoginPage.ts`)
3. **Helper functions**: `*Helper.ts` or `*Utils.ts`
4. **Mock data**: `mock-*.ts` or `*-mock.ts`

### Directory Structure

```
tests/
├── unit/                     # Unit tests
│   ├── composables/
│   ├── utilities/
│   └── stores/
├── components/               # Component tests
│   ├── common/
│   ├── ui/
│   └── layout/
├── e2e/                      # End-to-end tests
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
└── shared/                   # Shared test utilities
    ├── factories/
    ├── helpers/
    └── matchers/
```

## Writing Quality Tests

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
test("should update user profile", async ({ page }) => {
    // Arrange
    const profilePage = new ProfilePage(page)
    await profilePage.goto()
    const newUserData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com"
    }
    
    // Act
    await profilePage.updateProfile(newUserData)
    
    // Assert
    await expect(profilePage.successMessage).toBeVisible()
    await expect(profilePage.firstName).toHaveValue(newUserData.firstName)
})
```

### Test Naming

Use descriptive names that explain the scenario:

```typescript
// Good
test("should display error message when login fails with invalid credentials")
test("should redirect to dashboard after successful login")
test("should disable submit button when form is invalid")

// Bad
test("login test")
test("button test")
test("form validation")
```

### Assertions

Use specific assertions:

```typescript
// Good
await expect(page.locator('[data-testid="error-message"]'))
    .toContainText("Invalid email format")

// Bad
await expect(page.locator('[data-testid="error-message"]'))
    .toBeVisible()
```

## Common Patterns and Examples

### Testing Form Validation

```typescript
test("should validate required fields", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    
    // Submit empty form
    await loginPage.submitButton.click()
    
    // Check validation messages
    await expect(loginPage.emailError).toContainText("Email is required")
    await expect(loginPage.passwordError).toContainText("Password is required")
})
```

### Testing API Error Handling

```typescript
test("should handle server errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/auth/login", route => {
        route.fulfill({
            status: 500,
            body: JSON.stringify({ error: "Internal server error" })
        })
    })
    
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login("test@example.com", "password")
    
    await expect(loginPage.errorMessage)
        .toContainText("Something went wrong. Please try again.")
})
```

### Testing Loading States

```typescript
test("should show loading state during API call", async ({ page }) => {
    // Delay API response
    await page.route("**/api/auth/login", async route => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        route.continue()
    })
    
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login("test@example.com", "password")
    
    // Check loading state
    await expect(loginPage.loadingSpinner).toBeVisible()
    await expect(loginPage.submitButton).toBeDisabled()
})
```

### Testing Navigation

```typescript
test("should navigate to correct page after login", async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login("test@example.com", "password")
    
    // Wait for navigation
    await page.waitForURL("**/dashboard")
    
    // Verify we're on the correct page
    expect(page.url()).toContain("/dashboard")
    await expect(page.locator('h1')).toContainText("Dashboard")
})
```

## Testing Checklist

Before submitting your tests, ensure:

### Unit Tests
- [ ] Test covers the main functionality
- [ ] Test includes error cases
- [ ] External dependencies are mocked
- [ ] Test is isolated and independent
- [ ] Test has descriptive name
- [ ] Test follows AAA pattern

### Component Tests
- [ ] Component renders correctly
- [ ] Props are tested
- [ ] Events are tested
- [ ] Conditional rendering is tested
- [ ] CSS classes are tested
- [ ] Accessibility attributes are tested

### E2E Tests
- [ ] Uses Page Object Model
- [ ] Tests critical user journey
- [ ] Includes error scenarios
- [ ] Uses proper wait strategies
- [ ] Mock data is realistic
- [ ] Test is stable and not flaky

### General
- [ ] Test files are in correct directories
- [ ] Naming conventions are followed
- [ ] Tests run successfully
- [ ] Tests are independent
- [ ] Test coverage is adequate

## Troubleshooting

### Common Issues and Solutions

#### Test Timeouts
```typescript
// Increase timeout for slow operations
test("slow operation", async ({ page }) => {
    test.setTimeout(60000) // 60 seconds
    // ... test code
})
```

#### Element Not Found
```typescript
// Wait for element to be visible
await expect(page.locator('[data-testid="loading"]')).toBeVisible()
await expect(page.locator('[data-testid="loading"]')).toBeHidden()
```

#### Flaky Tests
```typescript
// Use retry assertion
await expect(async () => {
    await expect(page.locator('[data-testid="result"]')).toBeVisible()
}).toPass({ timeout: 10000 })
```

#### Mock Not Working
```typescript
// Ensure mock is setup before navigation
await page.route("**/api/**", route => {
    // Mock logic
})
await page.goto("/page")
```

### Debug Commands

```bash
# Run specific test
npm run test -- login.test.ts

# Run tests in watch mode
npm run test:watch

# Run E2E tests with UI
npm run test:e2e:ui

# Debug specific E2E test
npx playwright test --debug login.spec.ts

# Generate coverage report
npm run test:coverage
```

### Getting Help

1. Check existing tests for similar patterns
2. Read the main testing documentation
3. Run tests locally to debug issues
4. Use Playwright's trace viewer for E2E debugging
5. Ask team members for code review

## Conclusion

Following these guidelines will help you write maintainable, reliable tests that contribute to the overall quality of the Mozart frontend application. Remember to:

1. **Choose the right type of test** for what you're testing
2. **Follow established patterns** and conventions
3. **Write clear, descriptive tests** that are easy to understand
4. **Test both success and failure scenarios**
5. **Keep tests independent** and maintainable

Happy testing! 🧪 