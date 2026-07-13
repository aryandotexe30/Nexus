import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireUser() {
  const session = await requireSession();
  return session.user as {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    domain: string;
    companyName: string;
    plan: string;
    isVerified: boolean;
  };
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export async function requireVerified() {
  const user = await requireUser();
  if (!user.isVerified && user.role !== "ADMIN") {
    throw new Error("Forbidden: Account must be verified");
  }
  return user;
}
