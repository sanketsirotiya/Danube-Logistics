# Danube Logistics - AI Development Context

This file provides comprehensive context for AI assistants working on the Danube Logistics codebase.

## Project Overview

Danube Logistics is a comprehensive logistics management system for trucking companies, featuring real-time tracking, billing, scheduling, and dispatch management. The application is built with Next.js 16, React 19, TypeScript, TanStack Query, and PostgreSQL with Prisma ORM.

**Repository:** https://github.com/sanketsirotiya/Danube-Logistics

## Core Architecture

### Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, TanStack Query, Tailwind CSS
- **Backend:** Next.js API Routes (serverless), Prisma ORM, PostgreSQL
- **Testing:** Jest, React Testing Library
- **State Management:** TanStack Query (server state only - no client state management library)

### Architecture Pattern: Service Layer + TanStack Query

The application follows a **service layer architecture** with TanStack Query for server state management. This eliminates the need for manual useState/useEffect patterns and provides automatic caching, background refetching, and request deduplication.

#### Data Flow (End-to-End)

```
User Action → React Component → Custom Hook (useTrucks) → TanStack Query
  ↓
Check Cache → If Fresh: Return Cached Data
  ↓
If Stale/Missing: Call Service Layer (trucksService.getAll)
  ↓
API Client (apiClient) → fetch('/api/trucks')
  ↓
Next.js API Route (/app/api/trucks/route.ts)
  ↓
Prisma ORM → PostgreSQL Database
  ↓
Response → Cache Update → Component Re-render
```

**Key Benefits:**
- Automatic caching (1-minute stale time, 5-minute garbage collection)
- Request deduplication (multiple components requesting same data = single API call)
- Background refetching keeps data fresh
- Built-in loading and error states
- Optimistic updates for mutations
- Zero manual state management boilerplate

### File Structure

```
src/
├── app/                           # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── customers/            # Customer CRUD endpoints
│   │   ├── drivers/              # Driver CRUD endpoints
│   │   ├── trucks/               # Truck CRUD endpoints
│   │   ├── trips/                # Trip management endpoints
│   │   ├── invoices/             # Invoice endpoints
│   │   ├── delivery-orders/      # Delivery order endpoints
│   │   ├── dashboard/            # Dashboard stats endpoint
│   │   └── reports/              # Reporting endpoints
│   │
│   ├── dashboard/                # Dashboard page
│   ├── customers/                # Customer management page
│   ├── drivers/                  # Driver management page
│   ├── trucks/                   # Fleet management page
│   ├── trips/                    # Trip management page
│   ├── invoices/                 # Invoicing page
│   ├── delivery-orders/          # Delivery orders page
│   ├── layout.tsx                # Root layout with Providers
│   └── providers.tsx             # TanStack Query provider wrapper
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Base API client (fetch wrapper)
│   │   └── query-client.ts       # TanStack Query configuration
│   │
│   ├── services/                 # API service layer (centralized API calls)
│   │   ├── customers.service.ts
│   │   ├── drivers.service.ts
│   │   ├── trucks.service.ts
│   │   ├── trips.service.ts
│   │   ├── invoices.service.ts
│   │   ├── delivery-orders.service.ts
│   │   ├── containers.service.ts
│   │   ├── charge-types.service.ts
│   │   └── dashboard.service.ts
│   │
│   ├── hooks/                    # Custom TanStack Query hooks
│   │   ├── customers/
│   │   │   ├── useCustomers.ts         # Query: fetch all customers
│   │   │   ├── useCustomer.ts          # Query: fetch single customer
│   │   │   ├── useCreateCustomer.ts    # Mutation: create customer
│   │   │   ├── useUpdateCustomer.ts    # Mutation: update customer
│   │   │   └── useDeleteCustomer.ts    # Mutation: delete customer
│   │   ├── drivers/
│   │   ├── trucks/
│   │   ├── trips/
│   │   ├── invoices/
│   │   ├── delivery-orders/
│   │   ├── containers/
│   │   └── dashboard/
│   │
│   ├── types/                    # Shared TypeScript type definitions
│   │   ├── api.types.ts         # Common API types (ApiError, etc.)
│   │   ├── customer.types.ts
│   │   ├── driver.types.ts
│   │   ├── truck.types.ts
│   │   ├── trip.types.ts
│   │   ├── invoice.types.ts
│   │   ├── delivery-order.types.ts
│   │   ├── container.types.ts
│   │   ├── dashboard.types.ts
│   │   └── index.ts             # Re-exports all types
│   │
│   └── prisma.ts                # Prisma client singleton
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeding script
│
└── tests/                       # Test files
```

## Development Patterns

### 1. Service Layer Pattern

All API calls are centralized in `src/lib/services/`. Never make direct `fetch()` calls from components.

**Pattern:**
```typescript
// src/lib/services/trucks.service.ts
import { apiClient } from '@/lib/api/client';
import type { Truck, CreateTruckInput } from '@/lib/types';

export const trucksService = {
  getAll: () => apiClient<Truck[]>('/trucks'),

  getById: (id: string) => apiClient<Truck>(`/trucks/${id}`),

  create: (data: CreateTruckInput) =>
    apiClient<Truck>('/trucks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTruckInput>) =>
    apiClient<Truck>(`/trucks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/trucks/${id}`, {
      method: 'DELETE',
    }),
};
```

### 2. Custom React Query Hooks

Each resource has dedicated hooks in `src/lib/hooks/[resource]/`.

**Query Hook Pattern (Read Operations):**
```typescript
// src/lib/hooks/trucks/useTrucks.ts
import { useQuery } from '@tanstack/react-query';
import { trucksService } from '@/lib/services/trucks.service';

export const TRUCKS_QUERY_KEY = ['trucks'];

export function useTrucks() {
  return useQuery({
    queryKey: TRUCKS_QUERY_KEY,
    queryFn: trucksService.getAll,
  });
}
```

**Mutation Hook Pattern (Create/Update/Delete):**
```typescript
// src/lib/hooks/trucks/useCreateTruck.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trucksService } from '@/lib/services/trucks.service';
import type { CreateTruckInput } from '@/lib/types';
import { TRUCKS_QUERY_KEY } from './useTrucks';

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTruckInput) => trucksService.create(data),
    onSuccess: () => {
      // Automatically refetch trucks list after creation
      queryClient.invalidateQueries({ queryKey: TRUCKS_QUERY_KEY });
    },
  });
}
```

### 3. Component Usage Pattern

Components should use hooks, never direct API calls.

**Before (❌ Old Pattern - Don't Use):**
```typescript
const [trucks, setTrucks] = useState<Truck[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data = await response.json();
      setTrucks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchTrucks();
}, []);
```

**After (✅ New Pattern - Use This):**
```typescript
import { useTrucks } from '@/lib/hooks/trucks/useTrucks';
import { useCreateTruck } from '@/lib/hooks/trucks/useCreateTruck';
import { useUpdateTruck } from '@/lib/hooks/trucks/useUpdateTruck';
import { useDeleteTruck } from '@/lib/hooks/trucks/useDeleteTruck';

export default function TrucksPage() {
  // Data fetching with automatic caching
  const { data: trucks = [], isLoading, error } = useTrucks();

  // Mutations
  const createTruck = useCreateTruck();
  const updateTruck = useUpdateTruck();
  const deleteTruck = useDeleteTruck();

  const handleCreate = async (formData: CreateTruckInput) => {
    try {
      await createTruck.mutateAsync(formData);
      // Cache automatically invalidated, UI updates
    } catch (error) {
      alert('Failed to create truck');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    // ... JSX
  );
}
```

### 4. Type Safety Pattern

All types are centralized in `src/lib/types/` and shared between frontend and backend.

**Pattern:**
```typescript
// src/lib/types/truck.types.ts
export type TruckStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Truck {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: TruckStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTruckInput {
  plateNumber: string;
  model: string;
  capacity: number;
  status: TruckStatus;
}

export interface UpdateTruckInput extends Partial<CreateTruckInput> {
  id: string;
}
```

**Usage in Component:**
```typescript
import type { Truck, CreateTruckInput } from '@/lib/types';
```

### 5. API Route Pattern

API routes in `src/app/api/[resource]/route.ts` should:
- Use Prisma ORM for database operations
- Return JSON responses
- Handle errors with try/catch
- Use proper HTTP status codes

**Pattern:**
```typescript
// src/app/api/trucks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const trucks = await prisma.truck.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(trucks);
  } catch (error) {
    console.error('Error fetching trucks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trucks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const truck = await prisma.truck.create({
      data: body,
    });
    return NextResponse.json(truck, { status: 201 });
  } catch (error) {
    console.error('Error creating truck:', error);
    return NextResponse.json(
      { error: 'Failed to create truck' },
      { status: 500 }
    );
  }
}
```

## Core Principles

### 1. No Direct fetch() Calls in Components
❌ **Never do this:**
```typescript
const response = await fetch('/api/trucks');
const data = await response.json();
```

✅ **Always do this:**
```typescript
const { data: trucks } = useTrucks();
```

### 2. No Manual State Management for Server Data
❌ **Never do this:**
```typescript
const [trucks, setTrucks] = useState([]);
const [loading, setLoading] = useState(true);
```

✅ **Always do this:**
```typescript
const { data: trucks, isLoading } = useTrucks();
```

### 3. Single Source of Truth for Types
❌ **Never define types inline:**
```typescript
const [customer, setCustomer] = useState<{
  id: string;
  name: string;
  email: string;
}>({});
```

✅ **Always import from shared types:**
```typescript
import type { Customer } from '@/lib/types';
const [customer, setCustomer] = useState<Customer | null>(null);
```

### 4. Centralized API Calls
❌ **Never call APIs directly from components:**
```typescript
const response = await fetch('/api/customers', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

✅ **Always use service layer:**
```typescript
const createCustomer = useCreateCustomer();
await createCustomer.mutateAsync(data);
```

### 5. Cache Invalidation After Mutations
All mutation hooks (`useCreate*`, `useUpdate*`, `useDelete*`) automatically invalidate related queries using `queryClient.invalidateQueries()`. This ensures the UI stays in sync with the database.

## Key Features

### Container Tracking
- Containers auto-created when delivery orders are created
- Container numbers linked to delivery orders
- Used in trip management

### Delivery Order → Trip Integration
- Creating a trip from a delivery order auto-fills:
  - Customer
  - Container number
  - Pickup/dropoff locations
  - Container size

### Flexible Pricing Models
- **FLAT:** Customer pays flat rate per trip (defined in customer rates)
- **ITEMIZED:** Billable items (fuel, tolls, etc.) added to trip

### Invoice Generation
- Automated based on completed trips
- Respects customer pricing type (flat vs. itemized)
- Tracks payment status

## Database Schema (Prisma)

Key models:
- **User** - System users with role-based access
- **Customer** - Client companies, pricing type, billing info
- **Driver** - Driver profiles, licensing, status
- **Truck** - Fleet inventory, status, capacity
- **Container** - Shipping container tracking
- **Terminal** - Port/terminal locations
- **DeliveryOrder** - Container delivery requests from customers
- **Trip** - Assigned transport jobs with routing
- **Invoice** - Billing and payment records
- **TripActivityLog** - Audit trail for trip updates

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full schema.

## TanStack Query Configuration

```typescript
// src/lib/api/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 1 minute
      gcTime: 5 * 60 * 1000,       // Keep in cache for 5 minutes
      retry: 1,                     // Retry failed requests once
      refetchOnWindowFocus: false,  // Don't refetch on window focus
    },
    mutations: {
      retry: 0,                     // Don't retry failed mutations
    },
  },
});
```

## Common Workflows

### Adding a New Resource (e.g., "Expenses")

1. **Define Types** (`src/lib/types/expense.types.ts`):
   ```typescript
   export interface Expense {
     id: string;
     tripId: string;
     type: string;
     amount: number;
     createdAt: string;
   }

   export interface CreateExpenseInput {
     tripId: string;
     type: string;
     amount: number;
   }
   ```

2. **Create Service** (`src/lib/services/expenses.service.ts`):
   ```typescript
   export const expensesService = {
     getAll: () => apiClient<Expense[]>('/expenses'),
     create: (data: CreateExpenseInput) =>
       apiClient<Expense>('/expenses', {
         method: 'POST',
         body: JSON.stringify(data),
       }),
   };
   ```

3. **Create Hooks** (`src/lib/hooks/expenses/`):
   - `useExpenses.ts` (query)
   - `useCreateExpense.ts` (mutation)
   - `useDeleteExpense.ts` (mutation)

4. **Create API Route** (`src/app/api/expenses/route.ts`):
   ```typescript
   export async function GET() {
     const expenses = await prisma.expense.findMany();
     return NextResponse.json(expenses);
   }
   ```

5. **Use in Component**:
   ```typescript
   const { data: expenses } = useExpenses();
   const createExpense = useCreateExpense();
   ```

### Modifying Existing Features

1. **Read the existing code first** - Use Read tool on relevant files
2. **Understand the pattern** - Follow existing service/hook structure
3. **Update types** - Add/modify types in `src/lib/types/`
4. **Update service** - Modify service methods in `src/lib/services/`
5. **Update hooks** - Add new hooks or modify existing ones
6. **Update API route** - Modify backend logic if needed
7. **Update component** - Use updated hooks in component
8. **Test thoroughly** - Verify CRUD operations work

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
npm test                 # Run all tests
npm test -- --watch      # Run in watch mode
npm test -- --coverage   # Run with coverage report
```

Test files should be in `tests/` directory and follow pattern: `[feature].test.tsx`

## Environment Setup

Required environment variables in `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/danube_logistics"
NODE_ENV="development"
```

## Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data
npm test             # Run tests
npx prisma migrate dev    # Run database migrations
npx prisma studio         # Open Prisma Studio (DB GUI)
```

## Important Notes for AI Assistants

1. **Never use MobX** - This project uses TanStack Query for server state. MobX is for client state and would be redundant.

2. **No Redux** - TanStack Query handles all server state. No need for Redux, Zustand, or similar libraries.

3. **No useState for API data** - Use TanStack Query hooks (`useQuery`, `useMutation`) instead.

4. **No useEffect for data fetching** - TanStack Query handles this automatically.

5. **Always use TypeScript** - No `any` types unless absolutely necessary.

6. **Follow existing patterns** - Look at existing hooks/services before creating new ones.

7. **Cache invalidation is automatic** - Mutation hooks already invalidate queries. Don't manually refetch.

8. **Git commits** - Do NOT add "Co-Authored-By: Claude Sonnet 4.5" attribution unless explicitly requested.

9. **File references** - Use markdown link syntax: `[file.ts](src/file.ts)` or `[file.ts:42](src/file.ts#L42)`

10. **Read before modifying** - Always read existing files before suggesting changes.

11. **Never manually create tables or write raw SQL for schema changes** - ALL database schema changes (new tables, adding/removing columns, indexes) MUST go through `npx prisma migrate dev --name <migration_name>`. Never provide `CREATE TABLE`, `ALTER TABLE`, or `DROP COLUMN` statements for users to run manually on Neon or any database. Prisma generates the SQL and applies it. The migration files are committed to the repo.

## Architecture Decisions

### Why TanStack Query over MobX?
- **TanStack Query:** Server state management (API data, caching, background sync)
- **MobX:** Client state management (UI state, form state, local data)

This project only needs server state management. TanStack Query provides:
- Automatic caching with configurable stale time
- Background refetching to keep data fresh
- Request deduplication (multiple components = single API call)
- Built-in loading/error states
- Optimistic updates
- Automatic garbage collection
- DevTools for debugging

MobX would not replace TanStack Query - they solve different problems.

### Why Service Layer?
- Single source of truth for all API calls
- Easy to mock for testing
- Consistent error handling
- Type safety across the application
- Easy to add interceptors, logging, or authentication later

### Why Next.js App Router?
- Server Components for better performance
- Simplified data fetching patterns
- Built-in API routes (no separate backend needed)
- File-system based routing
- TypeScript-first

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Last Updated:** 2026-02-10
**Maintainer:** Danube Logistics Team
