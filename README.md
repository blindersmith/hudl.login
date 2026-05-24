# Hudl Login E2E Tests

A production-ready Playwright test suite validating the Hudl login flow at [https://www.hudl.com/login](https://www.hudl.com/login).

---

## Prerequisites

- [Node.js](https://nodejs.org/) v24 or higher
- npm v10 or higher

Verify your versions:

```bash
node --version
npm --version
```

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hudl.login
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install chromium webkit
```

### 4. Configure environment variables

Duplicate `.env.sample`, name the copy `.env`, then fill in your credentials:

**macOS / Linux:**

```bash
cp .env.sample .env
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.sample .env
```

Open `.env` and add your credentials:

```env
HUDL_EMAIL=your-test-account@example.com
HUDL_PASSWORD=your-password
HUDL_ADMIN_EMAIL=               # optional — admin account; falls back to HUDL_EMAIL if blank
HUDL_ADMIN_PASSWORD=            # optional — admin password; falls back to HUDL_PASSWORD if blank
HUDL_ENV=production             # or: staging
```

> **Never commit `.env` to source control.** It is listed in `.gitignore` and must stay local.

---

## Running Tests

Tests run **headless** (no visible browser window) by default. Use `test:headed` to watch the browser in action.

All runs use **2 parallel workers** by default — both locally and in CI.

### Run all tests

```bash
npm test
```

### Run smoke tests only

```bash
npm run test:smoke
```

### Run with a visible browser (headed mode)

```bash
npm run test:headed
```

### View the HTML report after a run

```bash
npm run test:report
```

This starts a local server and opens the report automatically at **http://localhost:9323**. If your browser does not open, navigate there manually. If port 9323 is already in use:

```bash
npx playwright show-report --port 9324
```

### Run against a specific environment

**macOS / Linux:**

```bash
HUDL_ENV=staging npm test
```

**Windows (PowerShell):**

```powershell
$env:HUDL_ENV="staging"; npm test
```

---

## Reporting

Two reporters run on every test run: the built-in Playwright HTML reporter and Allure.

### Playwright HTML Report

Generated automatically into `playwright-report/`. Open it with:

```bash
npm run test:report
```

### Allure Report

`allure-playwright` is already installed as a dev dependency. After running the test suite, `allure-results/` is populated. Use `npx` to run the Allure CLI directly — no global install required.

#### One-step: generate and open

```bash
npx allure serve allure-results
```

This generates a temporary report and opens it automatically in your browser on a random available port.

#### Two-step: generate then open

```bash
# Generate a static report into allure-report/
npx allure generate --output allure-report allure-results

# Open the report — auto-launches your browser on a random available port
npx allure open allure-report
```

To pin a specific port:

```bash
npx allure open allure-report --port 9326
```

> Both `allure-results/` and `allure-report/` are gitignored and never committed.

---

## Project Structure

```
hudl.login/
├── .github/
│   └── workflows/
│       └── playwright.yml      # GitHub Actions CI pipeline
├── pages/
│   ├── login-page.ts           # Login page object (two-step: email → password)
│   ├── signup-page.ts          # Create Account page object
│   ├── privacy-policy-page.ts  # Privacy Policy page object
│   ├── terms-page.ts           # Terms of Service page object
│   └── navigation.page.ts      # URL-based navigation helpers and auth check
├── tests/
│   ├── login.spec.ts           # Login flow — 38 tests × 3 browsers
│   ├── signup.spec.ts          # Create Account page — 14 tests × 3 browsers
│   ├── privacy-policy.spec.ts  # Privacy Policy page — 3 tests × 3 browsers
│   └── terms.spec.ts           # Terms of Service page — 2 tests × 3 browsers
├── utils/
│   ├── auth.setup.ts           # Global auth setup — logs in and saves session
│   ├── env.ts                  # Env var loader, environment type and base URLs
│   └── users.ts                # UserRole type and USERS credentials map
├── .auth/                      # Auto-generated; gitignored — stores auth sessions per role
├── .env                        # Local credentials (gitignored)
├── .env.sample                 # Credential template (committed)
├── eslint.config.js
├── .prettierrc
├── bestpractices.md            # Team Playwright coding standards
├── playwright.config.ts        # Playwright configuration
├── run-stress-test.sh          # stability script: 10 headless, 10 headed, or both (--both)
├── tsconfig.json
└── package.json
```

---

## Test Coverage

57 spec tests × 3 browser projects = 171 test runs + 1 auth setup = **172 total**. Every test runs across desktop Chrome, mobile Chrome (Pixel 7), and mobile Safari (iPhone 15).

| Project         | Device             | Viewport  |
| --------------- | ------------------ | --------- |
| `chromium`      | Desktop Chrome     | 1920×1080 |
| `mobile-chrome` | Pixel 7 (Android)  | 412×915   |
| `mobile-safari` | iPhone 15 (Safari) | 393×852   |

### Login — Step 1 (Email)  `login.spec.ts`

| #   | Test                                                                  | Tag      |
| --- | --------------------------------------------------------------------- | -------- |
| 1   | Login page loads with email input and continue button                 | `@smoke` |
| 2   | Hudl logo is visible                                                  |          |
| 3   | Log in heading is visible                                             |          |
| 4   | Email label is visible                                                |          |
| 5   | Rejects empty email when continue is clicked                          |          |
| 6   | Rejects invalid email format before reaching password step            |          |
| 7   | Advances to password step for any valid-format email (no enumeration) |          |
| 8   | Email field accepts text input                                        |          |
| 9   | Submits email step with Enter key                                     |          |
| 10  | Or divider is visible between form and social options                 |          |
| 11  | Continue with Google button is visible                                |          |
| 12  | Continue with Facebook button is visible                              |          |
| 13  | Continue with Apple button is visible                                 |          |
| 14  | Create account link is visible                                        |          |
| 15  | Legal consent text is visible                                         |          |
| 16  | Privacy policy link is visible and points to hudl.com/privacy         |          |
| 17  | Terms of service link is visible and points to hudl.com/terms         |          |

### Login — Step 2 (Password)  `login.spec.ts`

| #   | Test                                                              | Tag      |
| --- | ----------------------------------------------------------------- | -------- |
| 18  | Successful login with valid credentials redirects to home         | `@smoke` |
| 19  | Shows error for incorrect password                                |          |
| 20  | Shows error for unrecognized email and any password               |          |
| 21  | Rejects empty password when submit is clicked                     |          |
| 22  | Password field masks input                                        |          |
| 23  | Password step has a show/hide toggle button                       |          |
| 24  | Show/hide toggle reveals password as plain text                   |          |
| 25  | Show/hide toggle re-masks password after reveal                   |          |
| 26  | Hudl logo is visible                                              |          |
| 27  | Log in heading is visible                                         |          |
| 28  | Email display label is visible                                    |          |
| 29  | Submitted email is shown in the email display field               |          |
| 30  | Edit email link is visible                                        |          |
| 31  | Edit email link returns to email step                             |          |
| 32  | Password label is visible                                         |          |
| 33  | Password required indicator is visible                            |          |
| 34  | Forgot password link navigates to password reset page             |          |
| 35  | Create account link is visible                                    |          |
| 36  | Legal consent text is visible                                     |          |
| 37  | Privacy policy link is visible and points to hudl.com/privacy     |          |
| 38  | Terms of service link is visible and points to hudl.com/terms     |          |

### Create Account Page  `signup.spec.ts`

| #   | Test                                         | Tag      |
| --- | -------------------------------------------- | -------- |
| 1   | Create account page loads with correct heading | `@smoke` |
| 2   | First name label and input are visible       |          |
| 3   | Last name label and input are visible        |          |
| 4   | Email label and input are visible            |          |
| 5   | Continue button is visible                   |          |
| 6   | Or divider is visible                        |          |
| 7   | Continue with Google button is visible       |          |
| 8   | Continue with Facebook button is visible     |          |
| 9   | Continue with Apple button is visible        |          |
| 10  | Already have an account text is visible      |          |
| 11  | Log in link is visible                       |          |
| 12  | Legal consent text is visible                |          |
| 13  | Privacy policy link is visible               |          |
| 14  | Terms of service link is visible             |          |

### Privacy Policy Page  `privacy-policy.spec.ts`

| #   | Test                                                          | Tag      |
| --- | ------------------------------------------------------------- | -------- |
| 1   | Privacy policy page loads with correct heading                | `@smoke` |
| 2   | Privacy policy page contains opening statement                |          |
| 3   | Privacy policy page is reachable from login page privacy link |          |

### Terms of Service Page  `terms.spec.ts`

| #   | Test                                                              | Tag      |
| --- | ----------------------------------------------------------------- | -------- |
| 1   | Terms of service page loads with correct heading                  | `@smoke` |
| 2   | Terms of service page is reachable from login page terms link     |          |

---

## Global Authentication

`utils/auth.setup.ts` runs as a dedicated Playwright setup project before all tests. It:

1. Navigates to `/login`
2. Fills in the email (step 1) and clicks Continue
3. Fills in the password (step 2) and clicks Continue
4. Waits for the redirect away from `/login`
5. Saves the authenticated session to `.auth/user.json`

Any test that requires a pre-authenticated browser can reuse this session without logging in again. The `.auth/` directory is gitignored and never committed.

Tests that test the login page itself override this with a clean browser:

```typescript
test.use({ storageState: { cookies: [], origins: [] } });
```

---

## User Roles

Two roles are supported, configured via environment variables:

| Role         | Env vars used                                                                  |
| ------------ | ------------------------------------------------------------------------------ |
| `base_user`  | `HUDL_EMAIL`, `HUDL_PASSWORD`                                                  |
| `admin_user` | `HUDL_ADMIN_EMAIL`, `HUDL_ADMIN_PASSWORD` (falls back to base user if not set) |

Roles are accessed via the `USERS` map in `utils/users.ts`:

```typescript
import { USERS } from "../utils/users.js";

await loginPage.fillEmail(USERS.base_user.email);
await loginPage.fillEmail(USERS.admin_user.email);
```

---

## Environments

Switch environments by setting `HUDL_ENV` before running tests:

| Value                  | Base URL                   |
| ---------------------- | -------------------------- |
| `production` (default) | `https://www.hudl.com`     |
| `staging`              | `https://staging.hudl.com` |

```bash
HUDL_ENV=staging npm test
```

---

## Linting and Formatting

```bash
npm run lint          # check for lint errors
npm run lint:fix      # auto-fix lint errors
npm run format        # format all files
npm run format:check  # check formatting without writing
```

---

## CI/CD — GitHub Actions

The pipeline runs automatically on every push and pull request to `main`. Manual runs are also supported via `workflow_dispatch`.

### Required GitHub Secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret                | Required | Description                                                   |
| --------------------- | -------- | ------------------------------------------------------------- |
| `HUDL_EMAIL`          | Yes      | Test account email (standard user)                            |
| `HUDL_PASSWORD`       | Yes      | Test account password                                         |
| `HUDL_ADMIN_EMAIL`    | No       | Admin account email — falls back to `HUDL_EMAIL`              |
| `HUDL_ADMIN_PASSWORD` | No       | Admin account password — falls back to `HUDL_PASSWORD`        |
| `SLACK_WEBHOOK_URL`   | No       | Incoming webhook URL — Slack step is skipped safely if absent |

The workflow:

1. Installs Node.js 24 and npm dependencies
2. Runs ESLint — fails fast if lint errors are present
3. Installs Chromium and WebKit browsers (required for mobile-safari project)
4. Runs all 172 tests across `chromium`, `mobile-chrome`, and `mobile-safari` (2 retries on failure in CI)
5. Uploads the Playwright HTML report as an artifact (retained 30 days)
6. Uploads raw test results as an artifact (retained 7 days)
7. Generates and uploads the Allure report as an artifact (retained 30 days)
8. Sends a Slack notification on success (requires `SLACK_WEBHOOK_URL` secret — skipped safely if not configured)

> **Viewing CI reports:** After a workflow run, go to the run page on GitHub → **Artifacts** section at the bottom. Download `playwright-report` or `allure-report` and open `index.html` locally. GitHub does not serve HTML reports directly due to CSP restrictions.

### Gitignored Files (never committed)

| Path                 | Why                           |
| -------------------- | ----------------------------- |
| `.env`               | Contains credentials          |
| `.auth/`             | Contains saved login sessions |
| `node_modules/`      | Installed packages            |
| `test-results/`      | Raw test output               |
| `playwright-report/` | HTML report                   |

---

## Configuration

Key settings in `playwright.config.ts`:

| Setting    | Local          | CI             |
| ---------- | -------------- | -------------- |
| Retries    | 0              | 2              |
| Workers    | 2              | 2              |
| Headless   | Yes            | Yes            |
| Trace      | On first retry | On first retry |
| Screenshot | On failure     | On failure     |
| Video      | On failure     | On failure     |
