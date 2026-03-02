import { prisma } from "../config/db.config";
import dotenv from "dotenv";
import { CreateStore } from "../services/store";
dotenv.config();

async function main() {
  const user = await prisma.user.findFirst();
  const existingStore = await prisma.store.update({
    where: { storeId: 1 },
    data: { type: "SHOP" },
  });
  const store = await CreateStore(user!, existingStore!);
  console.log(store);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
