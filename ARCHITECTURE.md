# Architecture Overview for Trucking Logistics System

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND LAYER (Browser)                │
│  Next.js 14+ Pages/Components + TypeScript + Tailwind│
│                                                       │
│  - Dispatch Dashboard (real-time truck locations)    │
│  - Delivery Orders (port-to-customer container mgmt) │
│  - Scheduling Calendar (container pickups/drops)     │
│  - Billing Interface (invoices, payments)            │
│  - Container Availability Search                     │
└───────────────────┬─────────────────────────────────┘
                    │ tRPC calls (type-safe)
                    │ or Server Actions
┌───────────────────┴─────────────────────────────────┐
│           BACKEND LAYER (Next.js Server)             │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  API Routes / Server Actions / tRPC         │   │
│  │  - Create/update trips                       │   │
│  │  - Manage delivery orders (CRUD)             │   │
│  │  - Generate invoices                         │   │
│  │  - Query container availability              │   │
│  │  - Assign drivers to loads                   │   │
│  └──────────┬──────────────────┬────────────────┘   │
│             │                  │                     │
│  ┌──────────┴────────┐  ┌──────┴──────────────┐    │
│  │  Prisma ORM       │  │  Background Jobs    │    │
│  │  (Type-safe DB)   │  │  (BullMQ Queues)    │    │
│  └──────────┬────────┘  └──────┬──────────────┘    │
└─────────────┼────────────────────┼──────────────────┘
              │                    │
┌─────────────┴────────┐  ┌────────┴─────────────────┐
│   PostgreSQL DB      │  │      Redis               │
│                      │  │                           │
│ - trucks             │  │ - Job queue storage      │
│ - drivers            │  │ - Container availability │
│ - containers         │  │   cache (fast lookup)    │
│ - customers          │  │ - Session store          │
│ - delivery_orders    │  └──────────┬───────────────┘
│ - trips              │             │
│ - invoices           │             │
│ - terminals          │             │
│ - rates              │             │
└──────────────────────┘             │
                                     │
                    ┌────────────────┴─────────────────┐
                    │   Background Workers (BullMQ)    │
                    │                                   │
                    │  Jobs:                            │
                    │  - Sync terminal APIs (every 5m)  │
                    │  - Generate daily invoices        │
                    │  - Send driver notifications      │
                    │  - Update container status        │
                    └────────┬─────────────────────────┘
                             │ HTTP calls
                    ┌────────┴─────────────────────────┐
                    │   External Terminal APIs         │
                    │  - Terminal A (Port of LA)       │
                    │  - Terminal B (Port of Long Beach)│
                    │  - Terminal C (Inland depot)     │
                    └──────────────────────────────────┘
```

## 🔧 Tech Stack Components

### Frontend
- **Next.js 14+** - React framework with server/client components
- **TypeScript** - Type safety across the entire app
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Server Actions** - Form handling and mutations
- **tRPC** - Type-safe API layer (alternative to REST)

### Database & ORM
- **PostgreSQL** - Primary relational database
- **Prisma** - Type-safe ORM with migrations

### Caching & Queue
- **Redis** - Caching and session store
- **BullMQ** - Job queue for background tasks

### Additional Tools
- **Zod** - Runtime schema validation
- **React Query / TanStack Query** - Data fetching and caching
- **Pusher / Socket.io** - Real-time updates (optional)

---

## 🗄️ Database Schema

### Core Tables

```sql
Tables:
├── trucks (id, plate, vin, status, current_location)
├── drivers (id, name, license, phone, status)
├── containers (id, number, size, type, terminal_id, available)
├── terminals (id, name, api_endpoint, api_key)
├── delivery_orders (id, order_number, customer_id, container_number, status, priority, port_of_loading, delivery_address)
├── trips (id, truck_id, driver_id, container_id, pickup, dropoff, status, delivery_order_id)
├── invoices (id, trip_id, amount, due_date, paid)
├── rates (id, route, container_type, price)
└── api_sync_logs (id, terminal_id, synced_at, status, containers_updated)
```

### Relationships
- Trucks ←→ Drivers (many-to-many via trips)
- Trips → Truck (one-to-many)
- Trips → Driver (one-to-many)
- Trips → Container (one-to-many)
- Trips → Invoice (one-to-one)
- Trips ← DeliveryOrder (one-to-one, optional)
- DeliveryOrders → Customer (many-to-one)
- Containers → Terminals (many-to-one)

---

## 🔧 Component Breakdown

### 1. Next.js Frontend + Backend

**Why it works for trucking:**
- **Single codebase** for UI and API logic
- **Server Components** fetch dispatch data without API calls
- **Server Actions** handle form submissions (create trip, update status)
- **API Routes** for external integrations (mobile app, partner APIs)

**Real example flow:**
```typescript
// app/dispatch/page.tsx (Server Component)
async function DispatchDashboard() {
  // Runs on server, no API needed
  const activeTrips = await prisma.trip.findMany({
    where: { status: 'IN_PROGRESS' },
    include: { truck: true, driver: true, container: true }
  });

  return <DispatchBoard trips={activeTrips} />;
}
```

---

### 2. PostgreSQL Database

**Why PostgreSQL:**
- **Relational data** - trucks → drivers → trips → invoices all connected
- **ACID transactions** - critical for billing (money involved!)
- **JSON columns** - store raw terminal API responses flexibly
- **Complex queries** - "Show me all available 40ft containers at Terminal A that can be picked up today"

**Example transaction:**
```typescript
// Create a trip with billing in ONE transaction
const trip = await prisma.$transaction(async (tx) => {
  const trip = await tx.trip.create({
    data: {
      truckId: "truck_123",
      driverId: "driver_456",
      containerId: "container_789",
      pickupTime: new Date(),
      status: "SCHEDULED"
    }
  });

  const invoice = await tx.invoice.create({
    data: {
      tripId: trip.id,
      amount: 450.00,
      dueDate: addDays(new Date(), 30)
    }
  });

  return { trip, invoice };
});
```

---

### 3. Prisma ORM

**Benefits:**
- Auto-complete for your database structure
- Catches errors at compile time
- Easy migrations when schema changes
- Type-safe queries

---

### 4. Redis (Cache + Queue Storage)

**Two main uses:**

**A) Caching Container Availability (Fast Lookups)**
```typescript
// Check Redis first (milliseconds)
const available = await redis.get(`containers:terminal_A:available`);
if (available) return JSON.parse(available);

// If not cached, query DB (slower)
const containers = await prisma.container.findMany({...});
await redis.setex(`containers:terminal_A:available`, 300, JSON.stringify(containers)); // Cache 5min
```

**B) Queue Storage for BullMQ**
Stores job data, retries, progress tracking.

---

### 5. BullMQ (Background Jobs)

**Critical for terminal syncing:**

```typescript
// Define a recurring job
import { Queue, Worker } from 'bullmq';

const terminalSyncQueue = new Queue('terminal-sync');

// Add job to run every 5 minutes
await terminalSyncQueue.add(
  'sync-terminal-A',
  { terminalId: 'terminal_A' },
  { repeat: { every: 300000 } } // 5 min
);

// Worker processes the job
const worker = new Worker('terminal-sync', async (job) => {
  const { terminalId } = job.data;

  // 1. Call external terminal API
  const response = await fetch(`https://terminal-a.com/api/containers`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  const containers = await response.json();

  // 2. Update your database
  for (const container of containers) {
    await prisma.container.upsert({
      where: { number: container.number },
      update: { available: container.available, location: container.location },
      create: { number: container.number, terminalId, available: container.available }
    });
  }

  // 3. Update Redis cache
  await redis.set(`containers:${terminalId}:available`, JSON.stringify(containers));

  // 4. Log the sync
  await prisma.apiSyncLog.create({
    data: { terminalId, status: 'SUCCESS', containersUpdated: containers.length }
  });
});
```

**Why BullMQ:**
- **Automatic retries** - if terminal API is down, retries later
- **Job scheduling** - sync every X minutes
- **Job prioritization** - urgent syncs get priority
- **Monitoring** - see which syncs failed, how long they took
- **Multiple workers** - scale to handle many terminals

---

### 6. tRPC (Type-Safe API Layer)

**Alternative to REST with superpowers:**

```typescript
// backend/trpc/router.ts
export const appRouter = router({
  containers: {
    search: procedure
      .input(z.object({
        terminalId: z.string(),
        size: z.enum(['20ft', '40ft']),
        available: z.boolean()
      }))
      .query(async ({ input }) => {
        return await prisma.container.findMany({
          where: {
            terminalId: input.terminalId,
            size: input.size,
            available: input.available
          }
        });
      })
  }
});

// frontend/components/ContainerSearch.tsx
const { data, isLoading } = trpc.containers.search.useQuery({
  terminalId: 'terminal_A',
  size: '40ft',
  available: true
});
// ✅ Fully typed! Auto-complete works. Catches typos at compile time.
```

**vs REST:**
- REST: String URLs, manual typing, runtime errors
- tRPC: Type-safe end-to-end, refactoring is safe

---

## 🔄 Real-World Data Flows

### Flow 1: Dispatcher Creates a New Trip

```
1. User fills form in browser → submits
2. Next.js Server Action receives data
3. Validates with Zod schema
4. Prisma creates trip + invoice in transaction
5. Updates container status to "ASSIGNED"
6. Sends notification job to BullMQ (SMS driver)
7. Returns success → UI updates
8. Real-time event pushes to other dispatchers viewing dashboard
```

### Flow 2: Syncing Container Availability

```
1. BullMQ job triggers every 5 minutes
2. Worker calls Terminal A's API
3. Receives JSON: [{ container: "ABC123", available: true }, ...]
4. Compares with database
5. Updates changed containers in PostgreSQL
6. Updates Redis cache (fast lookups)
7. Logs sync success/failure
8. If failed → auto-retry in 1 minute
```

### Flow 3: Driver Completes Delivery

```
1. Driver clicks "Complete" in mobile app
2. API call to Next.js endpoint
3. Updates trip.status = "COMPLETED"
4. Marks container as available again
5. Triggers BullMQ job to generate invoice
6. Sends email to billing department
7. Updates dispatch dashboard in real-time
```

### Flow 4: Creating a Delivery Order (Port-to-Customer)

```
1. Customer service receives container delivery request
2. User navigates to Delivery Orders page
3. Fills form with:
   - Customer details
   - Container number, size, type
   - Port of loading
   - Delivery address
   - Priority level (Standard/Urgent/Critical)
   - Requested pickup/delivery dates
   - Special instructions
4. Next.js API creates delivery order with auto-generated order number
5. Order status set to "PENDING"
6. Dispatcher can later assign order to a trip
7. Status automatically updates: PENDING → ASSIGNED → IN_TRANSIT → DELIVERED
8. Actual pickup/delivery timestamps recorded automatically
9. Timeline view shows complete order history
```

---

## 🎯 Why This Stack Works for Trucking

| Requirement | Solution |
|-------------|----------|
| **Billing accuracy** | PostgreSQL transactions + Prisma type safety |
| **Delivery order tracking** | Status flow management + timeline tracking |
| **Terminal sync reliability** | BullMQ with retries + error tracking |
| **Fast container lookups** | Redis caching |
| **Real-time dispatch** | Next.js + WebSockets or Server-Sent Events |
| **Complex scheduling** | PostgreSQL relations + indexes |
| **API integrations** | BullMQ background jobs + Zod validation |
| **Developer productivity** | TypeScript end-to-end, tRPC type safety |
| **Scalability** | Can add more workers, Redis cluster, DB read replicas |

---

## ⚙️ Deployment Architecture

### Production Setup
```
├── Vercel (Next.js app) - $20/mo
├── Railway or Supabase (PostgreSQL) - $15/mo
├── Upstash (Redis) - $10/mo
├── Background worker (Railway/Render) - $7/mo
└── Total: ~$50-60/mo to start
```

### Scaling Up
- Add more BullMQ workers for more terminals
- Use PostgreSQL read replicas for heavy queries
- Redis cluster for high availability
- Separate frontend and backend if needed

---

## 📋 Development Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Next.js project
- [ ] Set up PostgreSQL + Prisma
- [ ] Create basic database schema
- [ ] Set up authentication

### Phase 2: Core Features (Week 3-4)
- [x] Truck/Driver/Container CRUD
- [x] Customer management
- [x] Delivery order management (port-to-customer tracking)
- [x] Trip creation and management
- [x] Basic dispatch dashboard

### Phase 3: Integrations (Week 5-6)
- [ ] Set up Redis + BullMQ
- [ ] Implement terminal API sync
- [ ] Container availability search

### Phase 4: Billing (Week 7-8)
- [ ] Invoice generation
- [ ] Rate management
- [ ] Payment tracking

### Phase 5: Polish (Week 9-10)
- [ ] Real-time updates
- [ ] Mobile responsive design
- [ ] Testing and deployment

---

## 🔐 Security Considerations

- [ ] Environment variables for API keys
- [ ] Row-level security for multi-tenant data
- [ ] Rate limiting on API endpoints
- [ ] Input validation with Zod
- [ ] SQL injection protection (Prisma handles this)
- [ ] Authentication & authorization (NextAuth.js or Clerk)

---

## 📚 Key Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [BullMQ Docs](https://docs.bullmq.io)
- [tRPC Docs](https://trpc.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
