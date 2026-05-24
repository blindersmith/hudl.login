import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page.js";
import { Navigation } from "../pages/navigation.page.js";
import { TermsPage } from "../pages/terms-page.js";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Terms of Service Page", () => {
  let termsPage: TermsPage;

  test.beforeEach(async ({ page }) => {
    const navigate = new Navigation(page);
    termsPage = new TermsPage(page);
    await navigate.toTermsOfServiceByURL();
    await termsPage.waitForLoad();
  });

  test("@smoke terms of service page loads with correct heading", async () => {
    await expect(termsPage.pageHeading).toBeVisible();
  });

  test("terms of service page is reachable from login page terms link", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.termsOfServiceLink.click();

    const termsPageViaLink = new TermsPage(page);
    await termsPageViaLink.waitForLoad();

    await expect(termsPageViaLink.pageHeading).toBeVisible();
    await expect(page).toHaveURL(/\/terms/);
  });
});
