import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page.js";
import { Navigation } from "../pages/navigation.page.js";
import { PrivacyPolicyPage } from "../pages/privacy-policy-page.js";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Privacy Policy Page", () => {
  let privacyPage: PrivacyPolicyPage;

  test.beforeEach(async ({ page }) => {
    const navigate = new Navigation(page);
    privacyPage = new PrivacyPolicyPage(page);
    await navigate.toPrivacyPolicyByURL();
    await privacyPage.waitForLoad();
  });

  test("@smoke privacy policy page loads with correct heading", async () => {
    await expect(privacyPage.pageHeading).toBeVisible();
  });

  test("privacy policy page contains opening statement", async () => {
    await expect(privacyPage.openingText).toBeVisible();
  });

  test("privacy policy page is reachable from login page privacy link", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.privacyPolicyLink.click();

    const privacyPageViaLink = new PrivacyPolicyPage(page);
    await privacyPageViaLink.waitForLoad();

    await expect(privacyPageViaLink.pageHeading).toBeVisible();
    await expect(page).toHaveURL(/\/privacy/);
  });
});
