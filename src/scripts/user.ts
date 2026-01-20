import { prisma } from "../config/db.config";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const user = await prisma.user.update({
    where: { email: "ibeprecious49@gmail.com" },
    data: {
      onboardingStep: "COMPLETE",
      password: "$2a$12$99/qDtAOKaVraV/ViF9CL..4xEgC6icI0CmylMI5fXuMpRgjRsKL2",
      hasSeenTour: false
    },
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
