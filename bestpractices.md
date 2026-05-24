# Playwright E2E Best Practices

Standards and patterns for writing, organizing, and reviewing Playwright tests in this project.
Target: **https://www.hudl.com/login**

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [File & Folder Organization](#file--folder-organization)
3. [Page Object Model (POM)](#page-object-model-pom)
4. [Locator Standards](#locator-standards)
5. [Wait Strategies](#wait-strategies)
6. [Assertions](#assertions)
7. [Test Design](#test-design)
8. [Test Data & API Setup](#test-data--api-setup)
9. [Authentication & Fixtures](#authentication--fixtures)
10. [Utilities & Helpers](#utilities--helpers)
11. [Error Handling](#error-handling)
12. [Code Quality](#code-quality)
13. [PR Requirements](#pr-requirements)
14. [Anti-Pattern Quick Reference](#anti-pattern-quick-reference)

---

## Project Structure

```
hudl2/
├── .github/workflows/       — CI pipeline (GitHub Actions)
├── pages/                   — Page Object Model classes
│   ├── login-page.ts        — Login form (two-step: email → Continue → password)
│   └── navigation.page.ts   — URL and UI navigation helpers
├── tests/                   — Spec files (one file per feature area)
│   └── login.spec.ts
├── utils/                   — Config, auth, helpers
│   ├── auth.setup.ts        — Runs before tests; logs in and saves session
│   ├── env.ts               — Env var loader, environment switcher
│   └── users.ts             — UserRole type and USERS credentials map
├── .auth/                   — Auto-generated session files (gitignored)
├── .env                     — Local credentials (gitignored)
└── .env.sample              — Credential template (committed)
```

---

## File & Folder Organization

- One spec file per feature area: `login.spec.ts`, `dashboard.spec.ts`, etc.
- One page object file per page or major component: `login-page.ts`, `navigation.page.ts`
- Shared utilities live in `/utils` — not in `/pages` or `/tests`
- Auth setup and teardown scripts live in `/utils`
- Authentication session files are stored under `.auth/` per role; they are never committed

---

## Page Object Model (POM)

### Rules

1. **Every page interaction goes through a page object** — no raw locators in spec files
2. **Page objects return data** — they never assert
3. **Page objects encapsulate interactions** — they do not expose raw locators via getters
4. **One page object per page or component** — keep them focused
5. **Keep page objects lean** — if a class exceeds ~200 lines, consider splitting it

### Class Structure

```typescript
import { Page, Locator } from "@playwright/test";

export class ExamplePage {
  readonly page: Page;

  // Locators declared as readonly properties, grouped by section
  readonly emailInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.getByLabel("Email", { exact: false });
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
  }

  async navigateTo(): Promise<void> {
    await this.page.goto("/login");
    await this.emailInput.waitFor({ state: "visible" });
  }

  // Action method — does something, returns void
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ state: "visible" });
    await this.emailInput.fill(email);
  }

  // Data method — returns a value, never asserts
  async getErrorText(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? "";
  }
}
```

### Method Naming

| Category   | Prefix     | Example                               |
|------------|------------|---------------------------------------|
| Actions    | `click`, `fill`, `select` | `clickContinue()`, `fillEmail(email)` |
| Data reads | `get`      | `getErrorMessageText()`               |
| Navigation | `navigateTo`, `toXxxByURL` | `toLoginByURL()`              |
| Waits      | `waitFor`  | `waitForPasswordStep()`               |
| Combined flows | verb phrase | `login(email, password)`, `submitEmail(email)` |

### What NOT to Do

```typescript
// WRONG — Exposing raw locator via getter
get continueButton(): Locator {
  return this.page.getByRole("button", { name: "Continue" });
}

// WRONG — Asserting inside a page object
async verifyLoginFailed(): Promise<void> {
  await expect(this.errorMessage).toBeVisible(); // NO
}

// WRONG — Method named "verify" that does not actually assert (misleading)
async verifyAndContinue(): Promise<void> {
  await this.continueButton.click();
}
```

---

## Locator Standards

### Preferred Strategies (in priority order)

1. `getByRole()` with `exact: true` when needed — most semantic and resilient
2. `getByTestId()` / `locator('[data-qa-id="..."]')` — stable when data attributes are present
3. `getByLabel()`, `getByPlaceholder()`, `getByText()` — readable and descriptive
4. `locator("[data-attribute]")` — acceptable for custom data attributes
5. CSS selectors — last resort only

### Real Example — Hudl Password Field

The password field's label also applies to the show/hide toggle button. Using `getByLabel` would resolve to 2 elements and throw a strict-mode error. Use the stable `data-qa-id` instead:

```typescript
// WRONG — matches both the input and the show/hide toggle button
this.passwordInput = page.getByLabel("Password", { exact: false });

// CORRECT — targets the specific input via its data-qa-id
this.passwordInput = page.locator('[data-qa-id="password-input-input"]');
```

### Use `exact: true` to Avoid Partial Name Matches

```typescript
// WRONG — matches "Continue", "Continue with Google", "Continue with Facebook", etc.
page.getByRole("button", { name: "Continue" });

// CORRECT — matches only the exact "Continue" button
page.getByRole("button", { name: "Continue", exact: true });
```

### Scoping Locators

Always scope locators to the smallest meaningful container to avoid false matches:

```typescript
// CORRECT — scoped to the dialog
const dialog = page.getByRole("dialog", { name: "Edit Profile" });
const saveButton = dialog.getByRole("button", { name: "Save" });

// WRONG — may match the wrong button elsewhere on the page
const saveButton = page.getByRole("button", { name: "Save" });
```

### Avoid

```typescript
// WRONG — Fragile structural selectors
page.locator("div > span:nth-child(3)");
page.locator("#app > div > div:first-child button");

// WRONG — XPath (unless absolutely no alternative)
page.locator("xpath=//div[@class='container']//button");

// WRONG — Deprecated API
const handle = await locator.elementHandle();
// Use locator-based approaches instead:
await locator.evaluate((el) => el.textContent);
```

---

## Wait Strategies

### Always Use `waitFor()`

```typescript
// CORRECT
await element.waitFor({ state: "visible" });
await loader.waitFor({ state: "hidden", timeout: 30000 });
await element.waitFor({ state: "attached" });
```

### Never Use Arbitrary Delays

```typescript
// NEVER
await page.waitForTimeout(3000);
await new Promise((resolve) => setTimeout(resolve, 3000));
```

### Never Use `waitForLoadState()`

```typescript
// NEVER — goto already waits for domcontentloaded
await page.waitForLoadState("domcontentloaded");

// NEVER — background requests cause indefinite hangs
await page.waitForLoadState("networkidle");
```

**Fix:** Wait for a specific element that signals the page is ready.

### Polling for Changing Values

```typescript
await expect
  .poll(async () => {
    const value = await timerTextbox.inputValue();
    return diffInSeconds(startValue, value);
  }, { timeout: 20_000 })
  .toBeGreaterThanOrEqual(MIN_SECONDS);
```

---

## Assertions

### `expect` Is for Assertions, Not Waits

```typescript
// WRONG — Using expect as a wait mid-flow
await expect(element).toBeVisible();
// ... more actions after this ...

// CORRECT — Wait first, assert last
await element.waitFor({ state: "visible" });
// ... more actions ...
await expect(finalElement).toHaveText("expected");
```

### Use Auto-Retrying Assertions

```typescript
// CORRECT — Playwright retries internally
await expect(locator).toBeVisible();
await expect(locator).toHaveText("Hello");
await expect(locator).toHaveCount(3);

// WRONG — Non-retrying boolean check
expect(await locator.isVisible()).toBe(true);
```

### No Conditional Logic in Tests

```typescript
// WRONG
if (!value) {
  throw new Error("Value is missing");
}

// CORRECT
expect(value).toBeTruthy();
```

### Assertions Live in Spec Files Only

```typescript
// WRONG — asserting inside a page object
class LoginPage {
  async verifyError(expected: string) {
    await expect(this.errorMessage).toHaveText(expected);
  }
}

// CORRECT — page object returns data, spec asserts
class LoginPage {
  async getErrorMessageText(): Promise<string> {
    await this.errorMessage.waitFor({ state: "visible" });
    return (await this.errorMessage.textContent()) ?? "";
  }
}

test("shows error for wrong password", async () => {
  const error = await loginPage.getErrorMessageText();
  expect(error.length).toBeGreaterThan(0);
});
```

---

## Test Design

### File Structure

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page.js";
import { Navigation } from "../pages/navigation.page.js";
import { USERS } from "../utils/users.js";

// Login tests always use a clean unauthenticated browser
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Hudl Login — Step 1 (Email)", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("@smoke login page loads with required elements", async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    expect(page.url()).toContain("/login");
  });
});
```

### Test Tags

- `@smoke` — Quick, high-level smoke tests
- `@sanity` — Sanity checks for critical paths

Run filtered sets via: `npm run test:smoke`

### Grouping by Flow Step

For multi-step flows (like Hudl's two-step login), group tests by step using nested `describe` blocks:

```
test.describe("Hudl Login — Step 1 (Email)")   — tests targeting the email input
test.describe("Hudl Login — Step 2 (Password)") — tests targeting the password input
```

### Skipping Tests

```typescript
// CORRECT — skip the entire describe block
test.describe.skip("Feature Tests", () => { ... });

// WRONG — skip each test individually
test.describe("Feature Tests", () => {
  test.skip("test 1", async () => { ... });
  test.skip("test 2", async () => { ... });
});
```

---

## Test Data & API Setup

### Never Hardcode Test Data

```typescript
// WRONG
await loginPage.fillEmail("brad.lindersmith@gmail.com");

// CORRECT — pull from the USERS map
await loginPage.fillEmail(USERS.base_user.email);
```

### Clean Up After Tests

Delete created data in `afterEach` or `afterAll` via API calls where applicable.

---

## Authentication & Fixtures

### Global Auth Setup

`utils/auth.setup.ts` runs as a dedicated Playwright setup project before the test suite. It:
1. Navigates to `/login`
2. Completes the full two-step login (email → Continue → password → Continue)
3. Waits for redirect away from `/login`
4. Saves `context.storageState()` to `.auth/user.json`

This session is reused by any test that requires a pre-authenticated browser.

### Override Auth in Login Tests

Tests that test the login page itself must override the stored session to get a clean browser:

```typescript
test.use({ storageState: { cookies: [], origins: [] } });
```

### User Roles

Roles are defined in `utils/users.ts` and map to credentials from environment variables:

```typescript
export type UserRole = "base_user" | "admin_user";

export const USERS: Record<UserRole, UserCredentials> = {
  base_user: { email: ENV.HUDL_EMAIL, password: ENV.HUDL_PASSWORD },
  admin_user: { email: ENV.HUDL_ADMIN_EMAIL, password: ENV.HUDL_ADMIN_PASSWORD },
};
```

---

## Utilities & Helpers

### Environment Configuration

Switch environments via the `HUDL_ENV` variable:

```bash
HUDL_ENV=staging npx playwright test
```

Supported environments and their base URLs are defined in `utils/env.ts`:

```typescript
export const BASE_URLS: Record<Environment, string> = {
  production: "https://www.hudl.com",
  staging:    "https://staging.hudl.com",
};
```

### Navigation Helper

`pages/navigation.page.ts` provides URL-based navigation for consistency:

```typescript
export class Navigation {
  async toLoginByURL(): Promise<void> {
    await this.page.goto("/login");
  }
  async toHomeByURL(): Promise<void> {
    await this.page.goto("/home");
  }
}
```

---

## Error Handling

### Do Not Swallow Errors Silently

```typescript
// WRONG — hides real failures
await element.click().catch(() => {});

// CORRECT — if a failure is expected and safe, document it
await spinner.waitFor({ state: "visible", timeout: 2000 })
  .catch(() => {}); // Spinner may appear too briefly to catch — not a failure
```

### Do Not Use `isVisible()` as Conditional Logic

```typescript
// WRONG — silently skips if element is missing
if (await element.isVisible()) {
  await element.click();
}

// CORRECT — if it should be there, wait for it
await element.waitFor({ state: "visible" });
await element.click();
```

---

## Code Quality

- **Self-documenting names** — functions and variables should read like plain English
- **Small, single-purpose functions** — one responsibility per method
- **No duplication** — extract repeated logic into helpers
- **No secrets in code** — credentials in `.env`, never hardcoded
- **Minimum wait timeout: 5000ms** — 500ms waits cause flakiness
- **No `console.log`** in committed code
- **No `test.only`** in committed code

---

## PR Requirements

- [ ] Pipeline must pass before review
- [ ] Small, focused PRs — avoid 20+ files or mixing unrelated changes
- [ ] No `test.only` or `test.describe.only` left in code
- [ ] No commented-out code
- [ ] No `console.log` debug statements
- [ ] PR description explains **what** changed and **why**
- [ ] If tests were skipped or unskipped, include justification

---

## Anti-Pattern Quick Reference

| Pattern | Why It's Wrong | Fix |
|---------|---------------|-----|
| `waitForTimeout(N)` | Arbitrary delay | `waitFor()` on a specific element |
| `waitForLoadState('networkidle')` | Hangs on background requests | Wait for a specific element |
| `expect(locator).toBeVisible()` as a mid-flow wait | `expect` is for assertions | `locator.waitFor({ state: 'visible' })` |
| `expect(await locator.isVisible()).toBe(true)` | Non-retrying boolean | `await expect(locator).toBeVisible()` |
| Assertions in page objects | Breaks POM encapsulation | Return data; assert in spec |
| `getByRole("button", { name: "Continue" })` without `exact: true` | Matches social login buttons too | Add `exact: true` |
| `getByLabel("Password")` on Hudl step 2 | Matches show/hide toggle button too | Use `locator('[data-qa-id="password-input-input"]')` |
| Exposing raw locators via getters | Breaks POM encapsulation | Encapsulate in action methods |
| `isVisible()` as conditional check | Silently skips missing elements | `waitFor()` |
| `.catch(() => {})` without comment | Hides real failures | Document why error is expected |
| `console.log` in committed code | Noise in output | Remove before PR |
| `test.only` in committed code | Blocks all other tests | Remove before PR |
| Hardcoded credentials | Security risk | Use `USERS.base_user.email` from env |
