# Color Theme Test Suite

This test suite ensures the Mozart brand color palette remains intact and correctly implemented across the application.

## Test Files

### 1. `tests/unit/colors/theme-colors.test.ts`
Tests the CSS color variable definitions in `main.css`:
- Verifies Mozart brand colors are correctly defined (#2844A4, #F6F6F6, #E4E4E4)
- Validates all color shade variants (50-900)
- Ensures color values match brand guidelines
- Checks Tailwind integration in @theme block

### 2. `tests/unit/colors/component-colors.test.ts`
Tests component-level color usage:
- Prevents usage of default Tailwind blue colors (blue-600, blue-700, etc.)
- Verifies key components use Mozart brand colors
- Validates color pattern consistency
- Ensures Tailwind utility classes are used instead of arbitrary values

### 3. `tests/components/ui/color-theme.test.ts`
Component-level color theme validation:
- Tests CSS variable accessibility
- Validates brand color values
- Ensures color consistency

## Running Tests

```bash
# Run all color theme tests
npm run test tests/unit/colors

# Run specific test file
npm run test tests/unit/colors/theme-colors.test.ts

# Run tests in watch mode
npm run test:watch tests/unit/colors

# Run tests with coverage
npm run test:coverage tests/unit/colors
```

## What These Tests Ensure

1. **Brand Compliance**: All colors match the official Mozart brand palette
2. **No Regressions**: Prevents accidental use of default Tailwind colors
3. **Consistency**: Ensures consistent color usage across components
4. **Maintainability**: Catches color-related issues early in development

## Brand Colors

- **Mozart Blue**: `#2844A4` (primary brand color)
- **Mozart White**: `#F6F6F6` (backgrounds)
- **Mozart Gray**: `#E4E4E4` (borders)

## Common Violations

The tests will fail if you use:
- `bg-blue-600` → Use `bg-mozart-blue` instead
- `text-blue-600` → Use `text-mozart-blue` instead
- `border-blue-600` → Use `border-mozart-blue` instead
- `hover:bg-blue-700` → Use `hover:bg-mozart-blue-700` instead
- `focus:ring-blue-500` → Use `focus:ring-mozart-blue-500` instead
- Arbitrary values like `border-t-[#2844a4]` → Use `border-t-mozart-blue` instead

## CI/CD Integration

These tests should be run in your CI/CD pipeline to prevent color-related regressions:

```yaml
# Example GitHub Actions workflow
- name: Run color theme tests
  run: npm run test tests/unit/colors
```

## Adding New Tests

When adding new color-related features:
1. Add tests to verify the colors are correctly defined
2. Add component tests to ensure proper usage
3. Update this README if needed

