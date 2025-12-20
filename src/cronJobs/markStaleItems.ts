import { prisma } from "../config/db.config";

/**
 * Cron job: mark unattended payments, transactions, and subscriptions as failed/expired
 */
export const markStaleItemsFailed = async () => {
  try {
    // 1. Get default cutoff days from first active plan (or use 7 days)
    const setting = await prisma.setting.findFirst();
    const cutoffDays = setting?.staleItemThreshold ?? 7;

    // 2. Calculate cutoff date
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cutoffDays);

    // 3. Mark payments as FAILED
    const failedPayments = await prisma.payment.updateMany({
      where: { status: "PENDING", createdAt: { lte: cutoff } },
      data: { status: "FAILED" },
    });

    // 4. Mark transactions as FAILED
    const failedTransactions = await prisma.transaction.updateMany({
      where: { status: "PENDING", timestamp: { lte: cutoff } },
      data: { status: "FAILED" },
    });

    // 5. Expire subscriptions waiting on these payments
    const expiredSubscriptions = await prisma.subscription.updateMany({
      where: { status: "PENDING", startedAt: { lte: cutoff } },
      data: { status: "EXPIRED" },
    });

    console.log(
      `Mark stale items complete: ${failedPayments.count} payments failed, ${failedTransactions.count} transactions failed, ${expiredSubscriptions.count} subscriptions expired.`
    );
  } catch (err: any) {
    console.error("Failed to mark stale items:", err);
  }
};
