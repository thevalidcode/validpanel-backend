import { env } from "./env.config";
import { PrismaClient } from "../../prisma/generated";

const prisma = new PrismaClient();

export { prisma };
