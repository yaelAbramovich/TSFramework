# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                              # install dependencies
npx playwright install chromium          # install browser(s) — add firefox/webkit for full cross-browser run
npm run typecheck                        # tsc --noEmit
npm run lint                             # eslint . (no-floating-promises is enforced)
npm test                                 # run all tests, all projects
npm run test:ui                          # only UI specs (tests/ui)
npm run test:api                         # only API specs (tests/api)
npm run test:headed                      # UI in headed mode
npm run test:debug                       # Playwright inspector
npm run report                           # open last HTML report
```

Run a single test / project / file:
```bash
npx playwright test tests/ui/login.spec.ts                   # one file
npx playwright test --project=ui                             # one project
npx playwright test -g "invalid password"                    # by title grep
npx playwright test tests/ui/login.spec.ts:14                 # file + line number
```

## Architecture

The framework layers map 1:1 to folders under `src/`. It ships only the reusable base classes — `BasePage` (`src/pages/BasePage.ts`) and `BaseApiClient` (`src/api/BaseApiClient.ts`) — with no concrete page object or API client yet; `tests/api`, `tests/ui`, `tests/e2e` currently hold only `.gitkeep` placeholders. Add the first concrete POM/API client following the conventions below. A test never talks to Playwright's `Page`/`APIRequestContext` directly — it always goes through a class that extends one of the two base classes.

**Read/write flow of a UI test:**
```
test.spec.ts
  └── ConcretePage extends BasePage      -> src/pages/BasePage.ts
        ├── locators via this.page.getBy*().describe()
        ├── actions/asserts via BasePage helpers
        └── logs via                     -> src/infrastructure/Logger.ts
```

**API tests** follow the same shape: a concrete class extends `BaseApiClient` (`src/api/BaseApiClient.ts`), which wraps Playwright's `APIRequestContext` and adds the same logging conventions. API paths live on the client that uses them (as `private static readonly` constants), not in `strings.json`.

**Fixtures** (`src/infrastructure/fixtures.ts`) is currently an empty `TestFixtures` skeleton (no concrete POM/API client exists yet). Register any new POM or API client as a test-scoped fixture there (built from the built-in `page`/`request` fixtures respectively) — see convention 5 below.

**Configuration** (`src/config/environment.ts`) is the only place `process.env` is read. It exposes a typed `environmentConfiguration` object that `playwright.config.ts` and the rest of the code import. Add a new env var there first, never read `process.env.*` from anywhere else.

**`.env` and `.env.example` must declare the exact same variable names.** The only difference between them is the values: `.env` (gitignored, never committed) holds real, working values; `.env.example` (committed) holds dummy placeholder values only (e.g. `https://example.com/`) — never a real URL or credential, even a non-sensitive demo one. The actual working defaults live as fallback values inside `environment.ts` itself, so `.env.example`'s placeholders are purely illustrative of shape, not meant to work as-is.

## Non-obvious conventions (enforce when editing)

1. **Page UI strings live in `src/utils/strings.json` — customer-facing text only.** The framework is single-language (English). Every piece of text the *application's end user* sees, types, or reads — locator accessible names (the string passed to `getByLabel('…')`, the `name` in `getByRole('…', { name: '…' })`), error / success message fragments — lives in `src/utils/strings.json` under `pages.*`. Callers import the JSON directly: `import strings from '../utils/strings.json'` (enabled by `resolveJsonModule: true` in `tsconfig.json`), then reference `strings.pages.xxx.yyy`. Page-string templates that need interpolation use the `{placeholder}` syntax and are rendered inline with `.replace('{placeholder}', value)`. Tests import the same JSON — do NOT reintroduce `public static readonly` class constants for page strings. If a page is located entirely via `getByTestId` (no accessible name to match on), it may need no `pages.*` entry at all.

   **Out of scope for `strings.json` — internal, test-author-facing copy:** `.describe('…')` text on locators, the `elementDescription` argument passed to `BasePage` helpers, page URL paths, API request paths, and framework log messages. None of these are seen by the application's user — they only ever show up in trace viewer, logs, or reports for whoever is reading the test output. They are inline string literals at the call site (e.g., `.describe('Login button')`, `` this.logger.info(`Clicking on element: ${elementDescription}`) ``), never entries in `strings.json`. Page URL paths and API paths live on the class that uses them (`private static readonly` constants on the concrete `*Page`/`*ApiClient`, with small helpers for parameterised paths).

2. **POMs must extend `BasePage`.** BasePage is the *only* place Playwright's `Locator`/`Page` APIs are consumed for actions and assertions. POMs define locators inline (e.g., `this.page.getByLabel(...)`, `this.page.getByRole(...)`) but every click/fill/assert goes through `BasePage` helpers (`clickOnElement`, `fillElementWithText`, `assertElementIsVisible`, `assertElementContainsText`, …). Each helper takes an `elementDescription` string for the log line.

3. **Locators: follow Playwright's own priority order (https://playwright.dev/docs/locators) — never CSS/XPath.** In order: `getByRole` (highest — matches how assistive tech and users identify elements) → `getByText` → `getByLabel` → `getByPlaceholder` → `getByAltText` → `getByTitle` → `getByTestId` (lower priority — per the docs, "not user facing," use it when you can't locate by role or text) → `page.locator(cssOrXPath)` (last resort only, and only when no `data-test*` attribute could reasonably be added). The user collects locators with Playwright MCP / codegen and pastes them directly into the POM constructor. Playwright does not have `getById`; the closest is `getByTestId` (uses `data-testid` by default — configurable via `testIdAttribute` in `playwright.config.ts` if the app under test uses a different attribute name, e.g. `data-test`).

3a. **Every locator must end with `.describe('…')`, written inline — never from `strings.json`.** After the `getBy*` call, chain `.describe('…')` with a plain string literal so trace viewer / report output is readable. Example: `this.page.getByRole('button', { name: strings.pages.login.submitButtonAccessibleName }).describe('Login submit button')`. Applies to both field locators defined in the constructor and inline/dynamic locators built inside methods. The same literal is passed as the `elementDescription` argument to `BasePage` helpers — one literal, both places.

3b. **Every POM includes a `validate<PageName>PageDisplay()` method.** Its job is to confirm the page has actually rendered and is ready to use — asserting every element a user needs in order to use the page is visible (and, where relevant, enabled), built from `assertElementIsVisible`/`assertElementIsEnabled` etc., not ad hoc checks. Compose it from smaller single-purpose assert methods, same atomic-then-composite shape as actions. Callers (a test, or `test.beforeEach`) call it right after whatever action navigated to the page, before doing anything else — this turns "the page silently failed to load" into one clear, immediate assertion failure instead of a confusing timeout somewhere later, reducing flaky tests.

4. **Web-first assertions only.** `await expect(locator).toBeVisible()` (wrapped as `assertElementIsVisible`) — never `expect(await locator.isVisible()).toBe(true)` and never `locator.waitFor({ state: 'visible' })` as a pre-action gate. Playwright's actions auto-wait; the only reason to assert visibility is to verify a state.

5. **POM/client-as-fixture pattern.** Every POM or API client under `src/pages/` or `src/api/` is exposed as a Playwright fixture in `src/infrastructure/fixtures.ts` (test-scoped, lazily instantiated — Playwright only constructs a fixture the first time a test's parameter list references it). Tests access it via the fixture parameter (e.g. `async ({ checkoutPage }) => …`), never via `new CheckoutPage(page)` inside a test. Add its type to `TestFixtures`, add the factory under `.extend<TestFixtures>({ ... })`.

6. **Test isolation via `test.beforeEach`.** Shared setup (navigate, verify ready state) lives in `beforeEach`, using the same POM fixtures as the tests. Each test gets a fresh Playwright `page` fixture — no shared state between tests.

7. **Playwright best practices are the source of truth.** The reference is https://playwright.dev/docs/best-practices. When reviewing or writing Playwright code, check it against that page and fix anti-patterns proactively (no `waitForTimeout`, no conditional `isVisible()` checks, no CSS/XPath, no manual promise assertions — `@typescript-eslint/no-floating-promises` catches the last one).

8. **POM methods must be small and single-behavior — building blocks, not scripts.** Each public POM method maps to *one* user action — filling one field (`fillUsernameField`), clicking one button (`clickLoginButton`), reading one piece of text. A method must never call the `BasePage`/`BaseApiClient` action helpers (`fillElementWithText`, `clickOnElement`, `sendHttpRequest`, …) more than once — that's the signal it should be split into smaller methods. Multi-step flows (e.g., `submitLoginFormWithCredentials`) are implemented by *calling* the small methods, not by bundling several helper calls into one monolithic body. Rationale: tests must be free to compose only the atomic steps they need (type username only, click submit without password, validate on blur, etc.) — monolithic methods block that; the small methods are the building blocks, the composed method is just one convenient assembly of them. The same rule applies to API clients: one request per method. When adding a POM/API-client method that calls more than one action helper, split it before merging.

8a. **Method names must say exactly what they do.** No vague names like `loginWith` — a reader must know a method's effect from its name alone, without opening the file. An atomic method names the one element + action it touches (`fillUsernameField`, `fillPasswordField`, `clickLoginButton`, `getPostById`), never a generic verb alone (`fill`, `click`, `submit`) and never "with" as a stand-in for the actual parameter. A composed method names the outcome it produces (`submitLoginFormWithCredentials`), not the mechanism.

8b. **Don't parameterize a method over a small, framework-known set of values — write one specific method per value instead.** If the possible inputs are exactly the fixed set of messages/states already defined in `strings.json` (e.g. a login success message vs. specific validation errors), a generic method like `assertFlashMessageContains(expectedFragment: string)` pushes the literal string — and the knowledge of which case is being tested — onto the caller, and the method name no longer says what it checks. Prefer one no-argument method per known outcome (`assertLoginSuccessMessageIsVisible()`, `assertInvalidUsernameErrorIsVisible()`, …), each reading its expected string from `strings.json` internally. Reserve method parameters for values that are genuinely dynamic per call (an ID, a search term, arbitrary user-supplied text).

9. **Test files carry no logic.** A test body is a flat sequence of fixture calls (`exampleLoginPage.navigateToLoginPage()`, `examplePostsApiClient.getPostById(1)`, …) and assertions — no conditionals, loops, computed values, or helper functions defined in the spec file. Anyone should be able to read a test top to bottom and know exactly what it does within a few seconds, and pinpoint the failing step from the trace/log output without reading any other file. All decision-making, data shaping, and control flow belongs in the POM/API client (or a suite-local fixtures file, per convention 5), never in `tests/**/*.spec.ts`.

9a. **API test assertions are bare `expect(value, 'message').toBe(...)` calls — no wrapper-helper file.** There is deliberately no `src/utils/apiAssertions.ts`; every check in an API spec is a direct `expect(...)` call with an explicit message as the second argument (e.g. `expect(createTaskResponse.status(), 'Expected POST /api/tasks to return status 201').toBe(201)`), so the failure output already says what was being checked without needing a named helper. UI assertions still go through `BasePage`'s `assertElementIsVisible`/`assertElementContainsText` etc. — this convention is about API specs only.

## Adding things

- **New page object:** add strings under `pages.newPage.*` in `src/utils/strings.json` for customer-facing text only (accessible names, message fragments) — never a `descriptions.*` sub-object and never a URL path; `.describe()`/`elementDescription`/the page's URL path are inline literals or `private static readonly` constants at the call site instead. If the page is located entirely via `getByTestId`, it may need no `pages.*` entry at all. Create `src/pages/NewPage.ts` extending `BasePage`, `import strings from '../utils/strings.json'`, reference the strings via `strings.pages.newPage.*`, include a `validate<PageName>PageDisplay()` method (convention 3b), and register it as a fixture in `src/infrastructure/fixtures.ts` (add its type to `TestFixtures`, add the factory under `.extend<TestFixtures>({ ... })`). If a string has a `{placeholder}`, substitute it at the call site with `.replace('{placeholder}', value)`.
- **New API client:** create `src/api/NewApiClient.ts` extending `BaseApiClient`. Hold each endpoint path as a `private static readonly` constant on the client; for parameterised paths add a small `private static` helper (e.g., `singleResourcePath(id: number): string`). Do NOT put API paths in `strings.json`.
- **New env var:** add to `.env.example` with a dummy placeholder value (never a real working value), then to `EnvironmentConfiguration` interface + `environmentConfiguration` object in `src/config/environment.ts`, giving the real working default there. If you also use a local `.env`, add the same variable name there too, with a real value.
- **New log message:** write it as a template literal at the call site (e.g., `` this.logger.info(`Doing X with ${value}`) ``). Log copy does not go in `strings.json`.

## CI

`.github/workflows/playwright.yml` installs **only chromium** (per docs' "install only browsers you need"), then runs typecheck → lint → API tests → UI chromium. Traces are captured on the first retry (`trace: 'on-first-retry'` in `playwright.config.ts`); the HTML report is uploaded as an artifact.
