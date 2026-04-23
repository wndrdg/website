import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Google OAuth gate for spark.wonder.dog (CRM surface). Restricts sign-in
// to the Wonder Dog Workspace domain:
//
//   - The `hd=wonder.dog` authorization param is a hint to Google's account
//     picker — users outside the domain don't see this app in their list.
//   - The signIn callback is the real enforcement: profile.email must end
//     in @wonder.dog, otherwise sign-in is rejected.
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: "wonder.dog",
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email;
      return typeof email === "string" && email.endsWith("@wonder.dog");
    },
  },
  pages: {
    signIn: "/signin",
  },
});
