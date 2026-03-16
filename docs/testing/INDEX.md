# Testing Documentation Index

Welcome to the Mozart Frontend Testing Documentation. This directory contains comprehensive guides and references for testing the Mozart frontend application.

## 📚 Documentation Overview

### 🔧 [Testing Framework Documentation](README.md)
Complete guide to the testing framework, including architecture, configuration, and features.

**Contents:**
- Testing Architecture Overview
- Unit Testing with Vitest
- Component Testing Guidelines
- End-to-End Testing with Playwright
- API Mocking with MSW
- Page Object Model Implementation
- Authentication Testing
- Coverage Reports and Thresholds
- Best Practices and Troubleshooting

### 📝 [Contributing Guidelines](CONTRIBUTING.md)
Comprehensive guide for adding new tests to the project.

**Contents:**
- Getting Started with Testing
- When to Use Each Test Type
- Unit, Component, and E2E Test Guidelines
- API Mocking and Test Data Management
- File Organization and Naming Conventions
- Code Quality Guidelines
- Testing Checklist and Troubleshooting

### ⚡ [Quick Reference Guide](QUICK_REFERENCE.md)
Handy reference for common testing commands, patterns, and solutions.

**Contents:**
- Test Command Cheat Sheet
- File Structure Reference
- Testing Pattern Templates
- Common Selectors and Assertions
- API Mocking Examples
- Debugging Techniques
- Performance Tips

## 🛠️ Testing Framework Stack

### Core Technologies
- **[Vitest](https://vitest.dev/)** - Unit and component testing framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
- **[MSW](https://mswjs.io/)** - API mocking for reliable tests
- **[Vue Test Utils](https://vue-test-utils.vuejs.org/)** - Vue.js component testing utilities

### Key Features
- **Parallel Test Execution** - Fast test runs with parallel processing
- **Comprehensive Mocking** - Full Nuxt.js and Pinia store mocking
- **Authentication Testing** - Multiple OAuth flows and session management
- **Coverage Tracking** - 80% coverage thresholds across all metrics
- **CI/CD Integration** - Automated testing in continuous integration

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests
```bash
# Unit and component tests
npm run test

# End-to-end tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

### Writing Your First Test
1. Choose the appropriate test type (unit, component, or E2E)
2. Follow the patterns in the [Contributing Guidelines](CONTRIBUTING.md)
3. Use the [Quick Reference](QUICK_REFERENCE.md) for common patterns
4. Run tests locally before submitting

## 📊 Current Test Coverage

The project maintains high testing standards with:
- **80% minimum coverage** across all metrics
- **Comprehensive E2E scenarios** for critical user journeys
- **Component testing** for UI reliability
- **Unit testing** for business logic validation

## 🔍 Test Structure

```
tests/
├── unit/                    # Unit tests for composables and utilities
├── components/              # Vue component tests
├── e2e/                     # End-to-end test scenarios
│   ├── specs/              # Test specifications
│   ├── page-objects/       # Page Object Model implementations
│   ├── fixtures/           # Test data and MSW handlers
│   └── helpers/            # Test utilities and setup
├── fixtures/               # Test data files
└── setup.ts               # Global test configuration
```

## 📈 Test Categories

### Unit Tests
- **Composables** - Vue composition functions
- **Utilities** - Helper functions and formatters
- **Stores** - Pinia state management
- **Services** - API service layers

### Component Tests
- **UI Components** - Buttons, inputs, modals
- **Feature Components** - Complex UI interactions
- **Layout Components** - Headers, sidebars, navigation

### End-to-End Tests
- **Authentication Flows** - Login, registration, OAuth
- **Core Features** - Document upload, chat, file management
- **Critical Paths** - User onboarding, payment flows
- **Error Scenarios** - Network failures, validation errors

## 🎯 Testing Best Practices

### Quality Guidelines
1. **Write descriptive test names** that explain the scenario
2. **Follow the AAA pattern** (Arrange, Act, Assert)
3. **Test both success and failure cases** for robustness
4. **Use realistic mock data** that mirrors production
5. **Keep tests isolated** and independent

### Performance Optimization
1. **Run tests in parallel** for faster execution
2. **Use efficient selectors** in E2E tests
3. **Mock external dependencies** appropriately
4. **Clean up test state** between tests

### Maintenance
1. **Update tests with code changes** to prevent brittleness
2. **Refactor common patterns** into reusable utilities
3. **Review test coverage** regularly
4. **Document complex testing scenarios**

## 🔧 Configuration Files

### Core Configuration
- `vitest.config.ts` - Vitest configuration for unit/component tests
- `playwright.config.ts` - Playwright configuration for E2E tests
- `tests/setup.ts` - Global test setup and mocking

### Environment Setup
- Environment variables for test configuration
- MSW handlers for API mocking
- Authentication state management
- Test data fixtures

## 📞 Getting Help

### Resources
1. **Documentation** - Start with the [README](README.md) for comprehensive overview
2. **Contributing Guide** - Follow [CONTRIBUTING.md](CONTRIBUTING.md) for adding tests
3. **Quick Reference** - Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for common patterns
4. **Code Examples** - Check existing tests for patterns and best practices

### Troubleshooting
1. **Common Issues** - Check the troubleshooting sections in each guide
2. **Debug Mode** - Use debug flags for step-by-step execution
3. **Trace Viewer** - Use Playwright's trace viewer for E2E debugging
4. **Team Support** - Ask team members for code review and guidance

## 🎉 Contributing

We welcome contributions to improve our testing framework! Please:

1. **Read the contributing guidelines** thoroughly
2. **Follow established patterns** and conventions
3. **Write comprehensive tests** for new features
4. **Update documentation** when adding new testing patterns
5. **Run tests locally** before submitting changes

## 📋 Testing Checklist

Before submitting code changes:

- [ ] Unit tests written for new functions/composables
- [ ] Component tests added for UI changes
- [ ] E2E tests cover critical user journeys
- [ ] All tests pass locally
- [ ] Coverage thresholds are met
- [ ] Mock data is realistic and comprehensive
- [ ] Tests are properly organized and named
- [ ] Documentation updated if needed

---

Happy testing! 🧪 This comprehensive testing framework ensures the Mozart frontend application is reliable, maintainable, and delivers a great user experience. 