import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page.js";
import { SignupPage } from "../pages/signup-page.js";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Create Account Page", () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    await loginPage.navigateTo();
    await loginPage.clickCreateAccount();
    await signupPage.waitForLoad();
  });

  test("@smoke create account page loads with correct heading", async () => {
    await expect(signupPage.pageHeading).toBeVisible();
  });

  test("first name label and input are visible", async () => {
    await expect(signupPage.firstNameLabel).toBeVisible();
    await expect(signupPage.firstNameInput).toBeVisible();
  });

  test("last name label and input are visible", async () => {
    await expect(signupPage.lastNameLabel).toBeVisible();
    await expect(signupPage.lastNameInput).toBeVisible();
  });

  test("email label and input are visible", async () => {
    await expect(signupPage.emailLabel).toBeVisible();
    await expect(signupPage.emailInput).toBeVisible();
  });

  test("continue button is visible", async () => {
    await expect(signupPage.continueButton).toBeVisible();
  });

  test("or divider is visible", async () => {
    await expect(signupPage.orDivider).toBeVisible();
  });

  test("Continue with Google button is visible", async () => {
    await expect(signupPage.continueWithGoogleButton).toBeVisible();
  });

  test("Continue with Facebook button is visible", async () => {
    await expect(signupPage.continueWithFacebookButton).toBeVisible();
  });

  test("Continue with Apple button is visible", async () => {
    await expect(signupPage.continueWithAppleButton).toBeVisible();
  });

  test("already have an account text is visible", async () => {
    await expect(signupPage.alreadyHaveAccountText).toBeVisible();
  });

  test("log in link is visible", async () => {
    await expect(signupPage.logInLink).toBeVisible();
  });

  test("legal consent text is visible", async () => {
    await expect(signupPage.legalText).toBeVisible();
  });

  test("privacy policy link is visible", async () => {
    await expect(signupPage.privacyPolicyLink).toBeVisible();
  });

  test("terms of service link is visible", async () => {
    await expect(signupPage.termsOfServiceLink).toBeVisible();
  });
});
