import { prisma } from "../config/db.config";

async function main() {
  const user = await prisma.user.update({
    where: { email: "ibeprecious49@gmail.com" },
    data: { onboardingStep: "COMPLETE" },
  });
  console.log(user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
