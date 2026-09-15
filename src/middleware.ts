import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/products/:path*",
    "/agent/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
