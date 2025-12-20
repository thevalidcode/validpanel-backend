import { prisma } from "../config/db.config";

async function main() {
  const user = await prisma.user.findMany();
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
