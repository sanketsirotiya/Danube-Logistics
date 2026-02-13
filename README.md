# Danube Logistics

A comprehensive logistics management system for trucking companies, featuring real-time tracking, billing, scheduling, and dispatch management.

## 🚚 Features

### Core Modules
- **Dashboard & Analytics** - Real-time operational metrics, revenue tracking, fleet utilization
- **Fleet Management** - Truck inventory, maintenance tracking, availability status
- **Driver Management** - Driver profiles, licensing, assignments, and activity logs
- **Customer Management** - Customer accounts, billing preferences, pricing tiers (flat/itemized)
- **Trip Management** - Trip scheduling, routing, status tracking, expenses, and documentation
- **Delivery Orders** - Container tracking, port-to-location delivery coordination
- **Invoicing** - Automated billing, payment tracking, revenue reports
- **Reports** - Driver performance, revenue analysis, trip analytics, expense tracking

### Key Capabilities
- 📦 Container tracking with auto-creation on delivery orders
- 🔗 Delivery order → Trip integration with auto-fill
- 💰 Flexible pricing models (flat rate or itemized)
- 📊 Real-time dashboard with KPIs and trends
- 🧾 Automated invoice generation
- 📍 Trip activity logging and proof of delivery
- 🎯 Priority-based delivery order management

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TanStack Query** (React Query) - Data fetching, caching, and state management
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Relational database

### Testing
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing

### Architecture Highlights
- **Service Layer Pattern** - Centralized API calls with type-safe interfaces
- **Custom React Hooks** - Reusable data fetching logic
- **Automatic Caching** - 1-minute cache with background refetch
- **Request Deduplication** - Multiple components = single API call
- **Optimistic Updates** - Instant UI feedback

## 📋 Prerequisites

- **Node.js** 18+
- **PostgreSQL** 13+
- **npm** or **yarn**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sanketsirotiya/Danube-Logistics.git
cd Danube-Logistics
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/danube_logistics"

# Optional: Node environment
NODE_ENV="development"
```

### 4. Initialize the Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database with sample data (optional)
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Danube-Logistics/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/                      # API route handlers
│   │   │   ├── customers/            # Customer CRUD endpoints
│   │   │   ├── drivers/              # Driver CRUD endpoints
│   │   │   ├── trucks/               # Truck CRUD endpoints
│   │   │   ├── trips/                # Trip management endpoints
│   │   │   ├── invoices/             # Invoice endpoints
│   │   │   ├── delivery-orders/      # Delivery order endpoints
│   │   │   ├── dashboard/            # Dashboard stats endpoint
│   │   │   └── reports/              # Reporting endpoints
│   │   ├── dashboard/                # Dashboard page
│   │   ├── customers/                # Customer management page
│   │   ├── drivers/                  # Driver management page
│   │   ├── trucks/                   # Fleet management page
│   │   ├── trips/                    # Trip management page
│   │   ├── invoices/                 # Invoicing page
│   │   ├── delivery-orders/          # Delivery orders page
│   │   ├── layout.tsx                # Root layout with providers
│   │   └── providers.tsx             # TanStack Query provider
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Base API client with error handling
│   │   │   └── query-client.ts       # TanStack Query configuration
│   │   │
│   │   ├── services/                 # API service layer
│   │   │   ├── customers.service.ts
│   │   │   ├── drivers.service.ts
│   │   │   ├── trucks.service.ts
│   │   │   ├── trips.service.ts
│   │   │   ├── invoices.service.ts
│   │   │   └── delivery-orders.service.ts
│   │   │
│   │   ├── hooks/                    # Custom React Query hooks
│   │   │   ├── customers/
│   │   │   ├── drivers/
│   │   │   ├── trucks/
│   │   │   ├── trips/
│   │   │   ├── invoices/
│   │   │   └── delivery-orders/
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── customer.types.ts
│   │   │   ├── driver.types.ts
│   │   │   ├── truck.types.ts
│   │   │   ├── trip.types.ts
│   │   │   ├── invoice.types.ts
│   │   │   └── delivery-order.types.ts
│   │   │
│   │   └── prisma.ts                 # Prisma client instance
│   │
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Database seeding script
│
├── scripts/
│   └── create-missing-containers.ts  # Utility scripts
│
├── docs/                             # Additional documentation
├── diagrams/                         # System architecture diagrams
└── tests/                            # Test files
```

## 🏗️ Architecture

### Data Flow

```
User Action → React Component → TanStack Query Hook → Service Layer →
API Client → Next.js API Route → Prisma ORM → PostgreSQL
```

### Key Patterns

1. **Service Layer** - All API calls centralized in `src/lib/services/`
2. **Custom Hooks** - Reusable data fetching with `useQuery` and `useMutation`
3. **Type Safety** - Shared TypeScript types across frontend and backend
4. **Automatic Cache Invalidation** - Mutations trigger data refetch
5. **Error Boundaries** - Centralized error handling with custom ApiError class

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Delivery Orders Feature](./DELIVERY_ORDERS_FEATURE.md)
- [Testing Guide](./TESTING_SETUP_GUIDE.md)
- [System Diagrams](./SYSTEM_DIAGRAMS.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database with sample data
npm test             # Run tests
```

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/danube` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 📦 Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - System users with role-based access
- **Customers** - Client companies and billing information
- **Drivers** - Driver profiles and licensing
- **Trucks** - Fleet inventory and status
- **Containers** - Shipping container tracking
- **Terminals** - Port/terminal locations
- **Delivery Orders** - Container delivery requests from customers
- **Trips** - Assigned transport jobs with routing
- **Invoices** - Billing and payment records
- **Trip Activity Logs** - Audit trail for trip updates

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema documentation.

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

Ensure these are configured in your production environment:
- Database connection (`DATABASE_URL`)
- Node environment (`NODE_ENV=production`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Data fetching powered by [TanStack Query](https://tanstack.com/query)
- Database ORM by [Prisma](https://www.prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Danube Logistics** - Streamlining trucking operations with modern technology.
