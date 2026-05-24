import { test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./env.js";
import { LoginPage } from "../pages/login-page.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../.auth/user.json");

setup("authenticate", async ({ page, context }) => {
  setup.setTimeout(60000);
  const loginPage = new LoginPage(page);

  await loginPage.navigateTo();
  await loginPage.login(ENV.HUDL_EMAIL, ENV.HUDL_PASSWORD);

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 45000 });

  await context.storageState({ path: authFile });
});
