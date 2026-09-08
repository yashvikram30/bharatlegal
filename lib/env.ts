import { z } from "zod";

const envSchema = z.object({
  // AI Inference Engine
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required for legal AI completions"),

  // Database Connection
  MONGO_URL: z.string().min(1, "MONGO_URL is required to connect to MongoDB"),

  // NextAuth Security
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required for session signing"),
  NEXTAUTH_URL: z.string().url().optional(),

  // Public Site Base URL (used for metadataBase, canonical links, and sitemaps)
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("http://localhost:3000"),

  // Google OAuth (Optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email Notification for Password Reset (Optional)
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getValidatedEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ Invalid or missing environment variables:",
      result.error.flatten().fieldErrors
    );
    // Don't crash immediately in client-side or edge environments, but return parsed/fallback data
  }

  return (result.success ? result.data : process.env) as unknown as Env;
}

export const env = getValidatedEnv();
