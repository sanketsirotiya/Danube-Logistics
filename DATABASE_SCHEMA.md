# Database Schema - Trucking Logistics System

## Overview

This document defines the complete database schema for the trucking logistics system, including support for:
- **User authentication and role-based access control** (Admin, Dispatcher, Driver, Billing Admin, Customer)
- Multiple customer pricing models (Flat Rate vs Itemized)
- Route-specific pricing
- Flexible billing with itemized breakdowns
- Standardized charge types (wait time, chassis storage, congestion, tolls, etc.)
- Per-hour wait time charge calculations
- Per-day chassis storage tracking
- Terminal API integration
- Container tracking and scheduling

---

## Core Tables

### 1. CUSTOMERS

Manages customer accounts and their pricing preferences.

```typescript
Table: customers
├── id (UUID, PK)
├── name (String, NOT NULL)
├── pricing_type (ENUM: 'FLAT' | 'ITEMIZED', NOT NULL)
├── email (String, UNIQUE)
├── phone (String)
├── billing_address (JSON)
├── payment_terms (Integer) // Days until payment due (e.g., NET 30)
├── active (Boolean, DEFAULT true)
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

**Notes:**
- `pricing_type` can be changed - customers can switch between FLAT and ITEMIZED
- `billing_address` stores full address as JSON: `{ street, city, state, zip, country }`

---

### 2. CUSTOMER_RATES

Stores flat rate agreements for specific routes or general pricing.

```typescript
Table: customer_rates
├── id (UUID, PK)
├── customer_id (UUID, FK → customers, NOT NULL)
├── route_from (String, nullable) // e.g., "Port of LA"
├── route_to (String, nullable)   // e.g., "Warehouse District"
├── container_type (ENUM: '20ft' | '40ft' | '45ft', NOT NULL)
├── flat_rate (Decimal(10,2), NOT NULL)
├── effective_date (Date, NOT NULL)
├── expires_at (Date, nullable) // null = no expiration
├── is_active (Boolean, DEFAULT true)
└── created_at (Timestamp)
```

**Notes:**
- If `route_from` and `route_to` are NULL → applies to all routes (general flat rate)
- If specified → applies only to that specific route
- Multiple rates can exist for same customer (different routes, container types)
- System uses most specific match: route-specific > general rate

**Example Data:**
```
Customer: ABC Corp (pricing_type: FLAT)
Rates:
- Port of LA → Warehouse A, 40ft: $500
- Port of LA → Warehouse B, 40ft: $600
- Any route, 20ft: $350 (fallback)
```

---

### 3. USERS

User authentication and authorization for the system.

```typescript
Table: users
├── id (UUID, PK)
├── email (String, UNIQUE, NOT NULL)
├── password_hash (String, NOT NULL) // Hashed with bcrypt/argon2
├── role (ENUM: 'ADMIN' | 'DISPATCHER' | 'DRIVER' | 'BILLING_ADMIN' | 'CUSTOMER', NOT NULL)
├── driver_id (UUID, FK → drivers, nullable) // Only set if role = 'DRIVER'
├── customer_id (UUID, FK → customers, nullable) // Only set if role = 'CUSTOMER'
├── first_name (String, NOT NULL)
├── last_name (String, NOT NULL)
├── phone (String)
├── is_active (Boolean, DEFAULT true)
├── email_verified (Boolean, DEFAULT false)
├── last_login_at (Timestamp, nullable)
├── password_reset_token (String, nullable)
├── password_reset_expires (Timestamp, nullable)
├── created_at (Timestamp)
├── updated_at (Timestamp)
```

**User Roles:**
- `ADMIN`: Full system access - manage trucks, drivers, customers, rates, settings
- `DISPATCHER`: Can create/manage trips, assign drivers, view schedules
- `DRIVER`: Limited access - view own trips, update trip status, upload documents
- `BILLING_ADMIN`: Can create/edit invoices, manage rates, view financial reports
- `CUSTOMER`: Portal access to view own invoices, trips, and container status

**Relationships:**
- If `role = 'DRIVER'` → `driver_id` must be set (links to DRIVERS table)
- If `role = 'CUSTOMER'` → `customer_id` must be set (links to CUSTOMERS table)
- Other roles don't need these foreign keys

**Example Data:**
```json
[
  {
    "email": "admin@company.com",
    "role": "ADMIN",
    "first_name": "John",
    "last_name": "Admin",
    "driver_id": null,
    "customer_id": null
  },
  {
    "email": "driver1@company.com",
    "role": "DRIVER",
    "first_name": "Mike",
    "last_name": "Johnson",
    "driver_id": "uuid-of-driver-record", // Links to DRIVERS table
    "customer_id": null
  },
  {
    "email": "dispatcher@company.com",
    "role": "DISPATCHER",
    "first_name": "Sarah",
    "last_name": "Smith",
    "driver_id": null,
    "customer_id": null
  },
  {
    "email": "billing@company.com",
    "role": "BILLING_ADMIN",
    "first_name": "Tom",
    "last_name": "Brown",
    "driver_id": null,
    "customer_id": null
  },
  {
    "email": "contact@abccorp.com",
    "role": "CUSTOMER",
    "first_name": "Jane",
    "last_name": "Doe",
    "driver_id": null,
    "customer_id": "uuid-of-abc-corp" // Links to CUSTOMERS table
  }
]
```

**Authentication Flow:**
1. User logs in with email/password
2. System verifies credentials (compare password hash)
3. Generate JWT token with user ID and role
4. Frontend stores token, includes in API requests
5. Backend middleware checks token and role for authorization

**Permission Matrix:**

| Action | ADMIN | DISPATCHER | DRIVER | BILLING_ADMIN | CUSTOMER |
|--------|-------|------------|--------|---------------|----------|
| View all trips | ✅ | ✅ | ❌ (own only) | ✅ | ❌ (own only) |
| Create trip | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update trip status | ✅ | ✅ | ✅ (own only) | ❌ | ❌ |
| Manage trucks | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage drivers | ✅ | ✅ | ❌ | ❌ | ❌ |
| View invoices | ✅ | ❌ | ❌ | ✅ | ✅ (own only) |
| Create invoice | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage rates | ✅ | ❌ | ❌ | ✅ | ❌ |
| System settings | ✅ | ❌ | ❌ | ❌ | ❌ |

**Notes:**
- Store password hashes, never plain text passwords (use bcrypt with salt rounds ≥ 10)
- JWT tokens should expire (e.g., 24 hours) and require refresh
- Consider adding 2FA for admin users
- `email_verified` flag can be used for email verification flow
- `password_reset_token` and expiry for "forgot password" feature
- Drivers can have user accounts (for mobile app access) but not required
- One driver record can have only one user account (1:1 relationship)

---

### 4. CHARGE_TYPES

Reference table for standardizing common charge types across the system.

```typescript
Table: charge_types
├── id (UUID, PK)
├── code (String, UNIQUE, NOT NULL) // e.g., "BASE_RATE", "WAIT_TIME", "CHASSIS_STORAGE"
├── name (String, NOT NULL) // Display name: "Wait Time Charge"
├── description (Text)
├── calculation_unit (ENUM: 'FIXED' | 'PER_HOUR' | 'PER_DAY' | 'PER_MILE', NOT NULL)
├── default_rate (Decimal(10,2), nullable) // Default price if applicable
├── requires_quantity (Boolean, DEFAULT false) // true for hourly, daily charges
├── category (ENUM: 'TRANSPORTATION' | 'STORAGE' | 'FEES' | 'SURCHARGES', NOT NULL)
├── is_active (Boolean, DEFAULT true)
├── display_order (Integer, DEFAULT 0) // For UI sorting
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

**Calculation Units:**
- `FIXED`: One-time charge (tolls, congestion fees)
- `PER_HOUR`: Hourly rate (wait time charges)
- `PER_DAY`: Daily rate (chassis storage)
- `PER_MILE`: Mileage-based (rarely used, future-proofing)

**Example Data:**
```json
[
  {
    "code": "BASE_RATE",
    "name": "Base Transportation Rate",
    "calculation_unit": "FIXED",
    "category": "TRANSPORTATION",
    "requires_quantity": false,
    "default_rate": null
  },
  {
    "code": "WAIT_TIME",
    "name": "Wait Time Charge",
    "description": "Charged when driver waits at pickup/dropoff location",
    "calculation_unit": "PER_HOUR",
    "category": "FEES",
    "requires_quantity": true,
    "default_rate": 75.00
  },
  {
    "code": "CHASSIS_STORAGE",
    "name": "Chassis Storage Fee",
    "description": "Daily storage charge for chassis holding",
    "calculation_unit": "PER_DAY",
    "category": "STORAGE",
    "requires_quantity": true,
    "default_rate": 50.00
  },
  {
    "code": "CONGESTION",
    "name": "Port Congestion Surcharge",
    "calculation_unit": "FIXED",
    "category": "SURCHARGES",
    "requires_quantity": false,
    "default_rate": 75.00
  },
  {
    "code": "TOLL",
    "name": "Highway Tolls",
    "calculation_unit": "FIXED",
    "category": "FEES",
    "requires_quantity": false,
    "default_rate": null
  },
  {
    "code": "FUEL_SURCHARGE",
    "name": "Fuel Surcharge",
    "calculation_unit": "FIXED",
    "category": "SURCHARGES",
    "requires_quantity": false,
    "default_rate": null
  },
  {
    "code": "OVERWEIGHT",
    "name": "Overweight Container Fee",
    "calculation_unit": "FIXED",
    "category": "FEES",
    "requires_quantity": false,
    "default_rate": 150.00
  }
]
```

**Notes:**
- Users can add custom charge types as needed
- `default_rate` is a suggestion - users can override per invoice
- `requires_quantity` = true means the charge needs hours/days/miles input
- This table provides standardization while maintaining flexibility via JSON line_items in invoices

---

### 5. TRUCKS

Fleet management.

```typescript
Table: trucks
├── id (UUID, PK)
├── plate (String, UNIQUE, NOT NULL)
├── vin (String, UNIQUE)
├── make (String)
├── model (String)
├── year (Integer)
├── status (ENUM: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED')
├── current_location (JSON) // { lat, lng, address, updated_at }
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

---

### 6. DRIVERS

Driver information and operational data.

```typescript
Table: drivers
├── id (UUID, PK)
├── name (String, NOT NULL)
├── license (String, UNIQUE, NOT NULL)
├── license_expiry (Date)
├── phone (String)
├── email (String)
├── status (ENUM: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE')
├── hire_date (Date)
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

---

### 7. TERMINALS

External terminal/depot information for API integration.

```typescript
Table: terminals
├── id (UUID, PK)
├── name (String, NOT NULL)
├── code (String, UNIQUE) // Short code like "POLA", "POLB"
├── address (JSON)
├── api_endpoint (String, nullable)
├── api_key (String, nullable, ENCRYPTED)
├── api_config (JSON, nullable) // Custom config per terminal
├── sync_enabled (Boolean, DEFAULT false)
├── sync_interval_minutes (Integer, DEFAULT 5)
├── last_synced_at (Timestamp, nullable)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

**Notes:**
- `api_key` should be encrypted at rest
- `api_config` stores terminal-specific settings (headers, auth method, etc.)

---

### 8. CONTAINERS

Container tracking.

```typescript
Table: containers
├── id (UUID, PK)
├── number (String, UNIQUE, NOT NULL) // Container ID like "ABCU1234567"
├── size (ENUM: '20ft' | '40ft' | '45ft', NOT NULL)
├── type (ENUM: 'DRY' | 'REEFER' | 'TANK' | 'FLAT_RACK')
├── terminal_id (UUID, FK → terminals, nullable)
├── available (Boolean, DEFAULT true)
├── condition (ENUM: 'GOOD' | 'DAMAGED' | 'NEEDS_REPAIR')
├── last_inspection_date (Date)
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

---

### 9. TRIPS (Central Table)

Links everything together - trucks, drivers, containers, customers.

```typescript
Table: trips
├── id (UUID, PK)
├── customer_id (UUID, FK → customers, NOT NULL)
├── truck_id (UUID, FK → trucks, NOT NULL)
├── driver_id (UUID, FK → drivers, NOT NULL)
├── container_id (UUID, FK → containers, NOT NULL)
├── pickup_location (String, NOT NULL)
├── pickup_time (Timestamp)
├── dropoff_location (String, NOT NULL)
├── dropoff_time (Timestamp, nullable)
├── status (ENUM: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED')
├── distance_miles (Decimal(8,2))
├── route (JSON) // Detailed route info: { waypoints, tolls, etc. }
├── chassis_received_at (Timestamp, nullable) // For chassis storage calculation
├── chassis_returned_at (Timestamp, nullable)
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

**Notes:**
- `chassis_received_at` and `chassis_returned_at` used to calculate storage days
- `route` JSON can store: `{ waypoints: [...], has_tolls: true, has_congestion: true }`

---

### 10. INVOICES

Flexible billing with support for both flat and itemized pricing.

```typescript
Table: invoices
├── id (UUID, PK)
├── invoice_number (String, UNIQUE, NOT NULL) // Auto-generated: "INV-2026-0001"
├── trip_id (UUID, FK → trips, NOT NULL, UNIQUE)
├── customer_id (UUID, FK → customers, NOT NULL)
├── pricing_type (ENUM: 'FLAT' | 'ITEMIZED', NOT NULL) // Snapshot at invoice creation
├── line_items (JSON, NOT NULL)
    // Example (type values reference charge_types.code):
    // [
    //   { type: "BASE_RATE", description: "Base transportation", amount: 450.00 },
    //   { type: "WAIT_TIME", description: "Wait time at pickup (2 hrs @ $75)",
    //     quantity: 2, unit_price: 75.00, amount: 150.00 },
    //   { type: "CHASSIS_STORAGE", description: "Chassis storage (3 days @ $50)",
    //     quantity: 3, unit_price: 50.00, amount: 150.00 },
    //   { type: "CONGESTION", description: "Port congestion fee", amount: 75.00 },
    //   { type: "TOLL", description: "Highway tolls", amount: 25.00 }
    // ]
├── subtotal (Decimal(10,2), NOT NULL)
├── tax_rate (Decimal(5,2), DEFAULT 0.00) // e.g., 7.5 for 7.5%
├── tax_amount (Decimal(10,2), DEFAULT 0.00)
├── total_amount (Decimal(10,2), NOT NULL)
├── due_date (Date, NOT NULL)
├── paid (Boolean, DEFAULT false)
├── paid_at (Timestamp, nullable)
├── payment_method (String, nullable) // "CHECK", "ACH", "CREDIT_CARD"
├── notes (Text)
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

**Line Items Structure:**
```typescript
// For FLAT rate customers:
line_items: [
  {
    type: "FLAT_RATE",
    description: "Port of LA → Warehouse A (40ft container)",
    amount: 500.00
  }
]

// For ITEMIZED customers:
line_items: [
  {
    type: "BASE_RATE",
    description: "Base transportation fee",
    amount: 450.00
  },
  {
    type: "WAIT_TIME",
    description: "Wait time at pickup (2 hours @ $75/hr)",
    quantity: 2,
    unit_price: 75.00,
    amount: 150.00
  },
  {
    type: "CHASSIS_STORAGE",
    description: "Chassis storage",
    quantity: 3,
    unit_price: 50.00,
    amount: 150.00
  },
  {
    type: "CONGESTION",
    description: "Port congestion charge",
    amount: 75.00
  },
  {
    type: "TOLL",
    description: "Highway tolls (I-405)",
    amount: 25.00
  }
]
```

**Notes:**
- `pricing_type` is a snapshot - if customer switches pricing model, old invoices retain their type
- `line_items` is flexible JSON array to support any billing structure
- `line_items[].type` should reference `charge_types.code` for standardization
- Even flat rate invoices can show itemized breakdown (for transparency)
- System calculates `subtotal` by summing line_items amounts
- `total_amount` = `subtotal` + `tax_amount`
- Charges with `requires_quantity: true` should include `quantity` and `unit_price` in line items

---

### 11. API_SYNC_LOGS

Tracks terminal API synchronization for debugging and monitoring.

```typescript
Table: api_sync_logs
├── id (UUID, PK)
├── terminal_id (UUID, FK → terminals, NOT NULL)
├── sync_started_at (Timestamp, NOT NULL)
├── sync_completed_at (Timestamp, nullable)
├── status (ENUM: 'SUCCESS' | 'FAILED' | 'PARTIAL', NOT NULL)
├── containers_fetched (Integer, DEFAULT 0)
├── containers_updated (Integer, DEFAULT 0)
├── containers_created (Integer, DEFAULT 0)
├── error_message (Text, nullable)
├── error_details (JSON, nullable)
├── response_time_ms (Integer, nullable)
└── created_at (Timestamp)
```

---

## Relationships Summary

```
USERS 1:1 DRIVERS (optional - one user can be linked to one driver)
USERS 1:1 CUSTOMERS (optional - one user can be linked to one customer)

CUSTOMERS 1:N TRIPS (one customer has many trips)
CUSTOMERS 1:N CUSTOMER_RATES (one customer has many rates)
CUSTOMERS 1:N INVOICES (one customer has many invoices)

TRUCKS 1:N TRIPS (one truck has many trips)
DRIVERS 1:N TRIPS (one driver has many trips)
CONTAINERS 1:N TRIPS (one container used in many trips)

TERMINALS 1:N CONTAINERS (one terminal stores many containers)
TERMINALS 1:N API_SYNC_LOGS (one terminal has many sync logs)

TRIPS 1:1 INVOICES (one trip generates one invoice)
```

---

## Indexes for Performance

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_driver ON users(driver_id);
CREATE INDEX idx_users_customer ON users(customer_id);
CREATE INDEX idx_users_active ON users(is_active);

-- Customers
CREATE INDEX idx_customers_pricing_type ON customers(pricing_type);
CREATE INDEX idx_customers_active ON customers(active);

-- Customer Rates
CREATE INDEX idx_customer_rates_customer ON customer_rates(customer_id);
CREATE INDEX idx_customer_rates_active ON customer_rates(is_active, effective_date);

-- Charge Types
CREATE INDEX idx_charge_types_code ON charge_types(code);
CREATE INDEX idx_charge_types_category ON charge_types(category, is_active);
CREATE INDEX idx_charge_types_active ON charge_types(is_active, display_order);

-- Trips
CREATE INDEX idx_trips_customer ON trips(customer_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_dates ON trips(pickup_time, dropoff_time);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);

-- Invoices
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_paid ON invoices(paid);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_trip ON invoices(trip_id);

-- Containers
CREATE INDEX idx_containers_terminal ON containers(terminal_id);
CREATE INDEX idx_containers_available ON containers(available);
CREATE INDEX idx_containers_number ON containers(number);

-- API Sync Logs
CREATE INDEX idx_sync_logs_terminal ON api_sync_logs(terminal_id);
CREATE INDEX idx_sync_logs_status ON api_sync_logs(status, sync_started_at);
```

---

## Business Logic Examples

### Example 1: Calculate Invoice for Flat Rate Customer

```typescript
// Trip details
const trip = {
  customer_id: "abc-123",
  route_from: "Port of LA",
  route_to: "Warehouse A",
  container_type: "40ft"
};

// 1. Get customer
const customer = await prisma.customer.findUnique({
  where: { id: trip.customer_id }
});

// customer.pricing_type = "FLAT"

// 2. Find matching rate (most specific first)
const rate = await prisma.customerRate.findFirst({
  where: {
    customer_id: trip.customer_id,
    container_type: trip.container_type,
    route_from: trip.route_from,
    route_to: trip.route_to,
    is_active: true,
    effective_date: { lte: new Date() },
    OR: [
      { expires_at: null },
      { expires_at: { gte: new Date() } }
    ]
  }
});

// rate.flat_rate = 500.00

// 3. Create invoice
const invoice = await prisma.invoice.create({
  data: {
    trip_id: trip.id,
    customer_id: trip.customer_id,
    pricing_type: "FLAT",
    line_items: [
      {
        type: "FLAT_RATE",
        description: `${trip.route_from} → ${trip.route_to} (${trip.container_type})`,
        amount: rate.flat_rate
      }
    ],
    subtotal: rate.flat_rate,
    tax_amount: 0,
    total_amount: rate.flat_rate,
    due_date: addDays(new Date(), customer.payment_terms)
  }
});
```

### Example 2: Calculate Invoice for Itemized Customer

```typescript
// Trip with charges
const trip = {
  customer_id: "xyz-456",
  pickup_time: "2026-01-01T08:00:00Z",
  dropoff_time: "2026-01-01T14:00:00Z",
  chassis_received_at: "2025-12-29T10:00:00Z", // 3 days storage
  chassis_returned_at: "2026-01-01T14:00:00Z"
};

// Calculate chassis storage days
const storageDays = differenceInDays(
  trip.chassis_returned_at,
  trip.chassis_received_at
); // 3 days

// User enters charges based on customer setup
const charges = {
  base_rate: 450.00,
  chassis_storage_rate: 50.00,
  has_congestion: true,
  congestion_amount: 75.00,
  has_tolls: true,
  toll_amount: 25.00
};

// Build line items
const line_items = [
  {
    type: "BASE_RATE",
    description: "Base transportation fee",
    amount: charges.base_rate
  },
  {
    type: "CHASSIS_STORAGE",
    description: `Chassis storage (${storageDays} days @ $${charges.chassis_storage_rate})`,
    quantity: storageDays,
    unit_price: charges.chassis_storage_rate,
    amount: storageDays * charges.chassis_storage_rate
  }
];

if (charges.has_congestion) {
  line_items.push({
    type: "CONGESTION",
    description: "Port congestion charge",
    amount: charges.congestion_amount
  });
}

if (charges.has_tolls) {
  line_items.push({
    type: "TOLL",
    description: "Highway tolls",
    amount: charges.toll_amount
  });
}

const subtotal = line_items.reduce((sum, item) => sum + item.amount, 0);

// Create invoice
const invoice = await prisma.invoice.create({
  data: {
    trip_id: trip.id,
    customer_id: trip.customer_id,
    pricing_type: "ITEMIZED",
    line_items: line_items,
    subtotal: subtotal,
    tax_amount: 0,
    total_amount: subtotal,
    due_date: addDays(new Date(), customer.payment_terms)
  }
});

// Result:
// Base Rate: $450.00
// Chassis Storage (3 days @ $50): $150.00
// Congestion: $75.00
// Toll: $25.00
// Total: $700.00
```

### Example 3: Calculate Wait Time Charges (Per Hour)

```typescript
// Scenario: Driver waited 2.5 hours at pickup location

// 1. Get wait time charge type from reference table
const waitChargeType = await prisma.chargeType.findUnique({
  where: { code: "WAIT_TIME" }
});

// waitChargeType = {
//   code: "WAIT_TIME",
//   name: "Wait Time Charge",
//   calculation_unit: "PER_HOUR",
//   default_rate: 75.00,
//   requires_quantity: true
// }

// 2. Calculate wait time from trip data
const trip = {
  scheduled_pickup: "2026-02-09T10:00:00Z",
  actual_pickup_started: "2026-02-09T10:00:00Z",
  actual_pickup_completed: "2026-02-09T12:30:00Z", // 2.5 hours wait
  grace_period_minutes: 15 // First 15 minutes free
};

// Calculate billable wait time
const totalWaitMinutes = differenceInMinutes(
  trip.actual_pickup_completed,
  trip.actual_pickup_started
); // 150 minutes

const billableMinutes = Math.max(0, totalWaitMinutes - trip.grace_period_minutes); // 135 minutes
const billableHours = Math.ceil(billableMinutes / 60); // 3 hours (rounded up)

// 3. Calculate charge
const waitTimeCharge = {
  type: "WAIT_TIME",
  description: `Wait time at pickup (${billableHours} hours @ $${waitChargeType.default_rate}/hr)`,
  quantity: billableHours,
  unit_price: waitChargeType.default_rate,
  amount: billableHours * waitChargeType.default_rate
};

// Result: 3 hours × $75.00 = $225.00

// 4. Add to invoice line items
const line_items = [
  {
    type: "BASE_RATE",
    description: "Base transportation fee",
    amount: 450.00
  },
  waitTimeCharge, // $225.00
  {
    type: "CHASSIS_STORAGE",
    description: "Chassis storage (2 days @ $50)",
    quantity: 2,
    unit_price: 50.00,
    amount: 100.00
  }
];

const subtotal = line_items.reduce((sum, item) => sum + item.amount, 0);
// subtotal = $775.00
```

**Wait Time Calculation Rules:**
- Grace period (typically 15-30 minutes) is not charged
- Round up to nearest hour for billing (2.5 hours = 3 billable hours)
- Can apply to both pickup and dropoff locations
- Rate can be overridden per customer or per incident
- Track timestamps: `wait_started_at`, `wait_ended_at` in trip notes or separate wait_time_logs table

**Alternative: Detailed Wait Time Tracking**

For more granular tracking, consider adding a `wait_time_logs` table:

```typescript
Table: wait_time_logs
├── id (UUID, PK)
├── trip_id (UUID, FK → trips, NOT NULL)
├── location_type (ENUM: 'PICKUP' | 'DROPOFF', NOT NULL)
├── wait_started_at (Timestamp, NOT NULL)
├── wait_ended_at (Timestamp, NOT NULL)
├── duration_minutes (Integer, NOT NULL)
├── grace_period_minutes (Integer, DEFAULT 15)
├── billable_hours (Decimal(4,2), NOT NULL)
├── rate_per_hour (Decimal(10,2), NOT NULL)
├── total_charge (Decimal(10,2), NOT NULL)
├── reason (Text) // "Traffic congestion", "Loading delay", etc.
├── approved_by (String) // Manager approval for disputes
└── created_at (Timestamp)
```

This provides better audit trail and dispute resolution capabilities.

---

## Migration Strategy

### Phase 1: Core Tables
1. customers
2. customer_rates
3. charge_types (reference data)
4. users (authentication/authorization)
5. trucks
6. drivers
7. terminals
8. containers

### Phase 2: Operations
9. trips

### Phase 3: Billing
10. invoices

### Phase 4: Monitoring
11. api_sync_logs

---

## Prisma Schema Preview

```prisma
enum PricingType {
  FLAT
  ITEMIZED
}

enum TripStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum CalculationUnit {
  FIXED
  PER_HOUR
  PER_DAY
  PER_MILE
}

enum ChargeCategory {
  TRANSPORTATION
  STORAGE
  FEES
  SURCHARGES
}

enum UserRole {
  ADMIN
  DISPATCHER
  DRIVER
  BILLING_ADMIN
  CUSTOMER
}

model Customer {
  id             String       @id @default(uuid())
  name           String
  pricing_type   PricingType
  email          String?      @unique
  phone          String?
  billing_address Json?
  payment_terms  Int          @default(30)
  active         Boolean      @default(true)
  notes          String?
  created_at     DateTime     @default(now())
  updated_at     DateTime     @updatedAt

  trips          Trip[]
  rates          CustomerRate[]
  invoices       Invoice[]
  users          User[]

  @@map("customers")
}

model User {
  id                      String    @id @default(uuid())
  email                   String    @unique
  password_hash           String
  role                    UserRole
  driver_id               String?   @unique
  customer_id             String?
  first_name              String
  last_name               String
  phone                   String?
  is_active               Boolean   @default(true)
  email_verified          Boolean   @default(false)
  last_login_at           DateTime?
  password_reset_token    String?
  password_reset_expires  DateTime?
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt

  driver                  Driver?   @relation(fields: [driver_id], references: [id])
  customer                Customer? @relation(fields: [customer_id], references: [id])

  @@index([email])
  @@index([role])
  @@index([driver_id])
  @@index([customer_id])
  @@index([is_active])
  @@map("users")
}

model CustomerRate {
  id             String   @id @default(uuid())
  customer_id    String
  route_from     String?
  route_to       String?
  container_type String
  flat_rate      Decimal  @db.Decimal(10, 2)
  effective_date DateTime
  expires_at     DateTime?
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now())

  customer       Customer @relation(fields: [customer_id], references: [id])

  @@index([customer_id])
  @@map("customer_rates")
}

model ChargeType {
  id                String          @id @default(uuid())
  code              String          @unique
  name              String
  description       String?
  calculation_unit  CalculationUnit
  default_rate      Decimal?        @db.Decimal(10, 2)
  requires_quantity Boolean         @default(false)
  category          ChargeCategory
  is_active         Boolean         @default(true)
  display_order     Int             @default(0)
  notes             String?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt

  @@index([code])
  @@index([category, is_active])
  @@index([is_active, display_order])
  @@map("charge_types")
}

model Trip {
  id                  String      @id @default(uuid())
  customer_id         String
  truck_id            String
  driver_id           String
  container_id        String
  pickup_location     String
  pickup_time         DateTime?
  dropoff_location    String
  dropoff_time        DateTime?
  status              TripStatus
  distance_miles      Decimal?    @db.Decimal(8, 2)
  route               Json?
  chassis_received_at DateTime?
  chassis_returned_at DateTime?
  notes               String?
  created_at          DateTime    @default(now())
  updated_at          DateTime    @updatedAt

  customer            Customer    @relation(fields: [customer_id], references: [id])
  truck               Truck       @relation(fields: [truck_id], references: [id])
  driver              Driver      @relation(fields: [driver_id], references: [id])
  container           Container   @relation(fields: [container_id], references: [id])
  invoice             Invoice?

  @@index([customer_id])
  @@index([status])
  @@map("trips")
}

model Invoice {
  id              String      @id @default(uuid())
  invoice_number  String      @unique
  trip_id         String      @unique
  customer_id     String
  pricing_type    PricingType
  line_items      Json
  subtotal        Decimal     @db.Decimal(10, 2)
  tax_rate        Decimal     @default(0) @db.Decimal(5, 2)
  tax_amount      Decimal     @default(0) @db.Decimal(10, 2)
  total_amount    Decimal     @db.Decimal(10, 2)
  due_date        DateTime
  paid            Boolean     @default(false)
  paid_at         DateTime?
  payment_method  String?
  notes           String?
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt

  trip            Trip        @relation(fields: [trip_id], references: [id])
  customer        Customer    @relation(fields: [customer_id], references: [id])

  @@index([customer_id])
  @@index([paid])
  @@index([due_date])
  @@map("invoices")
}

// Note: Complete Prisma schema would also include:
// - Truck model (with trips relation)
// - Driver model (with trips and user relations)
// - Container model (with trips and terminal relations)
// - Terminal model (with containers and api_sync_logs relations)
// - ApiSyncLog model (with terminal relation)
```

**Note:** This is a preview of the Prisma schema showing key models. The complete `schema.prisma` file would include all 11 tables with full relationships, indexes, and constraints as defined in the table definitions above.

---

**Last Updated:** 2026-02-09
