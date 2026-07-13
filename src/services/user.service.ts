import prisma from "@/lib/prisma";
import { logAction } from "@/lib/audit";

export class UserService {
  static async verifyUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true }
    });

    await logAction({
      action: "USER_VERIFIED",
      entity: "User",
      entityId: userId,
    });

    return user;
  }

  static async banUser(userId: string) {
    // In the future this might set deletedAt or a banned flag
    // For now we just return standard response
    return true;
  }
}
