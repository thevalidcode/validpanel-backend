import { prisma } from "../config/db.config";
import dotenv from 'dotenv';
dotenv.config();
const ADMIN_EMAIL = "ibeprecious49@gmail.com";

async function main() {
  /* 1. Ensure permission exists */
  const allAccessPermission = await prisma.adminPermission.upsert({
    where: { name: "ALL_ACCESS" },
    update: {},
    create: {
      name: "ALL_ACCESS",
    },
  });

  /* 2. Ensure role exists */
  const adminRole = await prisma.adminRole.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
    },
  });

  /* 3. Ensure role has ALL_ACCESS permission */
  await prisma.adminRolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: allAccessPermission.id,
      },
    },
    update: {},
    create: {
      roleId: adminRole.id,
      permissionId: allAccessPermission.id,
    },
  });

  /* 4. Check if admin exists */
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    /* 5a. Admin exists, ensure correct role */
    if (existingAdmin.roleId !== adminRole.id) {
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: { roleId: adminRole.id },
      });
    }

    console.log("Admin already exists. Access verified.");
    return;
  }

  /* 5b. Admin does not exist, create */
  const admin = await prisma.admin.create({
    data: {
      email: ADMIN_EMAIL,
      password: "$2a$12$99/qDtAOKaVraV/ViF9CL..4xEgC6icI0CmylMI5fXuMpRgjRsKL2", // bcrypt hash
      fullName: "Super Admin",
      apiKey: "default_admin_api_key",
      roleId: adminRole.id,
      status: "ACTIVE",
    },
  });

  console.log("Admin created successfully:", admin);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
