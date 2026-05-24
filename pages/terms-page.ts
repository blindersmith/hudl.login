import { Page, Locator } from "@playwright/test";

export class TermsPage {
  readonly page: Page;

  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // heading is "Hudl Site Terms (Terms of Service)" — partial match covers formatting variations
    this.pageHeading = page.getByRole("heading", { name: /Hudl Site Terms/i });
  }

  async waitForLoad(): Promise<void> {
    await this.pageHeading.waitFor({ state: "visible" });
  }
}
