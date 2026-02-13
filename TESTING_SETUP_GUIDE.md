# Testing Setup Guide for Fleet Management

## Quick Start

Follow these steps to set up and run the test suite for the Fleet Management module.

---

## 1. Install Testing Dependencies

Run the following command to install all required testing packages:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

---

## 2. Update package.json Scripts

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:trucks": "jest trucks"
  }
}
```

---

## 3. Verify File Structure

Ensure the following files were created:

```
danube-logistics/
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup file
├── TEST_DOCUMENTATION.md       # Test case documentation
├── TESTING_SETUP_GUIDE.md      # This file
└── src/
    └── app/
        ├── trucks/
        │   └── __tests__/
        │       └── page.test.tsx      # Component tests (25 test cases)
        └── api/
            └── trucks/
                └── __tests__/
                    └── route.test.ts   # API tests (20 test cases)
```

---

## 4. Run Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode (for development):
```bash
npm run test:watch
```

### Run tests with coverage report:
```bash
npm run test:coverage
```

### Run only Fleet Management tests:
```bash
npm run test:trucks
```

---

## 5. Expected Output

When you run `npm test`, you should see output similar to:

```
PASS  src/app/trucks/__tests__/page.test.tsx
  Fleet Management - Trucks Page
    Page Rendering
      ✓ TC001: Should render the page title and header correctly (45ms)
      ✓ TC002: Should display Home button (12ms)
      ✓ TC003: Should display "Add New Truck" button (8ms)
    Truck List Display
      ✓ TC004: Should display empty state when no trucks exist (15ms)
      ✓ TC005: Should display list of trucks when data exists (22ms)
      ...

PASS  src/app/api/trucks/__tests__/route.test.ts
  Fleet Management API - Trucks Route
    GET /api/trucks
      ✓ TC026: Should return all trucks successfully (18ms)
      ✓ TC027: Should return empty array when no trucks exist (10ms)
      ...

Test Suites: 2 passed, 2 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        4.123 s
```

---

## 6. Coverage Report

After running `npm run test:coverage`, you'll get a coverage report:

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.23 |    78.45 |   82.11 |   86.34 |
 trucks/            |   88.92 |    82.15 |   87.50 |   90.12 |
  page.tsx          |   88.92 |    82.15 |   87.50 |   90.12 | 145-152,178
 api/trucks/        |   91.45 |    85.71 |   90.00 |   92.33 |
  route.ts          |   91.45 |    85.71 |   90.00 |   92.33 | 67-72
--------------------|---------|----------|---------|---------|-------------------
```

---

## 7. Continuous Integration Setup

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

---

## 8. Pre-commit Hook (Optional)

Install Husky for automated testing before commits:

```bash
npm install --save-dev husky lint-staged

npx husky install

npx husky add .husky/pre-commit "npm test"
```

---

## 9. Test Case Summary

| Test File | Test Cases | Coverage |
|-----------|-----------|----------|
| `page.test.tsx` | 25 | UI Components, Forms, User Interactions |
| `route.test.ts` | 20 | API Endpoints, Validation, Data Integrity |
| **Total** | **45** | **Complete Fleet Management Testing** |

### Test Categories:
- ✅ Page Rendering (3 tests)
- ✅ Truck List Display (3 tests)
- ✅ Statistics Calculation (4 tests)
- ✅ Form Operations (4 tests)
- ✅ Edit/Delete Operations (3 tests)
- ✅ Error Handling (3 tests)
- ✅ Data Validation (3 tests)
- ✅ UI Interactions (2 tests)
- ✅ API GET Operations (4 tests)
- ✅ API POST Operations (6 tests)
- ✅ Data Integrity (4 tests)
- ✅ Edge Cases & Performance (6 tests)

---

## 10. Troubleshooting

### Issue: "Cannot find module '@testing-library/react'"
**Solution**: Run `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event`

### Issue: "ReferenceError: window is not defined"
**Solution**: Ensure `jest.config.js` has `testEnvironment: 'jest-environment-jsdom'`

### Issue: Tests timeout
**Solution**:
1. Check for async operations without `await`
2. Wrap assertions in `waitFor()`
3. Increase timeout: `jest.setTimeout(10000)`

### Issue: Mock not working
**Solution**:
1. Ensure mocks are defined before imports
2. Clear mocks in `beforeEach`: `jest.clearAllMocks()`
3. Check mock paths are correct

---

## 11. Writing Additional Tests

### Template for New Component Tests:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC###: Should [expected behavior]', async () => {
    // Arrange
    const mockData = { /* ... */ };

    // Act
    render(<YourComponent />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Expected')).toBeInTheDocument();
    });
  });
});
```

### Template for New API Tests:

```typescript
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

describe('API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC###: Should [expected behavior]', async () => {
    // Arrange
    const mockData = { /* ... */ };

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual(mockData);
  });
});
```

---

## 12. Best Practices

1. **Test Naming**: Use descriptive test names with TC### IDs
2. **Arrange-Act-Assert**: Follow AAA pattern in all tests
3. **Isolation**: Each test should be independent
4. **Cleanup**: Use `beforeEach` and `afterEach` for cleanup
5. **Async**: Always use `waitFor` for async operations
6. **Mocking**: Mock external dependencies (API, database)
7. **Coverage**: Aim for 70%+ coverage on critical paths
8. **Documentation**: Update TEST_DOCUMENTATION.md when adding tests

---

## 13. Next Steps

After setting up Fleet Management tests, consider:

1. **Add tests for other modules**:
   - Drivers Management
   - Customers Management
   - Trips Management
   - Invoices & Billing
   - Reports & Analytics

2. **Integration tests**: Test interactions between modules

3. **E2E tests**: Use Playwright or Cypress for full user workflows

4. **Performance tests**: Test with large datasets

5. **Accessibility tests**: Use jest-axe for a11y testing

---

## 14. Resources

- 📚 [Jest Documentation](https://jestjs.io/docs/getting-started)
- 🧪 [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- ⚡ [Next.js Testing Guide](https://nextjs.org/docs/testing)
- 📖 [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) - Detailed test case documentation

---

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review TEST_DOCUMENTATION.md for examples
3. Check Jest/RTL documentation
4. Review existing test files for patterns

---

**Happy Testing! 🎉**

Last Updated: February 2026
