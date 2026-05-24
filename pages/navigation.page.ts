import { Page, Locator } from "@playwright/test";

export class Navigation {
  readonly page: Page;
  // "Log Out" is present in the DOM for every authenticated user (inside the collapsed account dropdown)
  readonly logOutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Two "Log Out" elements exist in the dropdown DOM; .first() resolves strict mode
    this.logOutLink = page.getByText("Log Out", { exact: true }).first();
  }

  async toLoginByURL(): Promise<void> {
    await this.page.goto("/login");
  }

  async toHomeByURL(): Promise<void> {
    await this.page.goto("/home");
  }

  async toForgotPasswordByURL(): Promise<void> {
    await this.page.goto("/login/forgot-password");
  }

  async toPrivacyPolicyByURL(): Promise<void> {
    await this.page.goto("/privacy");
  }

  async toTermsOfServiceByURL(): Promise<void> {
    await this.page.goto("/terms");
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.logOutLink.waitFor({ state: "attached", timeout: 12000 });
      return true;
    } catch {
      return false;
    }
  }
}
