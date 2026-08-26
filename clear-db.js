require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.productKnowledge.deleteMany({});
  await prisma.company.deleteMany({});
  console.log('Databook and Cache completely cleared.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
