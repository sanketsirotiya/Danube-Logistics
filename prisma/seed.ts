import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (in development only)
  console.log('🗑️  Clearing existing data...');
  await prisma.apiSyncLog.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.container.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.customerRate.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.chargeType.deleteMany();
  console.log('✅ Cleared existing data\n');

  // 1. Create Charge Types
  console.log('📝 Creating charge types...');
  const chargeTypes = await prisma.chargeType.createMany({
    data: [
      {
        code: 'BASE_RATE',
        name: 'Base Transportation Rate',
        description: 'Standard transportation fee for container delivery',
        calculationUnit: 'FIXED',
        category: 'TRANSPORTATION',
        requiresQuantity: false,
        displayOrder: 1,
      },
      {
        code: 'WAIT_TIME',
        name: 'Wait Time Charge',
        description: 'Charged when driver waits at pickup/dropoff location',
        calculationUnit: 'PER_HOUR',
        category: 'FEES',
        requiresQuantity: true,
        defaultRate: 75.00,
        displayOrder: 2,
      },
      {
        code: 'CHASSIS_STORAGE',
        name: 'Chassis Storage Fee',
        description: 'Daily storage charge for chassis holding',
        calculationUnit: 'PER_DAY',
        category: 'STORAGE',
        requiresQuantity: true,
        defaultRate: 50.00,
        displayOrder: 3,
      },
      {
        code: 'CONGESTION',
        name: 'Port Congestion Surcharge',
        description: 'Additional fee during high traffic periods',
        calculationUnit: 'FIXED',
        category: 'SURCHARGES',
        requiresQuantity: false,
        defaultRate: 75.00,
        displayOrder: 4,
      },
      {
        code: 'TOLL',
        name: 'Highway Tolls',
        description: 'Toll road charges',
        calculationUnit: 'FIXED',
        category: 'FEES',
        requiresQuantity: false,
        displayOrder: 5,
      },
      {
        code: 'FUEL_SURCHARGE',
        name: 'Fuel Surcharge',
        description: 'Variable fuel cost adjustment',
        calculationUnit: 'FIXED',
        category: 'SURCHARGES',
        requiresQuantity: false,
        displayOrder: 6,
      },
      {
        code: 'OVERWEIGHT',
        name: 'Overweight Container Fee',
        description: 'Additional charge for overweight containers',
        calculationUnit: 'FIXED',
        category: 'FEES',
        requiresQuantity: false,
        defaultRate: 150.00,
        displayOrder: 7,
      },
    ],
  });
  console.log(`✅ Created ${chargeTypes.count} charge types\n`);

  // 2. Create Customers
  console.log('👥 Creating customers...');
  const customer1 = await prisma.customer.create({
    data: {
      name: 'ABC Logistics Corp',
      pricingType: 'FLAT',
      email: 'billing@abclogistics.com',
      phone: '555-0101',
      billingAddress: {
        street: '123 Harbor Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001',
        country: 'USA',
      },
      paymentTerms: 30,
      active: true,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Pacific Imports Inc',
      pricingType: 'ITEMIZED',
      email: 'accounting@pacificimports.com',
      phone: '555-0102',
      billingAddress: {
        street: '456 Ocean Ave',
        city: 'Long Beach',
        state: 'CA',
        zip: '90802',
        country: 'USA',
      },
      paymentTerms: 45,
      active: true,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Global Trade Solutions',
      pricingType: 'FLAT',
      email: 'finance@globaltradesolutions.com',
      phone: '555-0103',
      billingAddress: {
        street: '789 Port Rd',
        city: 'San Pedro',
        state: 'CA',
        zip: '90731',
        country: 'USA',
      },
      paymentTerms: 30,
      active: true,
    },
  });
  console.log(`✅ Created 3 customers\n`);

  // 3. Create Customer Rates (for flat rate customers)
  console.log('💰 Creating customer rates...');
  await prisma.customerRate.createMany({
    data: [
      {
        customerId: customer1.id,
        routeFrom: 'Port of LA',
        routeTo: 'Warehouse District A',
        containerType: 'FORTY_FT',
        flatRate: 500.00,
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
      },
      {
        customerId: customer1.id,
        routeFrom: 'Port of LA',
        routeTo: 'Warehouse District B',
        containerType: 'FORTY_FT',
        flatRate: 600.00,
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
      },
      {
        customerId: customer1.id,
        routeFrom: null,
        routeTo: null,
        containerType: 'TWENTY_FT',
        flatRate: 350.00,
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
      },
      {
        customerId: customer3.id,
        routeFrom: 'Port of Long Beach',
        routeTo: 'Commerce District',
        containerType: 'FORTY_FT',
        flatRate: 550.00,
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
      },
    ],
  });
  console.log(`✅ Created 4 customer rates\n`);

  // 4. Create Trucks
  console.log('🚚 Creating trucks...');
  await prisma.truck.createMany({
    data: [
      {
        plate: 'CA-TRK-001',
        vin: '1HGBH41JXMN109186',
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2022,
        status: 'AVAILABLE',
        currentLocation: {
          lat: 33.7701,
          lng: -118.1937,
          address: 'Port of Long Beach',
          updatedAt: new Date().toISOString(),
        },
      },
      {
        plate: 'CA-TRK-002',
        vin: '1HGBH41JXMN109187',
        make: 'Kenworth',
        model: 'T680',
        year: 2023,
        status: 'AVAILABLE',
        currentLocation: {
          lat: 33.7405,
          lng: -118.2720,
          address: 'Port of Los Angeles',
          updatedAt: new Date().toISOString(),
        },
      },
      {
        plate: 'CA-TRK-003',
        vin: '1HGBH41JXMN109188',
        make: 'Peterbilt',
        model: '579',
        year: 2021,
        status: 'MAINTENANCE',
        notes: 'Scheduled maintenance - oil change and tire rotation',
      },
      {
        plate: 'CA-TRK-004',
        vin: '1HGBH41JXMN109189',
        make: 'Volvo',
        model: 'VNL 760',
        year: 2023,
        status: 'IN_USE',
        currentLocation: {
          lat: 34.0522,
          lng: -118.2437,
          address: 'Downtown LA',
          updatedAt: new Date().toISOString(),
        },
      },
      {
        plate: 'CA-TRK-005',
        vin: '1HGBH41JXMN109190',
        make: 'Mack',
        model: 'Anthem',
        year: 2022,
        status: 'AVAILABLE',
      },
      {
        plate: 'CA-TRK-006',
        vin: '1HGBH41JXMN109191',
        make: 'International',
        model: 'LT Series',
        year: 2021,
        status: 'IN_USE',
      },
      {
        plate: 'CA-TRK-007',
        vin: '1HGBH41JXMN109192',
        make: 'Freightliner',
        model: 'Coronado',
        year: 2020,
        status: 'AVAILABLE',
      },
      {
        plate: 'CA-TRK-008',
        vin: '1HGBH41JXMN109193',
        make: 'Kenworth',
        model: 'W900',
        year: 2024,
        status: 'AVAILABLE',
        notes: 'Brand new truck - just acquired',
      },
      {
        plate: 'CA-TRK-009',
        vin: '1HGBH41JXMN109194',
        make: 'Peterbilt',
        model: '389',
        year: 2019,
        status: 'MAINTENANCE',
        notes: 'Brake system repair needed',
      },
      {
        plate: 'CA-TRK-010',
        vin: '1HGBH41JXMN109195',
        make: 'Volvo',
        model: 'VNR Electric',
        year: 2023,
        status: 'AVAILABLE',
        notes: 'Electric truck - zero emissions',
      },
    ],
  });

  const truck1 = await prisma.truck.findFirst({ where: { plate: 'CA-TRK-001' } });
  const truck2 = await prisma.truck.findFirst({ where: { plate: 'CA-TRK-002' } });
  const truck3 = await prisma.truck.findFirst({ where: { plate: 'CA-TRK-003' } });

  console.log(`✅ Created 10 trucks\n`);

  // 5. Create Drivers
  console.log('👨‍✈️ Creating drivers...');
  const driver1 = await prisma.driver.create({
    data: {
      name: 'John Martinez',
      license: 'CA-CDL-123456',
      licenseExpiry: new Date('2026-12-31'),
      phone: '555-0201',
      email: 'jmartinez@company.com',
      status: 'ACTIVE',
      hireDate: new Date('2022-03-15'),
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'Sarah Johnson',
      license: 'CA-CDL-123457',
      licenseExpiry: new Date('2027-06-30'),
      phone: '555-0202',
      email: 'sjohnson@company.com',
      status: 'ACTIVE',
      hireDate: new Date('2021-08-20'),
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: 'Michael Chen',
      license: 'CA-CDL-123458',
      licenseExpiry: new Date('2025-09-15'),
      phone: '555-0203',
      email: 'mchen@company.com',
      status: 'ACTIVE',
      hireDate: new Date('2023-01-10'),
    },
  });
  console.log(`✅ Created 3 drivers\n`);

  // 6. Create Users
  console.log('🔐 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@danube.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      phone: '555-0001',
      isActive: true,
      emailVerified: true,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@danube.com',
      passwordHash: hashedPassword,
      role: 'DISPATCHER',
      firstName: 'Jane',
      lastName: 'Dispatcher',
      phone: '555-0002',
      isActive: true,
      emailVerified: true,
    },
  });

  const driverUser1 = await prisma.user.create({
    data: {
      email: 'jmartinez@company.com',
      passwordHash: hashedPassword,
      role: 'DRIVER',
      driverId: driver1.id,
      firstName: 'John',
      lastName: 'Martinez',
      phone: '555-0201',
      isActive: true,
      emailVerified: true,
    },
  });

  const billingUser = await prisma.user.create({
    data: {
      email: 'billing@danube.com',
      passwordHash: hashedPassword,
      role: 'BILLING_ADMIN',
      firstName: 'Tom',
      lastName: 'Accountant',
      phone: '555-0003',
      isActive: true,
      emailVerified: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'billing@abclogistics.com',
      passwordHash: hashedPassword,
      role: 'CUSTOMER',
      customerId: customer1.id,
      firstName: 'Alice',
      lastName: 'Manager',
      phone: '555-0101',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`✅ Created 5 users\n`);

  // 7. Create Terminals
  console.log('🏭 Creating terminals...');
  const terminal1 = await prisma.terminal.create({
    data: {
      name: 'Port of Los Angeles Terminal',
      code: 'POLA',
      address: {
        street: '425 S Palos Verdes St',
        city: 'San Pedro',
        state: 'CA',
        zip: '90731',
        country: 'USA',
      },
      syncEnabled: false,
    },
  });

  const terminal2 = await prisma.terminal.create({
    data: {
      name: 'Port of Long Beach Terminal',
      code: 'POLB',
      address: {
        street: '415 W Ocean Blvd',
        city: 'Long Beach',
        state: 'CA',
        zip: '90802',
        country: 'USA',
      },
      syncEnabled: false,
    },
  });
  console.log(`✅ Created 2 terminals\n`);

  // 8. Create Containers
  console.log('📦 Creating containers...');
  await prisma.container.createMany({
    data: [
      {
        number: 'ABCU1234567',
        size: 'FORTY_FT',
        type: 'DRY',
        terminalId: terminal1.id,
        available: true,
        condition: 'GOOD',
        lastInspectionDate: new Date('2026-01-15'),
      },
      {
        number: 'MSCU2345678',
        size: 'FORTY_FT',
        type: 'DRY',
        terminalId: terminal1.id,
        available: true,
        condition: 'GOOD',
        lastInspectionDate: new Date('2026-01-20'),
      },
      {
        number: 'HLCU3456789',
        size: 'TWENTY_FT',
        type: 'DRY',
        terminalId: terminal2.id,
        available: true,
        condition: 'GOOD',
        lastInspectionDate: new Date('2026-01-25'),
      },
      {
        number: 'OOLU4567890',
        size: 'FORTY_FT',
        type: 'REEFER',
        terminalId: terminal2.id,
        available: true,
        condition: 'GOOD',
        lastInspectionDate: new Date('2026-02-01'),
      },
      {
        number: 'CMAU5678901',
        size: 'FORTY_FT',
        type: 'DRY',
        terminalId: terminal1.id,
        available: false,
        condition: 'DAMAGED',
        lastInspectionDate: new Date('2026-01-10'),
      },
    ],
  });
  console.log(`✅ Created 5 containers\n`);

  // 9. Fetch created resources for trips
  const allContainers = await prisma.container.findMany();
  const allTrucks = await prisma.truck.findMany({ where: { status: 'AVAILABLE' } });
  const allDrivers = await prisma.driver.findMany({ where: { status: 'ACTIVE' } });

  // 10. Create Sample Trips
  console.log('🚚 Creating sample trips...');
  await prisma.trip.create({
    data: {
      customerId: customer1.id,
      truckId: allTrucks[0].id,
      driverId: allDrivers[0].id,
      containerId: allContainers[0].id,
      pickupLocation: 'Port of Los Angeles Terminal',
      pickupTime: new Date('2026-02-10T08:00:00'),
      dropoffLocation: 'ABC Logistics Warehouse - 123 Harbor Blvd',
      dropoffTime: new Date('2026-02-10T11:30:00'),
      status: 'SCHEDULED',
      distanceMiles: 25.5,
      chassisReceivedAt: new Date('2026-02-10T07:30:00'),
      notes: 'Priority delivery - time sensitive cargo',
    },
  });

  await prisma.trip.create({
    data: {
      customerId: customer2.id,
      truckId: allTrucks[1].id,
      driverId: allDrivers[1].id,
      containerId: allContainers[1].id,
      pickupLocation: 'Port of Long Beach Terminal',
      pickupTime: new Date('2026-02-09T14:00:00'),
      dropoffLocation: 'Pacific Imports Facility - 456 Ocean Ave',
      dropoffTime: new Date('2026-02-09T16:45:00'),
      status: 'COMPLETED',
      distanceMiles: 18.3,
      chassisReceivedAt: new Date('2026-02-09T13:30:00'),
      chassisReturnedAt: new Date('2026-02-09T17:30:00'),
      notes: 'Reefer container - maintain temperature - Completed',
    },
  });

  await prisma.trip.create({
    data: {
      customerId: customer3.id,
      truckId: allTrucks[2].id,
      driverId: allDrivers[2].id,
      containerId: allContainers[2].id,
      pickupLocation: 'Port of Los Angeles Terminal',
      pickupTime: new Date('2026-02-08T10:00:00'),
      dropoffLocation: 'Global Trade Depot - 789 Port Rd',
      dropoffTime: new Date('2026-02-08T13:00:00'),
      status: 'COMPLETED',
      distanceMiles: 32.7,
      chassisReceivedAt: new Date('2026-02-08T09:15:00'),
      chassisReturnedAt: new Date('2026-02-08T14:30:00'),
      notes: 'Completed - no issues',
    },
  });

  await prisma.trip.create({
    data: {
      customerId: customer1.id,
      truckId: allTrucks[3].id,
      driverId: allDrivers[0].id,
      containerId: allContainers[3].id,
      pickupLocation: 'Port of Long Beach Terminal',
      pickupTime: new Date('2026-02-11T09:00:00'),
      dropoffLocation: 'ABC Logistics Warehouse - 123 Harbor Blvd',
      status: 'SCHEDULED',
      distanceMiles: 22.1,
      notes: 'Regular delivery',
    },
  });

  console.log(`✅ Created 4 sample trips\n`);

  // 11. Create Sample Invoices
  console.log('💰 Creating sample invoices...');

  // Get completed trips
  const flatTrip = await prisma.trip.findFirst({
    where: {
      status: 'COMPLETED',
      customer: { pricingType: 'FLAT' },
    },
    include: { customer: true },
  });

  const itemizedTrip = await prisma.trip.findFirst({
    where: {
      status: 'COMPLETED',
      customer: { pricingType: 'ITEMIZED' },
    },
    include: { customer: true },
  });

  // Invoice for FLAT rate customer
  if (flatTrip) {
    await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-00001',
        tripId: flatTrip.id,
        customerId: flatTrip.customerId,
        pricingType: flatTrip.customer.pricingType,
        lineItems: [
          {
            description: 'Transport: Port of Los Angeles to Global Trade Depot',
            quantity: 1,
            rate: 850.00,
            amount: 850.00,
          },
        ],
        subtotal: 850.00,
        taxRate: 8.25,
        taxAmount: 70.13,
        totalAmount: 920.13,
        dueDate: new Date('2026-03-10'),
        paid: true,
        paidAt: new Date('2026-02-15'),
        paymentMethod: 'ACH Transfer',
        notes: 'Paid on time - thank you!',
      },
    });
  }

  // Invoice for ITEMIZED customer
  if (itemizedTrip) {
    await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-00002',
        tripId: itemizedTrip.id,
        customerId: itemizedTrip.customerId,
        pricingType: itemizedTrip.customer.pricingType,
        lineItems: [
          {
            description: 'Base Transport Rate',
            quantity: 1,
            rate: 400.00,
            amount: 400.00,
          },
          {
            description: 'Wait Time at Terminal (2 hours)',
            quantity: 2,
            rate: 75.00,
            amount: 150.00,
          },
          {
            description: 'Chassis Storage (3 days)',
            quantity: 3,
            rate: 50.00,
            amount: 150.00,
          },
          {
            description: 'Fuel Surcharge',
            quantity: 1,
            rate: 45.00,
            amount: 45.00,
          },
        ],
        subtotal: 745.00,
        taxRate: 8.25,
        taxAmount: 61.46,
        totalAmount: 806.46,
        dueDate: new Date('2026-03-25'),
        paid: false,
        notes: 'NET 45 payment terms',
      },
    });
  }

  console.log(`✅ Created sample invoices\n`);

  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   • 7 charge types');
  console.log('   • 3 customers');
  console.log('   • 4 customer rates');
  console.log('   • 10 trucks (varied makes & statuses)');
  console.log('   • 3 drivers');
  console.log('   • 5 users (all password: password123)');
  console.log('   • 2 terminals');
  console.log('   • 5 containers');
  console.log('   • 4 sample trips');
  console.log('   • 2 sample invoices (1 paid, 1 pending)\n');
  console.log('🔐 Test Users:');
  console.log('   • admin@danube.com (Admin)');
  console.log('   • dispatcher@danube.com (Dispatcher)');
  console.log('   • jmartinez@company.com (Driver)');
  console.log('   • billing@danube.com (Billing Admin)');
  console.log('   • billing@abclogistics.com (Customer)');
  console.log('   All passwords: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
