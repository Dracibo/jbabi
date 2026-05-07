import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) return null;
        if (email.toLowerCase() !== adminEmail.toLowerCase()) return null;

        const ok = await bcrypt.compare(password, adminHash);
        if (!ok) return null;

        return { id: "admin", email: adminEmail, name: "Patron" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  trustHost: true,
});
