import prisma from '../src/lib/prisma';

async function createMissingContainers() {
  console.log('🔍 Checking for delivery orders with missing containers...\n');

  // Get all delivery orders with container information
  const deliveryOrders = await prisma.deliveryOrder.findMany({
    where: {
      containerNumber: { not: null },
      containerSize: { not: null },
      containerType: { not: null },
    },
    select: {
      id: true,
      orderNumber: true,
      containerNumber: true,
      containerSize: true,
      containerType: true,
    },
  });

  console.log(`Found ${deliveryOrders.length} delivery orders with container details\n`);

  let created = 0;
  let skipped = 0;

  for (const order of deliveryOrders) {
    // Check if container already exists
    const existingContainer = await prisma.container.findUnique({
      where: { number: order.containerNumber! },
    });

    if (existingContainer) {
      console.log(`⏭️  ${order.containerNumber} - Already exists (skipped)`);
      skipped++;
    } else {
      // Create the container
      await prisma.container.create({
        data: {
          number: order.containerNumber!,
          size: order.containerSize!,
          type: order.containerType!,
          available: true,
          terminalId: null,
        },
      });
      console.log(`✅ ${order.containerNumber} - Created for order ${order.orderNumber}`);
      created++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total: ${deliveryOrders.length}`);
}

createMissingContainers()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
