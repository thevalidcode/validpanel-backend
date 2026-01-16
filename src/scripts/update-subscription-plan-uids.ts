import { prisma } from "../config/db.config";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

async function main() {
  console.log("Starting subscription plan UID update...");

  // Get all subscription plans
  const plans = await prisma.subscriptionPlan.findMany({
    select: {
      id: true,
      uid: true,
      name: true,
    },
  });

  console.log(`Found ${plans.length} subscription plans to update`);

  // Update each plan with a new UUID v4
  for (const plan of plans) {
    const newUid = uuidv4();
    
    await prisma.subscriptionPlan.update({
      where: { id: plan.id },
      data: { uid: newUid },
    });

    console.log(
      `Updated plan: ${plan.name} (ID: ${plan.id})\n  Old UID: ${plan.uid}\n  New UID: ${newUid}`
    );
  }

  console.log("\nAll subscription plan UIDs have been updated successfully!");
}

main()
  .catch((e) => {
    console.error("Error updating subscription plan UIDs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
