import "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
      domain?: string;
      companyName?: string | null;
      plan?: string;
      isVerified?: boolean;
      name?: string | null;
      image?: string | null;
    }
  }

  interface User {
    id: string;
    email: string;
    role?: string;
    domain?: string;
    companyName?: string | null;
    plan?: string;
    isVerified?: boolean;
  }
}
