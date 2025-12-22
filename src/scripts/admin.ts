import { prisma } from "../config/db.config";

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
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
    },
  });

  /* 3. Link role to permission */
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

  /* 4. Create admin user */
  const admin = await prisma.admin.create({
    data: {
      email: "ibeprecious49@gmail.com",
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
