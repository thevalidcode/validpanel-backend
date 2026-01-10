import { prisma } from "../config/db.config";

async function fixSequence() {
  try {
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('subscription_plans', 'id'), 
        COALESCE((SELECT MAX(id) FROM subscription_plans), 0) + 1, 
        false
      );
    `;
    await prisma.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('payment_gateways', 'id'), 
        COALESCE((SELECT MAX(id) FROM payment_gateways), 0) + 1, 
        false
      );
    `;
    console.log("✅ Sequence fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing sequence:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequence();
