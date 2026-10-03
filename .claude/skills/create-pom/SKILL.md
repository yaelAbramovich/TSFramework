---
name: create-pom
description: Generate a Playwright Page Object Model for this repo. Drives Playwright MCP to inspect the target page in a live browser, writes the POM under src/pages/, adds its strings to src/utils/strings.json, extends BasePage if a helper is missing, and registers the POM as a fixture in src/infrastructure/fixtures.ts. Invoked explicitly by the user — never auto-trigger.
argument-hint: [PageClassName]
disable-model-invocation: true
allowed-tools: Bash(npm run typecheck), Bash(npm run lint), Bash(npx playwright test --list)
---

# create-pom

Generates a new Page Object Model for this Playwright framework. Follows every convention in the repo's `CLAUDE.md` **and** every applicable Playwright best practice at <https://playwright.dev/docs/best-practices> and <https://playwright.dev/docs/locators> — no exceptions, no shortcuts. If any rule cannot be satisfied, **stop and ask the user**; do not silently produce a non-compliant POM.

## Playwright best practices this skill enforces

Source of truth: <https://playwright.dev/docs/best-practices> and <https://playwright.dev/docs/locators>. Re-read both pages before generating if the skill hasn't been touched in a while — Playwright docs evolve.

### Locators (most of the skill's correctness lives here)

- **Test user-visible behavior, not implementation.** Locator names and string keys must reflect what a user would see (button text, heading, label) — not CSS class names, component names, or internal ids. A reader of the POM should be able to picture the UI without opening the app.
- **Use Playwright's built-in locators** — they auto-wait and retry on actionability. Never compose your own wait/poll logic around a CSS selector.
- **Follow Playwright's own documented priority order** (<https://playwright.dev/docs/locators>), not an arbitrary one:
  1. `getByRole` — highest priority; matches how assistive tech and users actually identify elements.
  2. `getByText`
  3. `getByLabel`
  4. `getByPlaceholder`
  5. `getByAltText`
  6. `getByTitle`
  7. `getByTestId` — lower priority. The docs are explicit: *"Testing by test id is not user facing... use test ids when you can't locate by role or text."* Still clearly preferable to CSS/XPath when a `data-test*` attribute exists and no role/text/label option works.
  8. `page.locator(cssOrXPath)` — least recommended, last resort only.
- **Chain and filter locators to scope into regions.** For repeating structures (lists, tables, cards, modals), use `.filter({ hasText: '…' })`, `.filter({ has: childLocator })`, and `parent.getByRole(…)` chaining instead of a single long selector. Example:
  ```ts
  this.page
    .getByRole('listitem')
    .filter({ hasText: 'Checkout cart item' })
    .getByRole('button', { name: 'Remove' })
    .describe('Remove item button');
  ```
- **A non-standard test-id attribute is a config change, not a locator-priority exception.** If the app under test marks elements with something other than `data-testid` (e.g. `data-test`), set `testIdAttribute` in `playwright.config.ts` once, then keep using `getByTestId` normally — don't fall back to `page.locator('[data-test=...]')`.
- **Generate locators with codegen when unsure** — `npx playwright codegen <url>` produces the same priority the repo follows. Use it via Playwright MCP; hand-picking brittle selectors is a smell.

### Assertions

- **Web-first assertions only.** `await expect(locator).toBeVisible()` — the framework-level wrapper is `assertElementIsVisible`. Never `expect(await locator.isVisible()).toBe(true)`; that form does not wait and will flake.
- **Never gate actions with `locator.waitFor({ state: 'visible' })`.** Playwright actions already auto-wait. A manual gate adds latency without improving reliability.
- **Use `expect.soft(...)` for aggregate checks** when a single method legitimately needs to assert multiple independent states (e.g. `assertCheckoutSummaryIsCorrect`). Soft assertions let the test collect all failures in one run instead of aborting on the first mismatch. Prefer splitting into focused methods first; reach for soft only when a single logical assertion has genuine sub-parts.
- **Every POM gets a `validate<PageName>PageDisplay()` method** (see Step 6) — not optional, not an afterthought. A page a test can't confirm has actually loaded is a flaky test waiting to happen.

### Test design (POM-adjacent)

- **Tests are independent; POMs are stateless across tests.** The POM must not cache data from one test into another (no module-level mutable state). Every field on the class is either readonly or scoped to a single `page` instance.
- **Don't exercise third-party services from a POM.** If the page integrates with an external provider (payments, auth, maps), the POM wraps *your* UI around it; **never** write assertions that depend on the third party's response. If the test needs to exercise that flow, the test uses Playwright's `page.route()` to mock the third-party call — the POM itself stays third-party-agnostic.

### Tooling / process

- **TypeScript + `@typescript-eslint/no-floating-promises` must stay clean.** Every async POM method is `await`ed by callers; the lint rule catches missing awaits. The skill runs `npm run typecheck` and `npm run lint` at the end — a failure there means the skill is not done.
- **Trace the failure, don't guess.** If a POM method behaves unexpectedly during manual smoke-testing after generation, run the failing scenario with `--trace on` and open it in the trace viewer; do not "fix" the POM by adding waits.

## Inputs you must collect before writing anything

1. **POM class name.** `$ARGUMENTS` if provided (e.g. `/create-pom CheckoutPage`). Otherwise, ask. Rules for the name:
   - Must end with `Page` (e.g. `CheckoutPage`, `ShoppingCartPage`, `UserProfilePage`).
   - Must describe the **purpose** of the page, not its position or index. Reject names like `Page1`, `MyPage`, `TheSecondScreen` — ask the user what the page is actually for and propose a better name.
2. **Navigation steps to reach the page.** Ask the user for the exact sequence of user actions that lead from the app's entry point to the target page. Example: "Log in as a standard user → click the 'Shopping Cart' icon in the header → click 'Checkout'". The skill must follow these literally. If a step is ambiguous, stop and ask — do not guess.
3. **Auth state.** Ask whether the target page requires a logged-in user. There is currently no shared login/`storageState` setup in this framework — if the page needs one, ask the user how they want authentication handled before proceeding (e.g. logging in via UI at the start of the test, or introducing a `storageState`-based setup project).
4. **Optional direct URL.** If the user already knows the URL and it's reachable without going through the nav steps, accept that as a shortcut.

## Preflight (do this every time before touching files)

- Confirm Playwright MCP tools are reachable in the current session. If they aren't, stop and tell the user to start the Playwright MCP server before re-invoking the skill — do not fall back to guessing locators from screenshots or memory.
- Re-read `CLAUDE.md` (sections: "Non-obvious conventions", "Adding things") so any rule updates since this skill was written are picked up.
- Re-read `src/pages/BasePage.ts` and note every `protected`/`public` helper currently exposed (including any `assertElementIsEnabled`/`assertCurrentPageUrlContains`-style helpers already added for other pages). The POM **must reuse** these — never reimplement `click`, `fill`, or `expect` directly.
- Read `src/utils/strings.json` and `src/infrastructure/fixtures.ts` so you know the current shape before editing.
- Check whether `src/pages/<ClassName>.ts` already exists. If it does, ask the user: overwrite, merge, or cancel.
- Check `playwright.config.ts`'s `use.testIdAttribute` — if the target site's test attribute isn't `data-testid` and isn't already configured, that's a config change to make (see Locators above), not a reason to skip `getByTestId`.

## Workflow

### Step 1 — Drive the browser via Playwright MCP

- Open the app at the framework's base URL (`environmentConfiguration.uiBaseUrl` — fall back to `https://the-internet.herokuapp.com`).
- Execute each navigation step the user gave you using Playwright MCP (`browser_navigate`, `browser_click`, `browser_type`, `browser_select_option`, …). Do not invent steps.
- Once the browser is on the target page, capture:
  - An accessibility snapshot (`browser_snapshot`) — gives you every interactive element with its role + accessible name.
  - The raw HTML / DOM — needed to detect `data-test*` attributes that the a11y tree hides, and to check whether an element genuinely has no role/label (only then does `getByTestId` outrank it per the priority order above).
- If the page has several visually distinct regions (header, side nav, main content), inspect each one before deciding which elements belong in this POM. Pages that cover multiple concerns should be split into multiple POMs.

### Step 2 — Pick a locator for every interactive element

For each element you plan to expose as a locator on the POM, walk the priority order from "Locators" above, **in order**, and stop at the first that works: `getByRole` → `getByText` → `getByLabel` → `getByPlaceholder` → `getByAltText` → `getByTitle` → `getByTestId` → chain/filter a locator from one of the above (always prefer this over a deeper CSS selector when scoping into a repeating structure) → `page.locator(cssOrXPath)` as an absolute last resort.

If you reach `page.locator(cssOrXPath)`, first ask the user: would it be possible to add a `data-test*` attribute to the element? Only fall through to a raw selector if they say no.

**If you can't decide between options**, run `npx playwright codegen <url>` via Playwright MCP and let it pick — it applies the same priority and produces Playwright-idiomatic output.

Every locator **must** end with `.describe('Human-readable element name')` — a plain inline string literal, never pulled from `strings.json` (see Step 3). The same literal is passed as the `elementDescription` argument to `BasePage` helpers — one literal, both places.

### Step 3 — Write strings first (customer-facing text only, no hard-coded text in code)

Open `src/utils/strings.json`. Under `pages.<lowerCamelKey>` (strip the `Page` suffix from the class name: `CheckoutPage` → `pages.checkout`, `ShoppingCartPage` → `pages.shoppingCart`), add every piece of text **the application's end user sees, types, or reads**:

```json
"checkout": {
  "urlPath": "/checkout",
  "pageTitleHeadingText": "Checkout",
  "placeOrderButtonAccessibleName": "Place order",
  "orderConfirmedFlashFragment": "Your order is confirmed"
}
```

Rules:

- Customer-facing text only: locator accessible names (what you pass as `getByLabel('…')`, as the `name` in `getByRole('…', { name: '…' })`), URL paths, error/success message fragments. Never reintroduce `public static readonly` class constants for these — import the JSON directly.
- **No `descriptions.*` sub-object.** `.describe()` text and `elementDescription` arguments are internal, test-author-facing strings (they only ever appear in trace viewer/logs/reports) — they are inline literals at the call site (Step 2), never entries in `strings.json`.
- Templates that need runtime values use `{placeholder}` syntax. In the POM, substitute them with `.replace('{placeholder}', value)` at the call site. Do **not** reintroduce a `formatString` / resolver helper — the project explicitly removed it.

### Step 4 — Extend `BasePage` if (and only if) something is missing

Before writing the POM, check which BasePage helpers the new page needs. If an interaction isn't covered (e.g. `selectOptionFromDropdown`, `hoverOverElement`, `uploadFileToInput`, `pressKeyboardKey`, `assertElementIsEnabled`, `assertCurrentPageUrlContains`), add a new `protected`/`public` method to `src/pages/BasePage.ts`:

- Signature: `(elementLocator: Locator, …action-specific args…, elementDescription: string) => Promise<...>`.
- Log the action via `this.logger.info(`<Verb> on element: ${elementDescription}`)` (or similar — match the style already in the file).
- Use only web-first, auto-waiting Playwright APIs. **No** `waitForTimeout`, **no** `locator.waitFor({ state: 'visible' })` as a pre-action gate.
- Assertion helpers follow the existing `assertElement...` pattern and log at `debug` level, not `info`.

If you don't need a new helper, don't touch BasePage.

### Step 5 — Write the POM file

Create `src/pages/<ClassName>.ts` with this exact structure (method groups must appear in this order):

```ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import strings from '../utils/strings.json';

export class <ClassName> extends BasePage {
  // 1. Private readonly locator fields (one per interactive element)
  private readonly <locator1>: Locator;
  private readonly <locator2>: Locator;

  // 2. Constructor — instantiate locators with the priority from Step 2
  public constructor(page: Page) {
    super(page, '<ClassName>');

    this.<locator1> = this.page
      .getByRole('<role>', { name: strings.pages.<key>.<accessibleNameKey> })
      .describe('<Human-readable element name>');
    // …
  }

  // 3. Atomic actions — one user interaction per method
  public async fillUsernameField(username: string): Promise<void> {
    await this.fillElementWithText(
      this.usernameInputLocator,
      username,
      'Username input field',
    );
  }

  public async fillPasswordField(password: string): Promise<void> { /* … */ }
  public async clickLoginSubmitButton(): Promise<void> { /* … */ }

  // 4. Composite actions — compose atomics into reusable flows.
  //    Name composites so the caller can predict behavior from the name alone.
  public async fillUsernamePasswordAndLogin(
    username: string,
    password: string,
  ): Promise<void> {
    await this.fillUsernameField(username);
    await this.fillPasswordField(password);
    await this.clickLoginSubmitButton();
  }

  // 5. Assertions — always at the bottom of the class
  public async assertLoginFormIsVisible(): Promise<void> { /* … */ }

  // 6. validate<PageName>PageDisplay() — always the LAST method (see Step 6)
  public async validate<ClassName>Display(): Promise<void> { /* … */ }
}
```

Rule encoding (these map 1-to-1 to the repo's POM rules — verify each one before saving the file):

| # | Rule | How it's enforced |
|---|---|---|
| 1 | No hard-coded customer-facing strings | Accessible names, URL paths, message fragments come from `strings.pages.<key>.*`. `.describe()`/`elementDescription` text is the one exception — those are inline literals, never in `strings.json` (Step 3). |
| 2 | Uses `BasePage` helpers | Every action / assertion goes through `clickOnElement`, `fillElementWithText`, `assertElementIsVisible`, etc. Missing helper → added to BasePage in Step 4. |
| 3 | Locator priority | `getByRole` → `getByText` → `getByLabel` → `getByPlaceholder` → `getByAltText` → `getByTitle` → `getByTestId` → chain/filter → `locator()` only as absolute last resort (per <https://playwright.dev/docs/locators>). |
| 4 | `.describe()` on every locator, inline | Constructor-level and inline/dynamic locators both chain `.describe('…')` with a plain string literal. |
| 5 | Small atomic + composite methods | Each atom = one user action. At least one composite that bundles atoms (e.g. `fillUsernamePasswordAndLogin`). Never bundle unrelated actions into a single atom. |
| 6 | Informative names | Verb + target + qualifier: `clickCheckoutCtaButton`, `assertCartIsEmpty`, `fillShippingAddressField`. No `click()`, `check()`, `doThing()`. |
| 7 | Registered as a fixture | See Step 7. |
| 8 | Purposeful class name | Ends in `Page`; describes the page's role, not its ordinal position. |
| 9 | Lives under `src/pages/` | File path is `src/pages/<ClassName>.ts`. |
| 10 | No implicit waits | Web-first assertions (`expect(locator).toBeVisible()` wrapped as `assertElementIsVisible`). No `waitForTimeout`, no `locator.waitFor()` as a pre-action gate. |
| 11 | Assertions at the bottom | All `assertXxx()` methods come last, after atomic + composite actions. |
| 12 | Has a `validate<PageName>PageDisplay()` method | See Step 6 — the very last method in the class, after the other assertions. |

### Step 6 — Write a `validate<PageName>PageDisplay()` method

Every POM must include one method whose only job is to confirm the page has actually rendered and is ready to use. This is what turns "the page silently failed to load" into one clear, immediate assertion failure, instead of some unrelated later action timing out confusingly — directly reducing flaky tests.

- Name it `validate<PageName>PageDisplay()` (e.g. `validateCheckoutPageDisplay()`), one no-argument method, placed **after** the other assertion methods — the last method in the class.
- It must assert every element a user needs in order to use this page: at minimum, the key fields/buttons/headings that signal "this page rendered correctly" — built from `assertElementIsVisible`/`assertElementIsEnabled` (or an equivalent existing `BasePage` helper), never a fresh ad hoc check.
- If the page's identity can also be meaningfully confirmed by its URL, include that via an `assertCurrentPageUrlContains`-style helper — but skip it if the URL genuinely can't distinguish this page from another (e.g. a page living at `/` with no differentiating path segment; don't assert something that would pass for any page on the domain).
- Compose it from smaller, single-purpose assert methods (`assertXFieldIsVisible()`, `assertYButtonIsEnabled()`, …) rather than one monolithic body — same atomic-then-composite shape as actions.
- The caller (a test, or `test.beforeEach`) is expected to call this right after whatever action navigated to the page, before doing anything else with it.

### Step 7 — Register as a fixture in `fixtures.ts`

Open `src/infrastructure/fixtures.ts`. Add, following the existing pattern exactly:

```ts
// at the top
import { <ClassName> } from '../pages/<ClassName>';

// inside TestFixtures
<lowerCamel>: <ClassName>;

// inside base.extend<TestFixtures>({ ... })
<lowerCamel>: async ({ page }, use) => {
  await use(new <ClassName>(page));
},
```

Convention: the fixture property is `<lowerCamelClassName>` — e.g. `CheckoutPage` → `checkoutPage`. A test always reaches the POM through the fixture parameter (`async ({ checkoutPage }) => …`); never via a direct `new CheckoutPage(page)` inside a test.

### Step 8 — Verify the result

Run — and do not consider the skill done until both pass cleanly:

```bash
npm run typecheck
npm run lint
```

Then:

```bash
npx playwright test --list
```

The list command won't create tests for the new POM, but it confirms Playwright still parses the config and no existing spec broke.

### Step 9 — Report back

Summarize to the user, in this shape:

- **Class + file path** — `src/pages/<ClassName>.ts`
- **Locator strategies used** — one-line count of each strategy in the final POM: `getByRole: N`, `getByText: N`, `getByLabel: N`, `getByPlaceholder: N`, `getByAltText: N`, `getByTitle: N`, `getByTestId: N`, chained/filtered: N, `locator()`: N. **If `locator()` or any CSS / XPath selector was used, flag it as technical debt** — quote the Playwright best practice ("prefer user-facing attributes over XPath or CSS selectors") and recommend the dev team add a `data-test*` attribute to that element.
- **Strings added** — list the new customer-facing keys under `strings.pages.<key>`.
- **New BasePage helper** — if one was added, name it and explain what it wraps. If none, say "no BasePage change needed".
- **`validate<PageName>PageDisplay()`** — confirm it was added, and name what it checks.
- **Fixture name** — the name of the new fixture property added to `TestFixtures` in `fixtures.ts`.
- **Typecheck + lint status** — pass / fail with error summary if fail.
- **Playwright-best-practice sanity check** — confirm, one line per item: locators follow the documented priority order (no class-name / implementation-detail locators), no implicit waits, all assertions are web-first, any assertion method with multiple independent checks uses `expect.soft` (or is split into separate methods).

## Anti-patterns — refuse and explain

If the user's request would violate any of the rules below, stop and explain why. Do **not** produce the POM.

1. **`Page` or `Locator` used directly in a test file.** Tests access pages only through the POM fixtures exposed by `src/infrastructure/fixtures.ts` (e.g. `async ({ checkoutPage }) => …`).
2. **A POM method that performs more than one user action.** Split into atoms + one composite. The composite is allowed; a monolithic atom that hides multiple clicks is not.
3. **Any `page.waitForTimeout(...)`, arbitrary `setTimeout`, or `.waitFor({ state: 'visible' })` as a pre-action gate.** Web-first assertions only (Playwright best practices: "use web-first assertions", "avoid manual assertions without awaiting").
4. **Manual assertions that don't await** — e.g. `expect(await locator.isVisible()).toBe(true)`. These don't retry and will flake. Use the `assertElementIsVisible` wrapper.
5. **Hard-coded *customer-facing* strings in the POM body** (labels, headings, button names the user sees), even for "obvious" ones. They go in `strings.json`. This does **not** apply to `.describe()`/`elementDescription` text — those are internal, test-author-facing strings and belong inline, never in `strings.json` (Step 3).
6. **Locator built from a CSS / XPath selector** when a `data-test*` attribute, semantic `getBy*`, or chain-and-filter alternative exists. Ask for a test id instead.
7. **Locator that relies on implementation details** (CSS class names, component IDs, framework-generated attributes) — Playwright best practices: "test user-visible behavior". The locator must be expressible in terms the user can see.
8. **`getByTestId` reached for before role/text/label were genuinely ruled out.** Per the documented priority order, test id is a fallback, not a default — check the real DOM for a role, label, or visible text first.
9. **Third-party calls in the POM or test assertions.** Mock them with `page.route()` at the test level; the POM itself stays third-party-agnostic.
10. **Class name that doesn't end in `Page` or doesn't describe a real purpose.**
11. **Skipping fixture registration.** Every POM must be reachable as a fixture in `src/infrastructure/fixtures.ts`; unreachable POMs mean tests can't use them.
12. **Skipping `validate<PageName>PageDisplay()`.** Every POM needs one (Step 6) — a POM a test can't confirm actually loaded is how flaky tests happen.
13. **Reintroducing a `StringResolver` / `formatString` / locale bundle.** This project deliberately removed those — use `.replace('{placeholder}', value)` at the call site for templated strings.

## Example invocation

```
/create-pom CheckoutPage
```

The skill then asks:

> What are the exact navigation steps to reach the checkout page from the app's entry point?
> Does this page require a logged-in user?

…and proceeds through Steps 1–9.
