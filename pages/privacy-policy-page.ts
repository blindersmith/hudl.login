import { Page, Locator } from "@playwright/test";

export class PrivacyPolicyPage {
  readonly page: Page;

  readonly pageHeading: Locator;
  readonly openingText: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeading = page.getByRole("heading", { name: "Hudl Privacy Policy" });
    this.openingText = page.getByText(/Your privacy is important to Hudl/i);
  }

  async waitForLoad(): Promise<void> {
    await this.pageHeading.waitFor({ state: "visible" });
  }
}
