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

  // ── Core page load ───────────────────────────────────────────────────────

  test("@smoke login page loads with email input and continue button", async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("hudl logo is visible", async () => {
    await expect(loginPage.hudlLogo).toBeVisible();
  });

  test("log in heading is visible", async () => {
    await expect(loginPage.pageHeading).toBeVisible();
  });

  test("email label is visible", async () => {
    await expect(loginPage.emailLabel).toBeVisible();
  });

  // ── Email validation ─────────────────────────────────────────────────────

  test("rejects empty email when continue is clicked", async ({ page }) => {
    await loginPage.clickContinue();

    await expect.poll(() => loginPage.hasEmailValidationError()).toBe(true);
    await expect(page).toHaveURL(/\/login/);
  });

  test("rejects invalid email format before reaching password step", async ({ page }) => {
    await loginPage.fillEmail("notanemail");
    await loginPage.clickContinue();

    await expect.poll(() => loginPage.hasEmailValidationError()).toBe(true);
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

    expect(["email", "text"]).toContain(inputType);
  });

  test("submits email step with Enter key", async () => {
    await loginPage.fillEmail("notregistered.nobody@example.com");
    await loginPage.pressEnterOnEmail();

    await loginPage.waitForPasswordStep();
  });

  // ── Social login options ─────────────────────────────────────────────────

  test("or divider is visible between form and social options", async () => {
    await expect(loginPage.orDivider).toBeVisible();
  });

  test("Continue with Google button is visible", async () => {
    await expect(loginPage.continueWithGoogleButton).toBeVisible();
  });

  test("Continue with Facebook button is visible", async () => {
    await expect(loginPage.continueWithFacebookButton).toBeVisible();
  });

  test("Continue with Apple button is visible", async () => {
    await expect(loginPage.continueWithAppleButton).toBeVisible();
  });

  // ── Footer links and legal text ──────────────────────────────────────────

  test("create account link is visible", async () => {
    await expect(loginPage.createAccountLink).toBeVisible();
  });

  test("legal consent text is visible", async () => {
    await expect(loginPage.legalText).toBeVisible();
  });

  test("privacy policy link is visible and points to hudl.com/privacy", async () => {
    await expect(loginPage.privacyPolicyLink).toBeVisible();
    await expect(loginPage.privacyPolicyLink).toHaveAttribute("href", "https://www.hudl.com/privacy");
  });

  test("terms of service link is visible and points to hudl.com/terms", async () => {
    await expect(loginPage.termsOfServiceLink).toBeVisible();
    await expect(loginPage.termsOfServiceLink).toHaveAttribute("href", "https://www.hudl.com/terms");
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

  // ── Core login flow ──────────────────────────────────────────────────────

  test("@smoke successful login with valid credentials redirects to home", async ({ page }) => {
    test.setTimeout(45000);
    await loginPage.fillPassword(USERS.base_user.password);
    await loginPage.clickSubmit();

    await page.waitForURL((url) => url.hostname.includes("www.hudl.com"), { timeout: 30000 });

    await expect(page).toHaveURL(/www\.hudl\.com\/home/);
    expect(await navigate.isAuthenticated()).toBe(true);
  });

  test("shows error for incorrect password", async () => {
    await loginPage.fillPassword("wrongPassword123!");
    await loginPage.clickSubmit();

    const errorText = await loginPage.getErrorMessageText();

    expect(errorText).toBeTruthy();
  });

  test("shows error for unrecognized email and any password", async () => {
    // Hudl only reveals an unrecognized email at step 2 after a password attempt
    await navigate.toLoginByURL();
    await loginPage.submitEmail("notregistered.nobody@example.com");
    await loginPage.fillPassword("anyPassword123!");
    await loginPage.clickSubmit();

    const errorText = await loginPage.getErrorMessageText();

    expect(errorText).toBeTruthy();
  });

  test("rejects empty password when submit is clicked", async ({ page }) => {
    await loginPage.clickSubmit();

    await expect.poll(() => loginPage.hasPasswordValidationError()).toBe(true);
    await expect(page).toHaveURL(/\/login/);
  });

  // ── Password field ───────────────────────────────────────────────────────

  test("password field masks input", async () => {
    const inputType = await loginPage.getPasswordInputType();

    expect(inputType).toBe("password");
  });

  test("password step has a show/hide toggle button", async () => {
    await expect(loginPage.showHidePasswordButton).toBeVisible();
  });

  test("show/hide toggle reveals password as plain text", async () => {
    await loginPage.fillPassword("anyPassword123!");
    await loginPage.clickShowHidePassword();

    expect(await loginPage.getPasswordInputType()).toBe("text");
  });

  test("show/hide toggle re-masks password after reveal", async () => {
    await loginPage.fillPassword("anyPassword123!");
    await loginPage.clickShowHidePassword();
    await loginPage.clickShowHidePassword();

    expect(await loginPage.getPasswordInputType()).toBe("password");
  });

  // ── Step 2 page elements ─────────────────────────────────────────────────

  test("hudl logo is visible", async () => {
    await expect(loginPage.hudlLogo).toBeVisible();
  });

  test("log in heading is visible", async () => {
    await expect(loginPage.pageHeading).toBeVisible();
  });

  test("email display label is visible", async () => {
    await expect(loginPage.emailDisplayLabel).toBeVisible();
  });

  test("submitted email is shown in the email display field", async () => {
    await expect(loginPage.emailDisplay).toBeVisible();

    const displayedEmail = await loginPage.emailDisplay.inputValue();

    expect(displayedEmail).toBe(USERS.base_user.email);
  });

  test("edit email link is visible", async () => {
    await expect(loginPage.editEmailLink).toBeVisible();
  });

  test("edit email link returns to email step", async ({ page }) => {
    await loginPage.editEmailLink.click();
    await loginPage.emailInput.waitFor({ state: "visible" });

    await expect(loginPage.emailInput).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("password label is visible", async () => {
    await expect(loginPage.passwordLabel).toBeVisible();
  });

  test("password required indicator is visible", async () => {
    await expect(loginPage.passwordRequiredIndicator).toBeVisible();
  });

  test("forgot password link navigates to password reset page", async ({ page }) => {
    await loginPage.clickForgotPassword();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });

    expect(page.url()).not.toContain("/login");
  });

  // ── Shared footer (present on both steps) ────────────────────────────────

  test("create account link is visible", async () => {
    await expect(loginPage.createAccountLink).toBeVisible();
  });

  test("legal consent text is visible", async () => {
    await expect(loginPage.legalText).toBeVisible();
  });

  test("privacy policy link is visible and points to hudl.com/privacy", async () => {
    await expect(loginPage.privacyPolicyLink).toBeVisible();
    await expect(loginPage.privacyPolicyLink).toHaveAttribute("href", "https://www.hudl.com/privacy");
  });

  test("terms of service link is visible and points to hudl.com/terms", async () => {
    await expect(loginPage.termsOfServiceLink).toBeVisible();
    await expect(loginPage.termsOfServiceLink).toHaveAttribute("href", "https://www.hudl.com/terms");
  });
});
