# Fleet Management Test Cases Documentation

This document provides comprehensive documentation for all test cases written for the Fleet Management (Trucks) module.

## Test Setup

### Prerequisites
1. Install testing dependencies:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

2. Run tests:
```bash
npm test                    # Run all tests
npm test -- --coverage      # Run with coverage report
npm test -- --watch         # Run in watch mode
npm test trucks             # Run only truck-related tests
```

## Test Coverage Overview

### Component Tests (25 Test Cases)
- **File**: `src/app/trucks/__tests__/page.test.tsx`
- **Coverage**: UI components, user interactions, form operations

### API Tests (20 Test Cases)
- **File**: `src/app/api/trucks/__tests__/route.test.ts`
- **Coverage**: API endpoints, data validation, error handling

---

## Component Test Cases

### 1. Page Rendering (TC001-TC003)

#### TC001: Should render the page title and header correctly
- **Purpose**: Verify page header displays correct title and subtitle
- **Test Data**: Empty truck list
- **Expected Result**:
  - Header displays "Fleet Management"
  - Subtitle displays "Manage your fleet of trucks and their status"

#### TC002: Should display Home button
- **Purpose**: Verify navigation to home page is available
- **Test Data**: None
- **Expected Result**:
  - Home link is present
  - Link has correct href "/"

#### TC003: Should display "Add New Truck" button
- **Purpose**: Verify add truck functionality is accessible
- **Test Data**: Empty truck list
- **Expected Result**: Button with text "+ Add New Truck" is present

---

### 2. Truck List Display (TC004-TC006)

#### TC004: Should display empty state when no trucks exist
- **Purpose**: Verify appropriate message shown when fleet is empty
- **Test Data**: Empty array []
- **Expected Result**:
  - Message "No trucks found" is displayed
  - Helper text "Add your first truck to get started!" is shown

#### TC005: Should display list of trucks when data exists
- **Purpose**: Verify trucks are displayed in table format
- **Test Data**:
  ```javascript
  [
    { id: '1', plate: 'ABC-123', model: 'Volvo FH16', year: 2020, capacity: 25000, status: 'AVAILABLE' },
    { id: '2', plate: 'XYZ-789', model: 'Scania R500', year: 2021, capacity: 30000, status: 'IN_USE' }
  ]
  ```
- **Expected Result**: All truck details are visible in the table

#### TC006: Should display truck status with correct styling
- **Purpose**: Verify status badges have correct colors
- **Test Data**: Truck with status 'AVAILABLE'
- **Expected Result**: Status badge has green styling (bg-green-100, text-green-800)

---

### 3. Statistics Display (TC007-TC010)

#### TC007: Should calculate and display total trucks correctly
- **Purpose**: Verify total count is accurate
- **Test Data**: 3 trucks with various statuses
- **Expected Result**: "Total Trucks" displays "3"

#### TC008: Should calculate available trucks correctly
- **Purpose**: Verify available count filters correctly
- **Test Data**: 2 AVAILABLE trucks, 1 IN_USE truck
- **Expected Result**: "Available" displays "2"

#### TC009: Should calculate in-use trucks correctly
- **Purpose**: Verify in-use count filters correctly
- **Test Data**: 1 AVAILABLE truck, 2 IN_USE trucks
- **Expected Result**: "In Use" displays "2"

#### TC010: Should calculate maintenance trucks correctly
- **Purpose**: Verify maintenance count filters correctly
- **Test Data**: 1 AVAILABLE truck, 1 MAINTENANCE truck
- **Expected Result**: "Maintenance" displays "1"

---

### 4. Form Operations (TC011-TC014)

#### TC011: Should show form when Add New Truck button is clicked
- **Purpose**: Verify form toggle functionality
- **Test Data**: None
- **Expected Result**: Form with title "Add New Truck" appears

#### TC012: Should hide form when Cancel button is clicked
- **Purpose**: Verify form can be closed
- **Test Data**: Form is open
- **Expected Result**: Form disappears from DOM

#### TC013: Should validate required fields on form submission
- **Purpose**: Verify form won't submit without required data
- **Test Data**: Empty form
- **Expected Result**: No API call is made when submit is clicked

#### TC014: Should create new truck with valid data
- **Purpose**: Verify successful truck creation
- **Test Data**:
  ```javascript
  { plate: 'ABC-123', model: 'Volvo FH16', year: 2020, capacity: 25000 }
  ```
- **Expected Result**:
  - POST request to /api/trucks
  - New truck appears in list

---

### 5. Edit and Delete Operations (TC015-TC017)

#### TC015: Should populate form when Edit button is clicked
- **Purpose**: Verify edit mode loads existing data
- **Test Data**: Existing truck with plate 'ABC-123'
- **Expected Result**:
  - Form title shows "Edit Truck"
  - Form fields are pre-filled with truck data

#### TC016: Should delete truck when Delete button is confirmed
- **Purpose**: Verify deletion workflow
- **Test Data**: Existing truck
- **Expected Result**:
  - DELETE request to /api/trucks/{id}
  - Truck removed from list

#### TC017: Should not delete truck when Delete is cancelled
- **Purpose**: Verify confirmation dialog prevents accidental deletion
- **Test Data**: User clicks Cancel on confirm dialog
- **Expected Result**: No DELETE request is made

---

### 6. Error Handling (TC018-TC020)

#### TC018: Should handle API errors gracefully
- **Purpose**: Verify app doesn't crash on API failure
- **Test Data**: API throws error
- **Expected Result**: Error is logged to console

#### TC019: Should handle network errors
- **Purpose**: Verify network failures are handled
- **Test Data**: Network error thrown
- **Expected Result**: Error is logged, user sees appropriate message

#### TC020: Should handle invalid response data
- **Purpose**: Verify null/undefined data is handled
- **Test Data**: API returns null
- **Expected Result**: Empty state is shown

---

### 7. Data Validation (TC021-TC023)

#### TC021: Should validate plate number format
- **Purpose**: Verify plate number is required
- **Test Data**: Empty plate number field
- **Expected Result**: Form doesn't submit

#### TC022: Should validate year is a valid number
- **Purpose**: Verify year field accepts only numbers
- **Test Data**: Year input field
- **Expected Result**: Input type is "number"

#### TC023: Should validate capacity is a positive number
- **Purpose**: Verify capacity validation
- **Test Data**: Capacity input field
- **Expected Result**:
  - Input type is "number"
  - Min attribute is "0"

---

### 8. UI Interactions (TC024-TC025)

#### TC024: Should display table headers correctly
- **Purpose**: Verify table structure
- **Test Data**: None
- **Expected Result**: All column headers are present:
  - Plate Number
  - Model
  - Year
  - Capacity (kg)
  - Status
  - Actions

#### TC025: Should apply hover effects to truck rows
- **Purpose**: Verify UI feedback on interaction
- **Test Data**: Truck row
- **Expected Result**: Row has class "hover:bg-blue-50"

---

## API Test Cases

### 1. GET /api/trucks (TC026-TC029)

#### TC026: Should return all trucks successfully
- **Purpose**: Verify GET endpoint returns truck list
- **Test Data**: 2 trucks in database
- **Expected Result**:
  - HTTP 200 status
  - Array of trucks returned
  - Trucks ordered by createdAt desc

#### TC027: Should return empty array when no trucks exist
- **Purpose**: Verify empty state handling
- **Test Data**: Empty database
- **Expected Result**:
  - HTTP 200 status
  - Empty array []

#### TC028: Should handle database errors gracefully
- **Purpose**: Verify error handling
- **Test Data**: Database throws error
- **Expected Result**:
  - HTTP 500 status
  - Error message: "Failed to fetch trucks"

#### TC029: Should order trucks by creation date descending
- **Purpose**: Verify correct ordering
- **Test Data**: Multiple trucks
- **Expected Result**: Prisma called with orderBy: { createdAt: 'desc' }

---

### 2. POST /api/trucks (TC030-TC035)

#### TC030: Should create a new truck successfully
- **Purpose**: Verify truck creation
- **Test Data**: Valid truck data
- **Expected Result**:
  - HTTP 201 status
  - Created truck returned with ID

#### TC031: Should validate required fields
- **Purpose**: Verify validation logic
- **Test Data**: Incomplete truck data (missing fields)
- **Expected Result**: HTTP 400 status

#### TC032: Should handle duplicate plate numbers
- **Purpose**: Verify unique constraint
- **Test Data**: Duplicate plate number
- **Expected Result**:
  - HTTP 500 status
  - Error message returned

#### TC033: Should validate truck status values
- **Purpose**: Verify enum validation
- **Test Data**: Invalid status "INVALID_STATUS"
- **Expected Result**: HTTP 400 or 500 status

#### TC034: Should validate year is a valid number
- **Purpose**: Verify type validation
- **Test Data**: Year as string "invalid"
- **Expected Result**: HTTP 400 or 500 status

#### TC035: Should validate capacity is a positive number
- **Purpose**: Verify number validation
- **Test Data**: Negative capacity -1000
- **Expected Result**: HTTP 400 or 500 status

---

### 3. Data Integrity (TC036-TC039)

#### TC036: Should store all truck fields correctly
- **Purpose**: Verify data persistence
- **Test Data**: Complete truck object
- **Expected Result**: All fields match input data

#### TC037: Should set default status if not provided
- **Purpose**: Verify default values
- **Test Data**: Truck without status field
- **Expected Result**: Status defaults to 'AVAILABLE'

#### TC038: Should generate unique IDs for each truck
- **Purpose**: Verify ID generation
- **Test Data**: Two trucks created sequentially
- **Expected Result**: Different IDs assigned

#### TC039: Should set timestamps correctly
- **Purpose**: Verify audit trail
- **Test Data**: New truck creation
- **Expected Result**:
  - createdAt is set
  - updatedAt is set

---

### 4. Performance and Edge Cases (TC040-TC045)

#### TC040: Should handle large number of trucks
- **Purpose**: Verify scalability
- **Test Data**: 1000 trucks
- **Expected Result**:
  - HTTP 200 status
  - All 1000 trucks returned

#### TC041: Should handle special characters in plate number
- **Purpose**: Verify character encoding
- **Test Data**: Plate "ABC-123-ÄÖÜ"
- **Expected Result**:
  - HTTP 201 status
  - Special characters preserved

#### TC042: Should handle very long model names
- **Purpose**: Verify field length limits
- **Test Data**: 255 character model name
- **Expected Result**: Accepted or appropriate error

#### TC043: Should handle maximum capacity value
- **Purpose**: Verify numeric limits
- **Test Data**: Capacity 999999
- **Expected Result**:
  - HTTP 201 status
  - Value stored correctly

#### TC044: Should handle future year values
- **Purpose**: Verify year validation
- **Test Data**: Current year + 5
- **Expected Result**: Accepted or validation error

#### TC045: Should handle concurrent requests
- **Purpose**: Verify race condition handling
- **Test Data**: Two simultaneous POST requests
- **Expected Result**: Both trucks created successfully

---

## Test Execution Guidelines

### Running Specific Test Suites

```bash
# Run only component tests
npm test -- trucks/page.test

# Run only API tests
npm test -- api/trucks/route.test

# Run with coverage
npm test -- --coverage --collectCoverageFrom='src/app/trucks/**/*.{ts,tsx}'

# Run in watch mode for development
npm test -- --watch
```

### Coverage Targets

The following coverage thresholds are configured:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Continuous Integration

These tests should be run:
1. Before each commit (pre-commit hook)
2. On pull request creation
3. Before deployment to staging/production

---

## Maintenance Notes

### Adding New Test Cases

When adding features to Fleet Management:

1. **Component Changes**: Add tests to `page.test.tsx`
2. **API Changes**: Add tests to `route.test.ts`
3. **Follow Naming**: Use TC### format for test case IDs
4. **Update Documentation**: Add new test cases to this file

### Common Testing Patterns

```typescript
// Testing async operations
await waitFor(() => {
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

// Testing user interactions
const user = userEvent.setup();
await user.type(inputElement, 'text');
await user.click(buttonElement);

// Mocking API responses
(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => mockData,
});

// Testing error scenarios
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
// ... test code
consoleSpy.mockRestore();
```

---

## Troubleshooting

### Common Issues

1. **Tests failing due to async updates**
   - Solution: Wrap assertions in `waitFor()`

2. **Mock not working**
   - Solution: Ensure mocks are cleared in `beforeEach`

3. **Coverage not meeting threshold**
   - Solution: Add missing test cases for uncovered branches

4. **Flaky tests**
   - Solution: Use `waitFor` instead of fixed timeouts
   - Ensure proper cleanup in `afterEach`

---

## Related Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

## Test Summary

| Category | Test Cases | Pass Criteria |
|----------|-----------|---------------|
| Page Rendering | 3 | All UI elements render correctly |
| Truck List Display | 3 | Data displays accurately |
| Statistics | 4 | Calculations are correct |
| Form Operations | 4 | CRUD operations work |
| Edit/Delete | 3 | Modifications successful |
| Error Handling | 3 | Errors handled gracefully |
| Data Validation | 3 | Invalid data rejected |
| UI Interactions | 2 | User experience smooth |
| API GET | 4 | Data retrieval works |
| API POST | 6 | Data creation works |
| Data Integrity | 4 | Data stored correctly |
| Edge Cases | 6 | System handles extremes |
| **Total** | **45** | **All pass** |

---

Last Updated: February 2026
