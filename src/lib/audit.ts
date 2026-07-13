import prisma from "@/lib/prisma";

export async function logAction({
  userId,
  action,
  entity,
  entityId,
  oldValue,
  newValue,
  ip
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
        newValue: newValue ? JSON.stringify(newValue) : undefined,
        ip,
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Don't throw - audit logging shouldn't crash the main business transaction
  }
}

export async function logCreditTransaction({
  userId,
  amount,
  type,
  description
}: {
  userId: string;
  amount: number;
  type: 'PURCHASE' | 'AI_USAGE' | 'SEARCH' | 'BONUS' | 'REFUND';
  description?: string;
}) {
  try {
    // Write the transaction
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        amount,
        type,
        description
      }
    });

    // Update the user's current balance cache
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount
        }
      }
    });

    return transaction;
  } catch (error) {
    console.error("Failed to log credit transaction:", error);
    throw new Error("Billing transaction failed");
  }
}
