# Testing Framework Documentation

## Overview

This project uses a comprehensive testing framework that combines **Vitest** for unit and component testing with **Playwright** for end-to-end testing. The framework is designed to provide fast, reliable, and maintainable tests for the Mozart frontend application.

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Unit Testing with Vitest](#unit-testing-with-vitest)
3. [Component Testing](#component-testing)
4. [End-to-End Testing with Playwright](#end-to-end-testing-with-playwright)
5. [API Mocking with MSW](#api-mocking-with-msw)
6. [Test Configuration](#test-configuration)
7. [Test Data Management](#test-data-management)
8. [Page Object Model](#page-object-model)
9. [Authentication Testing](#authentication-testing)
10. [Running Tests](#running-tests)
11. [Coverage Reports](#coverage-reports)
12. [Best Practices](#best-practices)

## Testing Architecture

The testing framework follows a layered approach:

```
tests/
├── unit/                    # Unit tests for composables and utilities
│   └── composables/
├── components/              # Component tests
├── e2e/                     # End-to-end tests
│   ├── specs/              # Test specifications
│   ├── page-objects/       # Page Object Model implementations
│   ├── fixtures/           # Test fixtures and mock data
│   └── helpers/            # Test utilities and setup
├── setup.ts                # Global test setup
└── types.d.ts             # Type definitions for tests
```

## Unit Testing with Vitest

### Configuration

Unit tests are configured in `vitest.config.ts` with the following key features:

- **Environment**: jsdom for DOM simulation
- **Global APIs**: Vitest globals enabled (`describe`, `it`, `expect`, etc.)
- **Setup Files**: `tests/setup.ts` for environment configuration
- **Path Resolution**: Aliases for `@` and `~` pointing to `src/`
- **Coverage**: V8 provider with comprehensive thresholds

### Key Features

1. **Mock Support**: Comprehensive mocking of Nuxt composables and Pinia stores
2. **Vue Integration**: Full Vue.js support with `@vue/test-utils`
3. **TypeScript**: Full TypeScript support with type checking
4. **Coverage Thresholds**: 80% coverage requirement across all metrics

### Example Unit Test

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import useUser from "../../../src/composables/useUser"

describe("useUser", () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it("should return login function", () => {
        const { login } = useUser()
        expect(typeof login).toBe("function")
    })
})
```

## Component Testing

### Component Test Structure

Component tests use Vue Test Utils with comprehensive mocking:

```typescript
import { describe, it, expect, vi } from "vitest"
import { mount } from "@vue/test-utils"
import SimpleButton from "@/components/common/Button/SimpleButton.vue"

describe("SimpleButton", () => {
    const createWrapper = (props = {}) => {
        return mount(SimpleButton, {
            props: {
                buttonText: "Click Me",
                ...props,
            },
        })
    }

    it("renders button with default props", () => {
        const wrapper = createWrapper()
        expect(wrapper.find("button").exists()).toBe(true)
        expect(wrapper.text()).toContain("Click Me")
    })
})
```

### Key Testing Patterns

1. **Wrapper Factory**: Consistent component mounting with default props
2. **Event Testing**: Testing event emissions and user interactions
3. **CSS Class Testing**: Verifying styling and conditional classes
4. **Props Testing**: Testing component behavior with different props
5. **Accessibility Testing**: Basic accessibility checks

## End-to-End Testing with Playwright

### Configuration

Playwright is configured in `playwright.config.ts` with:

- **Test Directory**: `tests/e2e/specs/`
- **Parallel Execution**: Full parallelism for faster test runs
- **Retry Strategy**: 2 retries on CI, 0 locally
- **Browsers**: Currently configured for Chromium only
- **Base URL**: Configurable via environment variables
- **Global Setup/Teardown**: Custom setup and teardown hooks

### Browser Configuration

```typescript
projects: [
    {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] },
    },
    // Additional browsers commented out for performance
]
```

### Test Features

1. **Video Recording**: On failure retention
2. **Screenshots**: Automatic on failure
3. **Trace Collection**: On retry for debugging
4. **Network Interception**: For API mocking
5. **Authentication State**: Persistent session management

## API Mocking with MSW

### Mock Service Worker Integration

The framework uses MSW (Mock Service Worker) for API mocking:

```typescript
// Handlers for different API endpoints
export const handlers = [
    http.post("http://localhost:3001/api/auth/login", async ({ request }) => {
        const { email, password } = await request.json()
        
        if (email === TEST_USER && password === TEST_PASSWORD) {
            return HttpResponse.json({
                code: 200,
                message: "Login successful",
                data: { accessToken: "mock-jwt-token", user: mockData.user }
            })
        }
        
        return HttpResponse.json({ code: 401, message: "Invalid credentials" }, { status: 401 })
    }),
    // ... more handlers
]
```

### Mock Data Structure

Comprehensive mock data is defined in `tests/e2e/fixtures/mock-data.ts`:

```typescript
export const mockData = {
    user: {
        id: "test-user-id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        // ... complete user object
    },
    documents: { /* ... */ },
    conversations: { /* ... */ },
    // ... more mock data
}
```

## Test Configuration

### Global Test Setup

The `tests/setup.ts` file provides:

1. **Nuxt Composables Mocking**: All Nuxt composables are mocked
2. **Pinia Store Mocking**: All stores are mocked with default values
3. **MSW Server Setup**: Mock server configuration
4. **Vue Test Utils Configuration**: Global component testing setup

### Environment Variables

Tests use environment variables for configuration:

```bash
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password
TEST_USER_USERNAME=Test
CLIENT_URL=http://localhost:3000
```

### Storage State Management

Playwright uses storage state for authentication:

```typescript
// Google authentication state
test.use({ storageState: "storage/google.json" })

// Custom auth state setup
await setupAuthState(page, {
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "basic",
    isAuthenticated: true
})
```

## Page Object Model

### Page Object Structure

E2E tests use the Page Object Model pattern:

```typescript
export class LoginPage {
    readonly page: Page
    readonly emailInput: Locator
    readonly passwordInput: Locator
    readonly loginButton: Locator

    constructor(page: Page) {
        this.page = page
        this.emailInput = page.locator('input[id="email"]')
        this.passwordInput = page.locator('input[id="password"]')
        this.loginButton = page.getByRole("button", { name: "Login" })
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
    }
}
```

### Available Page Objects

1. **LoginPage**: Authentication flow testing
2. **WorkbenchPage**: Main application interface
3. **ComposePage**: Chat and composition interface
4. **RAGCollectionPage**: Document management interface

## Authentication Testing

### Multiple Authentication Methods

The framework supports testing various authentication methods:

1. **Email/Password**: Standard form-based authentication
2. **Google OAuth**: Using stored session state
3. **Apple OAuth**: OAuth flow testing
4. **Session Management**: Persistent authentication state

### Authentication Helpers

```typescript
// Setup authenticated state
await setupAuthState(page, {
    email: "test@example.com",
    role: "admin",
    isAuthenticated: true
})

// Clear authentication
await clearAuthState(page)

// Mock authentication responses
await mockAPIEndpoint(page, "/api/auth/login", {
    code: 200,
    data: { accessToken: "mock-token", user: mockData.user }
})
```

## Running Tests

### Available Test Scripts

```bash
# Unit and component tests
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:ui           # UI mode

# E2E tests
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # UI mode
npm run test:e2e:debug    # Debug mode
npm run test:e2e:report   # View reports

# Run all tests
npm run test:all          # Unit + E2E
```

### Test Execution Environment

1. **Development**: Tests run against local development server
2. **CI/CD**: Tests run with specific retry and worker configurations
3. **Parallel Execution**: Multiple test files run simultaneously
4. **Isolation**: Each test runs in isolation with fresh state

## Coverage Reports

### Coverage Configuration

```typescript
coverage: {
    provider: "v8",
    reporter: ["text", "json", "html"],
    thresholds: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    exclude: [
        "node_modules/",
        "tests/",
        "dist/",
        ".output/",
        ".nuxt/",
        "**/*.d.ts"
    ]
}
```

### Coverage Reports

- **Text**: Console output during test runs
- **JSON**: Machine-readable coverage data
- **HTML**: Interactive coverage report in browser

## Best Practices

### Test Organization

1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Follow AAA pattern
3. **Single Responsibility**: One assertion per test when possible
4. **Test Isolation**: Each test should be independent

### Mock Strategy

1. **Minimal Mocking**: Mock only what's necessary
2. **Realistic Data**: Use realistic mock data
3. **Consistent State**: Maintain consistent mock state
4. **Cleanup**: Clear mocks between tests

### Performance Optimization

1. **Parallel Execution**: Run tests in parallel when possible
2. **Efficient Selectors**: Use efficient CSS selectors
3. **Minimal Waits**: Avoid unnecessary waits
4. **Resource Management**: Clean up resources after tests

### Debugging

1. **Debug Mode**: Use `--debug` flag for step-by-step execution
2. **Screenshots**: Automatic screenshots on failure
3. **Video Recording**: Record test execution for failure analysis
4. **Trace Viewer**: Use Playwright's trace viewer for debugging

## Troubleshooting

### Common Issues

1. **Timeout Issues**: Increase timeout values for slow operations
2. **Element Not Found**: Use proper wait strategies
3. **Authentication Failures**: Verify storage state files
4. **Network Errors**: Check MSW handler configuration

### Debug Commands

```bash
# Debug specific test
npx playwright test --debug login.spec.ts

# Run with headed browser
npx playwright test --headed

# Generate trace
npx playwright test --trace on
```

This comprehensive testing framework ensures reliability, maintainability, and fast feedback cycles for the Mozart frontend application. 