import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export type Environment = "production" | "staging";

export const BASE_URLS: Record<Environment, string> = {
  production: "https://www.hudl.com",
  staging: "https://staging.hudl.com",
};

const currentEnv = (process.env.HUDL_ENV as Environment) ?? "production";

export const ENV = {
  HUDL_EMAIL: requireEnv("HUDL_EMAIL"),
  HUDL_PASSWORD: requireEnv("HUDL_PASSWORD"),
  // Admin user falls back to base user if not separately configured
  HUDL_ADMIN_EMAIL: process.env.HUDL_ADMIN_EMAIL ?? requireEnv("HUDL_EMAIL"),
  HUDL_ADMIN_PASSWORD: process.env.HUDL_ADMIN_PASSWORD ?? requireEnv("HUDL_PASSWORD"),
  ENVIRONMENT: currentEnv,
  BASE_URL: BASE_URLS[currentEnv],
};
