import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { addOrUpdateUser, getUserByEmail } from "@/lib/users";

const handler = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            // On Google signup, ensure the user exists in our in-memory store
            if (account?.provider === "google" && user.email && user.name) {
                await addOrUpdateUser({
                    id: user.id ?? user.email,
                    name: user.name,
                    email: user.email,
                    image: user.image ?? undefined
                });
                return true;
            }
            // For email sign-in, allow and create if needed
            if (account?.provider === "email" && user.email) {
               await addOrUpdateUser({
                    id: user.id ?? user.email,
                    name: user.name ?? user.email.split("@")[0],
                    email: user.email,
                    image: user.image ?? undefined
                });
                return true;
            }
            return true;
        },
        async session({ session, token, user }) {
            // Ensure session user reflects our store details
            if (session.user?.email) {
                const existing = await getUserByEmail(session.user.email);
                if (existing) {
                    session.user.name = existing.name;
                    session.user.image = existing.image;
                }
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };


