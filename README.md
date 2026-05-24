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

Auth runs once before any tests start and the session is saved to `.auth/user.json`. All workers share that file — no re-authentication happens in parallel. Locally, Playwright uses its default worker count (based on CPU cores). CI uses 2 workers.

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

### Playwright HTML Report

Generated automatically into `playwright-report/` on every local run. Open it with:

```bash
npm run test:report
```

This starts a local server and opens the report at **http://localhost:9323**. If your browser does not open, navigate there manually. If port 9323 is in use:

```bash
npx playwright show-report --port 9324
```

### Allure Report (CI only)

The Allure reporter is enabled in CI only. After a GitHub Actions run, the `allure-report` artifact is uploaded and retained for 30 days. Download it from the run's **Artifacts** section and open `index.html` locally.

> Both `allure-results/` and `allure-report/` are gitignored and never committed.

---

## Project Structure

```
hudl.login/
├── .github/
│   └── workflows/
│       ├── playwright.yml      # Full suite — push/PR to main + manual
│       ├── smoke.yml           # Smoke tests — push/PR to main + manual
│       ├── desktop.yml         # Desktop (chromium) — manual only
│       └── mobile.yml          # Mobile (Pixel 7 + iPhone 15) — manual only
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
├── bestpractices.md            # Playwright coding standards — read before adding tests
├── playwright.config.ts        # Playwright configuration
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

Four workflows are available, each authenticating once and running with 4 workers.

| Workflow | File | Trigger | Browsers | Command |
| -------- | ---- | ------- | -------- | ------- |
| Full Suite | `playwright.yml` | push/PR to `main`, manual | chromium, mobile-chrome, mobile-safari | `playwright test` |
| Smoke Tests | `smoke.yml` | push/PR to `main`, manual | chromium, mobile-chrome, mobile-safari | `playwright test --grep @smoke` |
| Desktop Tests | `desktop.yml` | manual only | chromium | `playwright test --project=chromium` |
| Mobile Tests | `mobile.yml` | manual only | mobile-chrome, mobile-safari | `playwright test --project=mobile-chrome --project=mobile-safari` |

In every workflow, auth runs once via the `setup` project (which Playwright resolves automatically through project dependencies), writes `.auth/user.json`, and all 4 workers share that session file.

Each workflow uploads three artifacts retained after the run:

| Artifact | Retention |
| -------- | --------- |
| `playwright-report-<suite>` | 30 days |
| `test-results-<suite>` | 7 days |
| `allure-report-<suite>` | 30 days |

### Required GitHub Secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret                | Required | Description                                                   |
| --------------------- | -------- | ------------------------------------------------------------- |
| `HUDL_EMAIL`          | Yes      | Test account email (standard user)                            |
| `HUDL_PASSWORD`       | Yes      | Test account password                                         |
| `HUDL_ADMIN_EMAIL`    | No       | Admin account email — falls back to `HUDL_EMAIL`              |
| `HUDL_ADMIN_PASSWORD` | No       | Admin account password — falls back to `HUDL_PASSWORD`        |
| `SLACK_WEBHOOK_URL`   | No       | Incoming webhook URL — Slack step is skipped safely if absent |

### Steps run in every workflow

1. Checkout repository
2. Set up Node.js 24 and install dependencies (`npm ci`)
3. Lint (Full Suite only — fast gate before running tests)
4. Install Playwright browsers (`chromium` + `webkit` where needed)
5. Run tests — auth fires once, 4 workers run in parallel
6. Upload Playwright HTML report, raw test results, and Allure report as artifacts
7. Send Slack notification on success (skipped safely if `SLACK_WEBHOOK_URL` is not set)

> **Viewing CI reports:** Go to the workflow run on GitHub → **Artifacts** at the bottom. Download `playwright-report-<suite>` or `allure-report-<suite>` and open `index.html` locally. GitHub does not serve HTML directly due to CSP restrictions.

### Gitignored Files (never committed)

| Path                 | Why                           |
| -------------------- | ----------------------------- |
| `.env`               | Contains credentials          |
| `.auth/`             | Contains saved login sessions |
| `node_modules/`      | Installed packages            |
| `test-results/`      | Raw test output               |
| `playwright-report/` | HTML report                   |
| `allure-results/`    | Raw Allure data               |
| `allure-report/`     | Generated Allure report       |

---

## Configuration

Key settings in `playwright.config.ts`:

| Setting    | Local          | CI             |
| ---------- | -------------- | -------------- |
| Retries    | 0              | 2              |
| Workers    | 4              | 4              |
| Headless   | Yes            | Yes            |
| Trace      | On first retry | On first retry |
| Screenshot | On failure     | On failure     |
| Video      | On failure     | On failure     |

---

## Contributing

Before adding or modifying tests, read [bestpractices.md](bestpractices.md) — it documents the team's Playwright coding standards for page objects, selectors, assertions, and test structure.

---

## Troubleshooting

**Auth session errors / tests fail before reaching the login page**
Delete the cached session and re-run — it will be regenerated automatically:

```bash
# macOS / Linux
rm -f .auth/user.json

# Windows (PowerShell)
Remove-Item .auth\user.json -ErrorAction SilentlyContinue
```

**`.env` file not found**
Make sure you've copied `.env.sample` to `.env` (see [Setup](#setup)) and filled in your credentials. The file must be in the project root.

**Tests pass locally but fail in CI**
Check that all required GitHub Secrets are set under **Settings → Secrets and variables → Actions**. A missing `HUDL_EMAIL` or `HUDL_PASSWORD` will cause auth setup to fail before any tests run.

**Browser not installed**
Re-run the browser install step:

```bash
npx playwright install chromium webkit
```
