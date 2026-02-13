# Danube Logistics - System Diagrams

## 📊 Entity Relationship Diagram

```mermaid
erDiagram
    CUSTOMERS ||--o{ DELIVERY_ORDERS : "places"
    CUSTOMERS ||--o{ TRIPS : "books"
    CUSTOMERS ||--o{ INVOICES : "receives"
    CUSTOMERS ||--o{ CUSTOMER_RATES : "has"

    DELIVERY_ORDERS ||--o| TRIPS : "assigned to"
    DELIVERY_ORDERS {
        uuid id PK
        string order_number UK
        uuid customer_id FK
        string container_number
        enum container_size
        enum container_type
        enum status
        enum priority
        string port_of_loading
        string delivery_address
        datetime requested_pickup_date
        datetime requested_delivery_date
        datetime actual_pickup_date
        datetime actual_delivery_date
        string customer_reference
        string booking_number
        string bill_of_lading
        uuid trip_id FK
        text special_instructions
        datetime created_at
        datetime updated_at
    }

    TRIPS ||--|| TRUCKS : "uses"
    TRIPS ||--|| DRIVERS : "assigned to"
    TRIPS ||--|| CONTAINERS : "transports"
    TRIPS ||--o| INVOICES : "generates"
    TRIPS ||--o{ TRIP_EXPENSES : "incurs"
    TRIPS ||--o{ TRIP_DOCUMENTS : "has"
    TRIPS {
        uuid id PK
        uuid customer_id FK
        uuid truck_id FK
        uuid driver_id FK
        uuid container_id FK
        uuid delivery_order_id FK
        string origin
        string destination
        datetime pickup_time
        datetime delivery_time
        enum status
        decimal rate_amount
        datetime created_at
        datetime updated_at
    }

    TRUCKS ||--o{ TRIPS : "performs"
    TRUCKS {
        uuid id PK
        string plate UK
        string vin
        string model
        enum status
        point current_location
        datetime created_at
    }

    DRIVERS ||--o{ TRIPS : "performs"
    DRIVERS {
        uuid id PK
        string name
        string license
        string phone
        enum status
        datetime created_at
    }

    CONTAINERS ||--o{ TRIPS : "transported in"
    CONTAINERS ||--|| TERMINALS : "located at"
    CONTAINERS {
        uuid id PK
        string number UK
        enum size
        enum type
        uuid terminal_id FK
        boolean available
        datetime created_at
    }

    TERMINALS ||--o{ CONTAINERS : "stores"
    TERMINALS ||--o{ API_SYNC_LOGS : "syncs"
    TERMINALS {
        uuid id PK
        string name
        string api_endpoint
        string api_key
        datetime created_at
    }

    INVOICES {
        uuid id PK
        uuid customer_id FK
        uuid trip_id FK
        decimal amount
        datetime due_date
        boolean paid
        datetime created_at
    }

    CUSTOMER_RATES {
        uuid id PK
        uuid customer_id FK
        string route_from
        string route_to
        enum container_type
        decimal flat_rate
        datetime effective_date
    }

    API_SYNC_LOGS {
        uuid id PK
        uuid terminal_id FK
        datetime sync_started_at
        enum status
        int containers_fetched
        datetime created_at
    }
```

---

## 🔄 Delivery Order Status Flow

```mermaid
stateDiagram-v2
    [*] --> PENDING: Order Created
    PENDING --> ASSIGNED: Driver/Truck Assigned
    ASSIGNED --> IN_TRANSIT: Container Picked Up
    IN_TRANSIT --> DELIVERED: Delivery Completed

    PENDING --> CANCELLED: Order Cancelled
    ASSIGNED --> CANCELLED: Order Cancelled
    IN_TRANSIT --> CANCELLED: Order Cancelled

    DELIVERED --> [*]
    CANCELLED --> [*]

    note right of PENDING
        Initial state when order
        is received from customer
    end note

    note right of IN_TRANSIT
        Actual pickup date recorded
        when entering this state
    end note

    note right of DELIVERED
        Actual delivery date recorded
        when entering this state
    end note
```

---

## 🚚 Complete Delivery Order Workflow

```mermaid
sequenceDiagram
    participant Customer
    participant CSR as Customer Service
    participant DO as Delivery Orders
    participant Dispatcher
    participant Trip as Trip Management
    participant Driver
    participant System

    Customer->>CSR: Request container delivery
    CSR->>DO: Create delivery order
    DO->>System: Generate order number
    DO->>System: Set status = PENDING
    System-->>DO: Order created
    DO-->>CSR: Order confirmation

    Note over DO,Dispatcher: Order appears in pending queue

    Dispatcher->>DO: Review pending orders
    Dispatcher->>Trip: Create trip for order
    Trip->>System: Assign truck & driver
    Trip->>DO: Link trip to order
    System->>DO: Update status = ASSIGNED

    Driver->>System: Start trip
    Driver->>System: Pick up container from port
    System->>DO: Update status = IN_TRANSIT
    System->>DO: Record actual pickup time

    Driver->>System: Navigate to delivery address
    Driver->>System: Complete delivery
    System->>DO: Update status = DELIVERED
    System->>DO: Record actual delivery time

    System->>Trip: Mark trip complete
    System->>Customer: Send delivery confirmation

    Note over System,Customer: Invoice generated automatically
```

---

## 🏗️ System Architecture with Delivery Orders

```mermaid
flowchart TB
    subgraph Browser["Browser Layer"]
        UI[Next.js Frontend]
        DOPage[Delivery Orders Page]
        Dashboard[Dispatch Dashboard]
        TripPage[Trip Management]
    end

    subgraph Server["Next.js Server"]
        API[API Routes]
        DOAPI[/api/delivery-orders]
        TripAPI[/api/trips]
        SA[Server Actions]
    end

    subgraph Database["PostgreSQL"]
        DOTable[(delivery_orders)]
        TripTable[(trips)]
        CustomerTable[(customers)]
        ContainerTable[(containers)]
    end

    subgraph Queue["Background Jobs"]
        BullMQ[BullMQ Queue]
        Sync[Terminal Sync Worker]
        Invoice[Invoice Generator]
    end

    UI --> API
    DOPage --> DOAPI
    Dashboard --> API
    TripPage --> TripAPI

    DOAPI --> DOTable
    TripAPI --> TripTable
    DOAPI --> CustomerTable
    TripAPI --> ContainerTable

    DOTable -.Link.- TripTable
    DOTable -.Reference.- CustomerTable

    BullMQ --> Sync
    BullMQ --> Invoice
    Sync --> ContainerTable
    Invoice --> TripTable

    style DOTable fill:#06b6d4
    style DOPage fill:#06b6d4
    style DOAPI fill:#06b6d4
```

---

## 📱 Component Architecture

```mermaid
graph LR
    subgraph Pages["Next.js Pages"]
        Home[Home Page]
        DOList[Delivery Orders List]
        DODetail[Order Detail View]
        DOForm[Order Form]
    end

    subgraph Components["Shared Components"]
        Stats[Statistics Cards]
        Table[Data Table]
        Form[Form Components]
        Timeline[Timeline View]
        StatusBadge[Status Badge]
    end

    subgraph API["API Layer"]
        GET[GET /api/delivery-orders]
        POST[POST /api/delivery-orders]
        PUT[PUT /api/delivery-orders/:id]
        DELETE[DELETE /api/delivery-orders/:id]
    end

    subgraph Database["Prisma + PostgreSQL"]
        Prisma[Prisma Client]
        DB[(Database)]
    end

    Home --> DOList
    DOList --> DODetail
    DOList --> DOForm

    DOList --> Stats
    DOList --> Table
    DOForm --> Form
    DODetail --> Timeline
    DODetail --> StatusBadge

    DOList --> GET
    DOForm --> POST
    DODetail --> PUT
    DODetail --> DELETE

    GET --> Prisma
    POST --> Prisma
    PUT --> Prisma
    DELETE --> Prisma

    Prisma --> DB

    style DOList fill:#06b6d4
    style DODetail fill:#06b6d4
    style DOForm fill:#06b6d4
```

---

## 🔐 Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextAuth
    participant Database
    participant ProtectedPage as Protected Page

    User->>Browser: Access delivery-orders
    Browser->>NextAuth: Check session

    alt No Session
        NextAuth->>Browser: Redirect to login
        Browser->>User: Show login page
        User->>NextAuth: Submit credentials
        NextAuth->>Database: Validate user
        Database-->>NextAuth: User verified
        NextAuth->>Browser: Create session
    else Has Valid Session
        NextAuth->>ProtectedPage: Allow access
        ProtectedPage->>Database: Fetch delivery orders
        Database-->>ProtectedPage: Return data
        ProtectedPage->>Browser: Render page
    end

    Browser->>User: Display page
```

---

## 📊 Data Flow: Creating a Delivery Order

```mermaid
flowchart TD
    Start([User clicks New Order]) --> Form[Fill Delivery Order Form]
    Form --> Validate{Valid Data?}

    Validate -->|No| Error[Show Validation Errors]
    Error --> Form

    Validate -->|Yes| Generate[Generate Order Number]
    Generate --> Create[POST /api/delivery-orders]
    Create --> Prisma[Prisma.deliveryOrder.create]

    Prisma --> DB[(Database INSERT)]
    DB --> Response[Return Created Order]
    Response --> UI[Update UI]

    UI --> ShowStats[Update Statistics]
    UI --> AddToTable[Add to Order Table]
    UI --> ResetForm[Reset Form]

    ShowStats --> End([Success])
    AddToTable --> End
    ResetForm --> End

    style Start fill:#10b981
    style End fill:#10b981
    style Error fill:#ef4444
    style DB fill:#06b6d4
```

---

## 🗂️ File Structure

```
src/
├── app/
│   ├── page.tsx                          # Home page with nav tiles
│   ├── delivery-orders/
│   │   ├── page.tsx                      # List & Create orders
│   │   └── [id]/
│   │       └── page.tsx                  # Order detail & status updates
│   ├── trips/
│   │   └── page.tsx                      # Trip management
│   ├── api/
│   │   ├── delivery-orders/
│   │   │   ├── route.ts                  # GET, POST endpoints
│   │   │   └── [id]/
│   │   │       └── route.ts              # GET, PUT, DELETE endpoints
│   │   └── trips/
│   │       └── route.ts                  # Trip API
│   └── layout.tsx
├── lib/
│   └── prisma.ts                         # Prisma client singleton
└── prisma/
    ├── schema.prisma                     # Database schema
    └── migrations/
        └── add_delivery_orders.sql       # Migration file
```

---

## 🎨 UI Component Hierarchy

```
DeliveryOrdersPage
├── Header
│   ├── Title & Description
│   ├── Home Button
│   └── New Order Button
├── Statistics Cards
│   ├── Total Orders
│   ├── Pending
│   ├── In Transit
│   └── Delivered
├── Order Form (conditional)
│   ├── Customer Select
│   ├── Container Details
│   ├── Location Inputs
│   ├── Date Pickers
│   ├── Reference Fields
│   └── Submit/Cancel Buttons
└── Orders Table
    ├── Table Header
    ├── Table Body
    │   └── Order Rows
    │       ├── Order Number
    │       ├── Customer Name
    │       ├── Container Info
    │       ├── Route
    │       ├── Delivery Date
    │       ├── Status Badge
    │       ├── Priority Badge
    │       └── Action Buttons
    │           ├── View
    │           ├── Edit
    │           └── Delete
    └── Empty State (if no orders)
```

---

## 🔄 Integration Points

```mermaid
graph TB
    DO[Delivery Orders]
    Customers[Customers]
    Trips[Trips]
    Containers[Containers]
    Invoices[Invoices]
    Drivers[Drivers]
    Trucks[Trucks]

    DO -->|References| Customers
    DO -.->|Can link to| Trips
    Trips -->|Transports| Containers
    Trips -->|Generates| Invoices
    Trips -->|Assigned to| Drivers
    Trips -->|Uses| Trucks

    style DO fill:#06b6d4,stroke:#0891b2,stroke-width:3px
    style Trips fill:#8b5cf6,stroke:#7c3aed
    style Customers fill:#f59e0b,stroke:#d97706
```

---

## 📈 Future Enhancements

```mermaid
mindmap
  root((Delivery Orders))
    Current Features
      CRUD Operations
      Status Tracking
      Priority Levels
      Customer Integration
      Timeline View
    Phase 2
      Auto Trip Creation
      Driver Assignment UI
      Email Notifications
      PDF Export
    Phase 3
      Customer Portal
      Real-time GPS
      Photo Uploads
      Digital Signatures
    Phase 4
      Mobile Driver App
      Route Optimization
      Analytics Dashboard
      Bulk CSV Import
```

---

## 🎯 Technology Stack Diagram

```mermaid
graph TB
    subgraph Frontend
        React[React 18]
        Next[Next.js 16]
        TS[TypeScript]
        Tailwind[Tailwind CSS]
    end

    subgraph Backend
        API[Next.js API Routes]
        Prisma[Prisma ORM]
        Zod[Zod Validation]
    end

    subgraph Database
        PG[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    subgraph External
        TerminalAPI[Terminal APIs]
        BullMQ[BullMQ Jobs]
    end

    React --> Next
    Next --> API
    API --> Prisma
    API --> Zod
    Prisma --> PG
    API --> Redis
    BullMQ --> TerminalAPI
    BullMQ --> PG

    style Next fill:#06b6d4
    style Prisma fill:#06b6d4
    style PG fill:#06b6d4
```

---

*Last Updated: February 2026*
*Delivery Orders Feature: v1.0.0*
