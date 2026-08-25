require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.company.deleteMany({});
  await prisma.productKnowledge.deleteMany({});
  await prisma.networkCache.deleteMany({});
  console.log('Databook cleared.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
