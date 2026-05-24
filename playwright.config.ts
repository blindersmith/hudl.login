import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { BASE_URLS } from "./utils/env.js";

dotenv.config();

type Environment = "production" | "staging";
const currentEnv = (process.env.HUDL_ENV as Environment) ?? "production";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["allure-playwright"],
    ...(process.env.CI ? ([["github"] as ["github"]] as const) : []),
  ],
  use: {
    baseURL: BASE_URLS[currentEnv],
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: "setup",
      testDir: "./utils",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
