import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import dns from "node:dns";

try {
  if (typeof dns.setServers === "function") {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
} catch {
  // Ignore in environments where setServers is restricted
}

interface CustomUser {
  _id?: string;
  email: string;
  username: string;
  password?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Please provide both identifier and password");
        }
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier.toLowerCase().trim() },
              { username: credentials.identifier.trim() },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email or username");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            const userId = (user._id as { toString: () => string }).toString();
            return {
              id: userId,
              name: user.username,
              email: user.email,
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Authentication error occurred";
          throw new Error(errorMessage);
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        await dbConnect();

        let dbUser = await UserModel.findOne({ email: user.email });

        if (!dbUser) {
          const baseUsername =
            user?.name?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ||
            (user?.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") : `user`);

          let finalUsername = baseUsername;
          // If username is already taken by another account, append random suffix
          const existingUsername = await UserModel.findOne({ username: finalUsername });
          if (existingUsername) {
            finalUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
          }

          dbUser = await UserModel.create({
            email: user?.email?.toLowerCase().trim(),
            username: finalUsername,
            password: `GOOGLE_OAUTH_${Math.random().toString(36).slice(2)}`,
          });
        }

        token._id = (dbUser._id as { toString: () => string }).toString();
        token.username = dbUser.username;
      } else if (user) {
        const customUser = user as CustomUser;
        token._id = customUser._id?.toString?.() || user.id;
        token.username = customUser.username || user.name || "";
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user._id = token._id as string | undefined;
        session.user.username =
          typeof token.username === "string" ? token.username : undefined;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs or default to /dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
};