import prisma from "@/lib/prisma";
import { logAction, logCreditTransaction } from "@/lib/audit";

export class BillingService {
  static async purchaseCredits(userId: string, amount: number, amountPaid: number) {
    const transaction = await logCreditTransaction({
      userId,
      amount,
      type: 'PURCHASE',
      description: `Purchased via Razorpay (Paid: ${amountPaid})`
    });

    await logAction({
      userId,
      action: "CREDITS_PURCHASED",
      entity: "CreditTransaction",
      entityId: transaction.id,
      newValue: { amount, amountPaid }
    });

    return transaction;
  }

  static async useCredits(userId: string, amount: number, reason: string) {
    const transaction = await logCreditTransaction({
      userId,
      amount: -Math.abs(amount), // Ensure deduction
      type: 'AI_USAGE',
      description: reason
    });

    return transaction;
  }
}
