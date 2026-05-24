import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page.js";
import { Navigation } from "../pages/navigation.page.js";
import { USERS } from "../utils/users.js";

// All login tests need a clean unauthenticated browser
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Hudl Login — Step 1 (Email)", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("@smoke login page loads with email input and continue button", async ({ page }) => {
    expect(await loginPage.isLoaded()).toBe(true);
    await expect(page).toHaveURL(/\/login/);
  });

  test("rejects empty email when continue is clicked", async ({ page }) => {
    await loginPage.clickContinue();

    expect(await loginPage.hasEmailValidationError()).toBe(true);
    await expect(page).toHaveURL(/\/login/);
  });

  test("rejects invalid email format before reaching password step", async ({ page }) => {
    await loginPage.fillEmail("notanemail");
    await loginPage.clickContinue();

    expect(await loginPage.hasEmailValidationError()).toBe(true);
    await expect(page).toHaveURL(/\/login/);
  });

  test("advances to password step for any valid-format email (no enumeration)", async () => {
    await loginPage.submitEmail("notregistered.nobody@example.com");

    // Hudl does not reveal whether an email is registered at step 1.
    // Any valid-format email proceeds to the password step.
    await loginPage.waitForPasswordStep();
  });

  test("email field accepts text input", async () => {
    const inputType = await loginPage.getEmailInputType();

    expect(inputType === "email" || inputType === "text").toBe(true);
  });
});

test.describe("Hudl Login — Step 2 (Password)", () => {
  let loginPage: LoginPage;
  let navigate: Navigation;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    navigate = new Navigation(page);
    await navigate.toLoginByURL();
    await loginPage.submitEmail(USERS.base_user.email);
    await loginPage.waitForPasswordStep();
  });

  test("@smoke successful login with valid credentials redirects to home", async ({
    page,
  }) => {
    await loginPage.fillPassword(USERS.base_user.password);
    await loginPage.clickSubmit();

    await page.waitForURL((url) => url.hostname.includes("www.hudl.com"), { timeout: 15000 });

    await expect(page).toHaveURL(/www\.hudl\.com\/home/);
    expect(await navigate.isAuthenticated()).toBe(true);
  });

  test("shows error for incorrect password", async () => {
    await loginPage.fillPassword("wrongPassword123!");
    await loginPage.clickSubmit();

    const errorText = await loginPage.getErrorMessageText();

    expect(errorText.length).toBeGreaterThan(0);
  });

  test("shows error for unrecognized email and any password", async () => {
    // Hudl only reveals an unrecognized email at step 2 after a password attempt
    await navigate.toLoginByURL();
    await loginPage.submitEmail("notregistered.nobody@example.com");
    await loginPage.fillPassword("anyPassword123!");
    await loginPage.clickSubmit();

    const errorText = await loginPage.getErrorMessageText();

    expect(errorText.length).toBeGreaterThan(0);
  });

  test("rejects empty password when submit is clicked", async ({ page }) => {
    await loginPage.clickSubmit();

    expect(await loginPage.hasPasswordValidationError()).toBe(true);
    await expect(page).toHaveURL(/\/login/);
  });

  test("password field masks input", async () => {
    const inputType = await loginPage.getPasswordInputType();

    expect(inputType).toBe("password");
  });

  test("forgot password link navigates to password reset page", async ({ page }) => {
    await loginPage.clickForgotPassword();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });

    expect(page.url()).not.toContain("/login");
  });
});
