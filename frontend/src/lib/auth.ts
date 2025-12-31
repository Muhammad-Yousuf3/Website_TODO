import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { Pool } from "pg";

// Use Neon PostgreSQL for user storage
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Get the base URL for the app (fix operator precedence)
const baseURL = process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL,
  database: pool,
  trustedOrigins: [
    "http://localhost:3000",
    "https://website-todo-phi.vercel.app",
    process.env.BETTER_AUTH_URL || "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ].filter(Boolean),
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: isProduction,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
        }),
      },
    }),
  ],
});
