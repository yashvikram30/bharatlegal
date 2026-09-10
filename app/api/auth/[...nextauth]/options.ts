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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          const email = user?.email?.toLowerCase().trim();
          if (!email) {
            console.error("Google OAuth: No email returned from provider");
            return false;
          }

          let dbUser = await UserModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") },
          });

          if (!dbUser) {
            const baseUsername =
              user?.name?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ||
              email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
              `user`;

            let finalUsername = baseUsername;
            const existingUsername = await UserModel.findOne({ username: finalUsername });
            if (existingUsername) {
              finalUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
            }

            try {
              await UserModel.create({
                email,
                username: finalUsername,
                password: `GOOGLE_OAUTH_${Math.random().toString(36).slice(2)}`,
              });
            } catch (createErr) {
              // If race condition created it in parallel, ignore duplicate error
              console.warn("User already created during Google OAuth callback:", createErr);
            }
          }
          return true;
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          // Allow authentication to proceed even if MongoDB sync has a transient network failure
          return true;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // Executed whenever a JWT token is created or updated
      if (user) {
        try {
          await dbConnect();
          const email = user.email?.toLowerCase().trim();
          if (email) {
            const dbUser = await UserModel.findOne({
              email: { $regex: new RegExp(`^${email}$`, "i") },
            });
            if (dbUser) {
              token._id = (dbUser._id as { toString: () => string }).toString();
              token.username = dbUser.username;
            }
          }
        } catch (dbErr) {
          console.warn("Could not sync MongoDB user into JWT token:", dbErr);
        }

        if (!token._id) {
          const customUser = user as CustomUser;
          token._id = customUser._id?.toString?.() || user.id || token.sub;
        }
        if (!token.username) {
          const customUser = user as CustomUser;
          token.username = customUser.username || user.name || "User";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user && token) {
        session.user._id = token._id as string | undefined;
        const resolvedUsername =
          typeof token.username === "string" ? token.username : undefined;
        session.user.username = resolvedUsername;
        if (resolvedUsername) {
          session.user.name = resolvedUsername;
        } else if (!session.user.name && token.name) {
          session.user.name = token.name as string;
        }
        if (!session.user.email && token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },

    redirect({ url, baseUrl }) {
      // If the redirect target is /auth or contains /auth, NEVER redirect back to the login page!
      if (url === "/auth" || url.endsWith("/auth") || url.includes("/auth?")) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith("/")) {
        if (url === "/auth" || url.startsWith("/auth?")) {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.origin === baseUrl) {
          if (parsedUrl.pathname === "/auth") {
            return `${baseUrl}/dashboard`;
          }
          return url;
        }
      } catch {}
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