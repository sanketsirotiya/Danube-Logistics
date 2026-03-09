import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.container.updateMany({ data: { terminalId: null } });
  await prisma.terminal.deleteMany();
  console.log('Cleared all terminals');

  const terminals = [
    { name: 'Port Newark Container Terminal', code: 'PNCT', address: { street: '241 Port Newark Rd', city: 'Newark', state: 'NJ', zip: '07114', country: 'USA' } },
    { name: 'APM Terminals Port Elizabeth', code: 'APMT', address: { street: '1210 Corbin St', city: 'Elizabeth', state: 'NJ', zip: '07201', country: 'USA' } },
    { name: 'Maher Terminals Newark', code: 'MAHER', address: { street: 'Port Newark', city: 'Newark', state: 'NJ', zip: '07114', country: 'USA' } },
    { name: 'GCT Bayonne', code: 'GCTB', address: { street: '302 Port Jersey Blvd', city: 'Bayonne', state: 'NJ', zip: '07002', country: 'USA' } },
    { name: 'Global Container Terminal Staten Island', code: 'GCTS', address: { street: '300 Western Ave', city: 'Staten Island', state: 'NY', zip: '10303', country: 'USA' } },
  ];

  for (const t of terminals) {
    await prisma.terminal.create({ data: { name: t.name, code: t.code, address: t.address, syncEnabled: false } });
    console.log('Created:', t.name, `(${t.code})`);
  }

  const all = await prisma.terminal.findMany({ select: { name: true, code: true } });
  console.log('\nCurrent terminals:', JSON.stringify(all, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
