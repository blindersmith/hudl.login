import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // Step 1 — email
  readonly emailInput: Locator;
  readonly continueButton: Locator;

  // Step 2 — password
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;

  // Feedback
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.emailInput = page.getByLabel("Email", { exact: false });
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });

    // data-qa-id targets the input specifically — getByLabel("Password") also resolves to
    // the show/hide toggle button and throws a strict-mode violation
    this.passwordInput = page.locator('[data-qa-id="password-input-input"]');
    // Step 2 submit is labeled "Continue", same text as step 1 (different page/domain)
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

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.waitFor({ state: "visible" });
    await this.forgotPasswordLink.click();
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
