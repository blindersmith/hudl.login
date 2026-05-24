import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // ── Shared (present on both step 1 and step 2) ───────────────────────────
  readonly hudlLogo: Locator;
  readonly pageHeading: Locator;
  readonly orDivider: Locator;
  readonly continueWithGoogleButton: Locator;
  readonly continueWithFacebookButton: Locator;
  readonly continueWithAppleButton: Locator;
  readonly createAccountLink: Locator;
  readonly legalText: Locator;
  readonly privacyPolicyLink: Locator;
  readonly termsOfServiceLink: Locator;

  // ── Step 1 — Email ───────────────────────────────────────────────────────
  readonly emailLabel: Locator;
  readonly emailInput: Locator;
  readonly continueButton: Locator;

  // ── Step 2 — Password ────────────────────────────────────────────────────
  readonly emailDisplayLabel: Locator;
  readonly emailDisplay: Locator;
  readonly editEmailLink: Locator;
  readonly passwordLabel: Locator;
  readonly passwordRequiredIndicator: Locator;
  readonly passwordInput: Locator;
  readonly showHidePasswordButton: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;

  // ── Feedback ─────────────────────────────────────────────────────────────
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Shared
    this.hudlLogo = page.locator("img").first(); // no alt/aria-label on Hudl logo
    this.pageHeading = page.getByRole("heading", { name: "Log In" });
    this.orDivider = page.getByText("or", { exact: true });
    this.continueWithGoogleButton = page.getByRole("button", { name: "Continue with Google" });
    this.continueWithFacebookButton = page.getByRole("button", { name: "Continue with Facebook" });
    this.continueWithAppleButton = page.getByRole("button", { name: "Continue with Apple" });
    this.createAccountLink = page.getByRole("link", { name: "Create Account" });
    this.legalText = page.getByText(/By continuing, you agree/);
    this.privacyPolicyLink = page.getByRole("link", { name: "Privacy Policy" });
    this.termsOfServiceLink = page.getByRole("link", { name: "Terms of Service" });

    // Step 1
    this.emailLabel = page.locator('[data-qa-id="email-input-label"]');
    this.emailInput = page.getByLabel("Email", { exact: false });
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });

    // Step 2
    this.emailDisplayLabel = page.locator('[data-qa-id="email-display-label"]');
    // read-only field showing which email is being authenticated
    this.emailDisplay = page.locator('[data-qa-id="email-display-input"]');
    // aria-label="Edit email address" is stable for role-based targeting
    this.editEmailLink = page.getByRole("link", { name: "Edit email address" });
    this.passwordLabel = page.locator('[data-qa-id="password-input-label"]');
    this.passwordRequiredIndicator = page.locator('[data-qa-id="password-input-required-indicator"]');
    // data-qa-id used — getByLabel("Password") also resolves to the show/hide toggle
    // and throws a strict-mode violation
    this.passwordInput = page.locator('[data-qa-id="password-input-input"]');
    // aria-label toggles between "Show password"/"Hide password" on click — data-qa-id is stable
    this.showHidePasswordButton = page.locator('[data-qa-id="toggle-password-visibility"]');
    // step 2 submit is labeled "Continue", same text as step 1 (different page/domain)
    this.submitButton = page.getByRole("button", { name: "Continue", exact: true });
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot/i });

    // Auth0 error elements carry no role="alert" — CSS class wildcard is the last resort
    this.errorMessage = page.locator('[class*="error"]').first();
  }

  async navigateTo(): Promise<void> {
    await this.page.goto("/login");
    await this.emailInput.waitFor({ state: "visible" });
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ state: "visible" });
    await this.emailInput.fill(email);
  }

  async clickContinue(): Promise<void> {
    await this.continueButton.waitFor({ state: "visible" });
    await this.continueButton.click();
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: "visible" });
    await this.passwordInput.fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.waitFor({ state: "visible" });
    await this.submitButton.click();
  }

  async clickShowHidePassword(): Promise<void> {
    await this.showHidePasswordButton.waitFor({ state: "visible" });
    await this.showHidePasswordButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.waitFor({ state: "visible" });
    await this.forgotPasswordLink.click();
  }

  async clickCreateAccount(): Promise<void> {
    await this.createAccountLink.waitFor({ state: "visible" });
    await this.createAccountLink.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickContinue();
    await this.fillPassword(password);
    await this.clickSubmit();
  }

  async submitEmail(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickContinue();
  }

  async waitForPasswordStep(): Promise<void> {
    await this.passwordInput.waitFor({ state: "visible" });
  }

  async hasEmailValidationError(): Promise<boolean> {
    const nativeMsg = await this.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    if (nativeMsg.length > 0) return true;
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasPasswordValidationError(): Promise<boolean> {
    const nativeMsg = await this.passwordInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    if (nativeMsg.length > 0) return true;
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async pressEnterOnEmail(): Promise<void> {
    await this.emailInput.press("Enter");
  }

  async getErrorMessageText(): Promise<string> {
    await this.errorMessage.waitFor({ state: "visible" });
    return (await this.errorMessage.textContent()) ?? "";
  }

  async getEmailInputType(): Promise<string | null> {
    return this.emailInput.getAttribute("type");
  }

  async getPasswordInputType(): Promise<string | null> {
    return this.passwordInput.getAttribute("type");
  }
}
