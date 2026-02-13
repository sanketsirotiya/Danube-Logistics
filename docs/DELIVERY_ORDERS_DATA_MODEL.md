# Delivery Orders - Data Model & Relationships

## 📊 Overview

The Delivery Orders feature manages container delivery requests from clients, tracking the complete lifecycle from order placement to final delivery. This document details the database schema, relationships, and business logic.

---

## 🗃️ Database Schema

### DeliveryOrder Table

```sql
CREATE TABLE "delivery_orders" (
    "id" TEXT PRIMARY KEY,
    "order_number" TEXT UNIQUE NOT NULL,
    "customer_id" TEXT NOT NULL,

    -- Container Information
    "container_number" TEXT,
    "container_size" "ContainerSize",  -- TWENTY_FT, FORTY_FT, FORTY_FIVE_FT
    "container_type" "ContainerType",  -- DRY, REEFER, TANK, FLAT_RACK
    "weight" DECIMAL(10,2),
    "cargo_description" TEXT,

    -- Order Management
    "status" "DeliveryOrderStatus" DEFAULT 'PENDING' NOT NULL,
    "priority" "DeliveryPriority" DEFAULT 'STANDARD' NOT NULL,

    -- Location Details
    "port_of_loading" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "delivery_city" TEXT,
    "delivery_state" TEXT,
    "delivery_zip" TEXT,

    -- Scheduling
    "requested_pickup_date" TIMESTAMP,
    "requested_delivery_date" TIMESTAMP,
    "actual_pickup_date" TIMESTAMP,
    "actual_delivery_date" TIMESTAMP,

    -- References & Documentation
    "customer_reference" TEXT,
    "booking_number" TEXT,
    "bill_of_lading" TEXT,

    -- Assignment
    "trip_id" TEXT UNIQUE,
    "assigned_driver_id" TEXT,
    "assigned_truck_id" TEXT,

    -- Additional Details
    "special_instructions" TEXT,
    "notes" TEXT,

    -- Timestamps
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,

    -- Foreign Keys
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT,
    FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL
);

-- Indexes for Performance
CREATE UNIQUE INDEX "delivery_orders_order_number_key" ON "delivery_orders"("order_number");
CREATE UNIQUE INDEX "delivery_orders_trip_id_key" ON "delivery_orders"("trip_id");
CREATE INDEX "delivery_orders_customer_id_idx" ON "delivery_orders"("customer_id");
CREATE INDEX "delivery_orders_status_idx" ON "delivery_orders"("status");
CREATE INDEX "delivery_orders_priority_idx" ON "delivery_orders"("priority");
CREATE INDEX "delivery_orders_container_number_idx" ON "delivery_orders"("container_number");
CREATE INDEX "delivery_orders_requested_delivery_date_idx" ON "delivery_orders"("requested_delivery_date");
```

---

## 🔗 Relationships

### 1. DeliveryOrder → Customer (Many-to-One)

```typescript
// Prisma Schema
model DeliveryOrder {
  id          String   @id @default(uuid())
  customerId  String   @map("customer_id")
  customer    Customer @relation(fields: [customerId], references: [id])
  // ...
}

model Customer {
  id             String          @id @default(uuid())
  deliveryOrders DeliveryOrder[]
  // ...
}
```

**Business Logic:**
- Each delivery order belongs to exactly one customer
- Customers can have multiple delivery orders
- Customer deletion is restricted if they have orders (ON DELETE RESTRICT)
- Customer information is embedded in API responses for quick access

**Query Example:**
```typescript
const ordersWithCustomers = await prisma.deliveryOrder.findMany({
  include: {
    customer: {
      select: {
        name: true,
        email: true,
        phone: true
      }
    }
  }
});
```

---

### 2. DeliveryOrder ← Trip (One-to-One, Optional)

```typescript
// Prisma Schema
model DeliveryOrder {
  id     String  @id @default(uuid())
  tripId String? @unique @map("trip_id")
  trip   Trip?   @relation(fields: [tripId], references: [id])
  // ...
}

model Trip {
  id            String         @id @default(uuid())
  deliveryOrder DeliveryOrder?
  // ...
}
```

**Business Logic:**
- Delivery order can exist without a trip (initial PENDING state)
- Once assigned to a trip, the relationship is one-to-one
- Trip ID is unique per order (one trip can't fulfill multiple orders)
- If trip is deleted, order's tripId is set to NULL (ON DELETE SET NULL)
- Order status syncs with trip status when linked

**Status Synchronization:**
| Order Status | Trip Status | When |
|--------------|-------------|------|
| PENDING | - | Before assignment |
| ASSIGNED | SCHEDULED | Trip created |
| IN_TRANSIT | IN_PROGRESS | Driver starts trip |
| DELIVERED | COMPLETED | Driver completes delivery |

---

## 📊 Enums & Status Values

### DeliveryOrderStatus

```typescript
enum DeliveryOrderStatus {
  PENDING      // Order created, awaiting assignment
  ASSIGNED     // Assigned to driver/truck/trip
  IN_TRANSIT   // Container picked up, en route
  DELIVERED    // Successfully delivered
  CANCELLED    // Order cancelled
}
```

**State Transitions:**
```
PENDING → ASSIGNED → IN_TRANSIT → DELIVERED
   ↓          ↓           ↓
CANCELLED  CANCELLED  CANCELLED
```

**Business Rules:**
1. New orders start as PENDING
2. Setting to IN_TRANSIT automatically records `actual_pickup_date`
3. Setting to DELIVERED automatically records `actual_delivery_date`
4. DELIVERED and CANCELLED are terminal states (no further transitions)

---

### DeliveryPriority

```typescript
enum DeliveryPriority {
  STANDARD  // Normal delivery timeline (3-5 days)
  URGENT    // Expedited delivery (1-2 days)
  CRITICAL  // Same-day or emergency delivery
}
```

**UI Color Coding:**
- STANDARD: Gray
- URGENT: Orange
- CRITICAL: Red

---

## 🎯 Business Logic & Validations

### Order Number Generation

```typescript
// Format: DO-{timestamp}-{random}
// Example: DO-1770918376236-874

function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `DO-${timestamp}-${random}`;
}
```

**Properties:**
- Unique across all orders
- Sortable by creation time
- Human-readable
- Short enough for reference in communication

---

### Date Field Logic

| Field | Set When | Nullable | Purpose |
|-------|----------|----------|---------|
| `requested_pickup_date` | User input | Yes | Customer's preferred pickup date |
| `requested_delivery_date` | User input | Yes | Customer's target delivery date |
| `actual_pickup_date` | Status → IN_TRANSIT | Yes | When container was actually picked up |
| `actual_delivery_date` | Status → DELIVERED | Yes | When delivery was completed |
| `created_at` | Row insert | No | Order creation timestamp |
| `updated_at` | Row update | No | Last modification timestamp |

**Validation Rules:**
- `requested_delivery_date` should be after `requested_pickup_date`
- `actual_pickup_date` is auto-set when status changes to IN_TRANSIT
- `actual_delivery_date` is auto-set when status changes to DELIVERED
- Cannot modify actual dates once set (data integrity)

---

### Container Information

**ContainerSize Enum:**
- `TWENTY_FT` - 20-foot standard container
- `FORTY_FT` - 40-foot standard container
- `FORTY_FIVE_FT` - 45-foot high cube container

**ContainerType Enum:**
- `DRY` - Standard dry goods container
- `REEFER` - Refrigerated container
- `TANK` - Tank container for liquids
- `FLAT_RACK` - Flat rack for oversized cargo

**Weight Field:**
- Stored as DECIMAL(10,2)
- Measured in pounds
- Range: 0.00 to 99,999,999.99
- Used for truck capacity planning

---

## 🔍 Common Queries

### 1. Get All Pending Orders

```typescript
const pendingOrders = await prisma.deliveryOrder.findMany({
  where: { status: 'PENDING' },
  include: {
    customer: {
      select: { name: true, phone: true }
    }
  },
  orderBy: { priority: 'desc' }  // Critical first
});
```

---

### 2. Get Orders by Date Range

```typescript
const ordersInRange = await prisma.deliveryOrder.findMany({
  where: {
    requested_delivery_date: {
      gte: startDate,
      lte: endDate
    }
  },
  orderBy: { requested_delivery_date: 'asc' }
});
```

---

### 3. Get Orders for Specific Customer

```typescript
const customerOrders = await prisma.deliveryOrder.findMany({
  where: { customerId: 'customer-uuid' },
  orderBy: { created_at: 'desc' }
});
```

---

### 4. Get Urgent/Critical Orders

```typescript
const urgentOrders = await prisma.deliveryOrder.findMany({
  where: {
    priority: { in: ['URGENT', 'CRITICAL'] },
    status: { not: 'DELIVERED' }
  },
  orderBy: [
    { priority: 'desc' },
    { requested_delivery_date: 'asc' }
  ]
});
```

---

### 5. Get Order with Full Trip Details

```typescript
const orderDetail = await prisma.deliveryOrder.findUnique({
  where: { id: orderId },
  include: {
    customer: true,
    trip: {
      include: {
        driver: true,
        truck: true,
        container: true
      }
    }
  }
});
```

---

## 📈 Performance Optimization

### Indexes Created

1. **order_number** (UNIQUE) - Fast lookup by order number
2. **trip_id** (UNIQUE) - Enforce one-to-one relationship
3. **customer_id** - Fast customer order queries
4. **status** - Filter by order status
5. **priority** - Sort/filter by priority
6. **container_number** - Search by container
7. **requested_delivery_date** - Date range queries

### Query Optimization Tips

1. **Use select to limit fields:**
```typescript
// ❌ Bad - fetches all fields
const orders = await prisma.deliveryOrder.findMany();

// ✅ Good - only fetches needed fields
const orders = await prisma.deliveryOrder.findMany({
  select: {
    id: true,
    orderNumber: true,
    status: true,
    customer: { select: { name: true } }
  }
});
```

2. **Paginate large result sets:**
```typescript
const page = 1;
const pageSize = 20;

const orders = await prisma.deliveryOrder.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { created_at: 'desc' }
});
```

3. **Use cursor-based pagination for infinite scroll:**
```typescript
const orders = await prisma.deliveryOrder.findMany({
  take: 20,
  cursor: lastOrderId ? { id: lastOrderId } : undefined,
  orderBy: { created_at: 'desc' }
});
```

---

## 🔒 Data Integrity Rules

### Foreign Key Constraints

1. **Customer Reference:**
   - `ON DELETE RESTRICT` - Cannot delete customer with orders
   - `ON UPDATE CASCADE` - Customer ID updates propagate

2. **Trip Reference:**
   - `ON DELETE SET NULL` - Deleting trip clears order's tripId
   - `ON UPDATE CASCADE` - Trip ID updates propagate

### Unique Constraints

1. **order_number** - No duplicate order numbers
2. **trip_id** - One trip per order, one order per trip

### Check Constraints (Application Level)

```typescript
// Validate dates
if (requested_delivery_date < requested_pickup_date) {
  throw new Error('Delivery date must be after pickup date');
}

// Validate status transitions
const validTransitions = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],  // Terminal state
  CANCELLED: []   // Terminal state
};

if (!validTransitions[currentStatus].includes(newStatus)) {
  throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
}
```

---

## 🧪 Test Data Examples

### Minimal Order (Required Fields Only)

```json
{
  "customerId": "uuid-123",
  "portOfLoading": "Port of Los Angeles",
  "deliveryAddress": "123 Main St, Long Beach, CA 90802"
}
```

### Complete Order

```json
{
  "customerId": "uuid-123",
  "containerNumber": "ABCD1234567",
  "containerSize": "FORTY_FT",
  "containerType": "DRY",
  "weight": 25000.00,
  "cargoDescription": "Electronics and machinery",
  "status": "PENDING",
  "priority": "URGENT",
  "portOfLoading": "Port of Los Angeles - Terminal A",
  "deliveryAddress": "456 Industrial Blvd",
  "deliveryCity": "Commerce",
  "deliveryState": "CA",
  "deliveryZip": "90040",
  "requestedPickupDate": "2026-02-12T08:00:00Z",
  "requestedDeliveryDate": "2026-02-15T17:00:00Z",
  "customerReference": "PO-2024-001",
  "bookingNumber": "BOOK-ABC-123",
  "billOfLading": "BOL-789456",
  "specialInstructions": "Fragile - handle with care. Requires lift gate for unloading.",
  "notes": "Customer prefers delivery between 9 AM - 3 PM"
}
```

---

## 📊 Reporting Queries

### Daily Delivery Summary

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const summary = await prisma.deliveryOrder.groupBy({
  by: ['status'],
  where: {
    created_at: { gte: today }
  },
  _count: true
});
```

### Customer Performance Report

```typescript
const report = await prisma.customer.findMany({
  include: {
    deliveryOrders: {
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    },
    _count: {
      select: { deliveryOrders: true }
    }
  }
});
```

### On-Time Delivery Rate

```typescript
const deliveredOrders = await prisma.deliveryOrder.findMany({
  where: {
    status: 'DELIVERED',
    actual_delivery_date: { not: null },
    requested_delivery_date: { not: null }
  },
  select: {
    actual_delivery_date: true,
    requested_delivery_date: true
  }
});

const onTime = deliveredOrders.filter(order =>
  order.actual_delivery_date <= order.requested_delivery_date
).length;

const onTimeRate = (onTime / deliveredOrders.length) * 100;
```

---

*Last Updated: February 2026*
*Version: 1.0.0*
