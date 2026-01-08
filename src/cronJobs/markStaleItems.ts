import { prisma } from "../config/db.config";

/**
 * Cron job: mark unattended payments, transactions, and subscriptions as failed/expired
 */
export const markStaleItemsFailed = async () => {
  try {
    const setting = await prisma.setting.findFirst();
    const cutoffDays = setting?.staleItemThreshold ?? 7;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cutoffDays);

    // Choose safe batch size for your VPS
    const BATCH_SIZE = 250;

    // --- Payments ---
    let paymentsUpdated: number;
    do {
      const batch = await prisma.payment.findMany({
        where: { status: "PENDING", createdAt: { lte: cutoff } },
        take: BATCH_SIZE,
        select: { id: true },
      });

      paymentsUpdated = batch.length;

      if (paymentsUpdated > 0) {
        await prisma.payment.updateMany({
          where: { id: { in: batch.map((p) => p.id) } },
          data: { status: "FAILED" },
        });
      }
    } while (paymentsUpdated === BATCH_SIZE);

    // --- Transactions ---
    let transactionsUpdated: number;
    do {
      const batch = await prisma.transaction.findMany({
        where: { status: "PENDING", timestamp: { lte: cutoff } },
        take: BATCH_SIZE,
        select: { id: true },
      });

      transactionsUpdated = batch.length;

      if (transactionsUpdated > 0) {
        await prisma.transaction.updateMany({
          where: { id: { in: batch.map((t) => t.id) } },
          data: { status: "FAILED" },
        });
      }
    } while (transactionsUpdated === BATCH_SIZE);

    // --- Subscriptions ---
    let subscriptionsUpdated: number;
    do {
      const batch = await prisma.subscription.findMany({
        where: { status: "PENDING", startedAt: { lte: cutoff } },
        take: BATCH_SIZE,
        select: { id: true },
      });

      subscriptionsUpdated = batch.length;

      if (subscriptionsUpdated > 0) {
        await prisma.subscription.updateMany({
          where: { id: { in: batch.map((s) => s.id) } },
          data: { status: "EXPIRED" },
        });
      }
    } while (subscriptionsUpdated === BATCH_SIZE);

    console.log(`Mark stale items complete.`);
  } catch (err: any) {
    console.error("Failed to mark stale items:", err);
  }
};
