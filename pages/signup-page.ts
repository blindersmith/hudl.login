import { Page, Locator } from "@playwright/test";

export class SignupPage {
  readonly page: Page;

  readonly pageHeading: Locator;
  readonly firstNameLabel: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameLabel: Locator;
  readonly lastNameInput: Locator;
  readonly emailLabel: Locator;
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly alreadyHaveAccountText: Locator;
  readonly logInLink: Locator;
  readonly orDivider: Locator;
  readonly continueWithGoogleButton: Locator;
  readonly continueWithFacebookButton: Locator;
  readonly continueWithAppleButton: Locator;
  readonly legalText: Locator;
  readonly privacyPolicyLink: Locator;
  readonly termsOfServiceLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole("heading", { name: "Create Account" });
    this.firstNameLabel = page.locator('[data-qa-id="first-name-input-label"]');
    this.firstNameInput = page.getByLabel("First Name", { exact: false });
    this.lastNameLabel = page.locator('[data-qa-id="last-name-input-label"]');
    this.lastNameInput = page.getByLabel("Last Name", { exact: false });
    this.emailLabel = page.locator('[data-qa-id="email-input-label"]');
    this.emailInput = page.getByLabel("Email", { exact: false });
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.alreadyHaveAccountText = page.getByText(/Already have an account/);
    this.logInLink = page.locator('[data-qa-id="login-link"]');
    this.orDivider = page.getByText("or", { exact: true });
    this.continueWithGoogleButton = page.getByRole("button", { name: "Continue with Google" });
    this.continueWithFacebookButton = page.getByRole("button", { name: "Continue with Facebook" });
    this.continueWithAppleButton = page.getByRole("button", { name: "Continue with Apple" });
    this.legalText = page.getByText(/By continuing, you agree/);
    this.privacyPolicyLink = page.getByRole("link", { name: "Privacy Policy" });
    this.termsOfServiceLink = page.getByRole("link", { name: "Terms of Service" });
  }

  async waitForLoad(): Promise<void> {
    await this.pageHeading.waitFor({ state: "visible" });
  }
}
