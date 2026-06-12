import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const sessionCount = await prisma.session.count();
    console.log(`[OK] Connected successfully! Session count: ${sessionCount}`);
    
    const shopCount = await prisma.shop.count();
    console.log(`[OK] Shop count: ${shopCount}`);
  } catch (error) {
    console.error('[ERROR] Failed to connect:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
