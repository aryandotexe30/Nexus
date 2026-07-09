import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.networkCache.deleteMany({});
  console.log("Cleared cache");
}
run();
