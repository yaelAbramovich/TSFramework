# TS Framework

A Playwright + TypeScript test suite. It covers a UI app ([SauceDemo](https://www.saucedemo.com/)) and an API ([DummyJSON](https://dummyjson.com/)). The full task is described in [`EXERCISE.md`](./EXERCISE.md).

## What's inside

- **API tests** — login, product search, pagination, plus negative cases (bad login, missing product, bad pagination).
- **UI tests** — sorting products by price, plus a negative case (bad login).
- **E2E tests** — one full user journey: log in, pick a product, open its details, add it to the cart, check the cart.
- Schema validation on one API response (using [Zod](https://zod.dev/)).
- Everything also runs in Docker.

## Prerequisites

- Node.js 20+
- Docker (only needed if you want to run tests in a container)

## Setup

```bash
npm install
npx playwright install chromium
```

## Configuration

Settings come from environment variables, read in `src/config/environment.ts`. You don't need to set anything to run the tests — real working defaults are already built in (they point at the public SauceDemo and DummyJSON demo sites).

If you want to override anything, copy `.env.example` to `.env` and fill in real values. `.env.example` only has placeholder values — never real ones.

```bash
cp .env.example .env
```

`.env` is in `.gitignore` and must never be committed.

## Running the tests

```bash
npm test                # everything
npm run test:api        # API tests only
npm run test:ui         # UI tests only
npm run test:e2e        # the full user-journey test only
npm run report          # open the last HTML report
```

Other useful commands:

```bash
npm run typecheck       # check TypeScript types
npm run lint            # check code style
npm run test:headed     # run UI tests with a visible browser
npm run test:debug      # step through a test in Playwright's inspector
```

## Running in Docker

```bash
docker build -t automation-tests .
docker run --rm automation-tests
```

This builds an image with everything pre-installed (Node.js, Playwright, browsers), then runs the full test suite inside it. No extra setup needed — it uses the same built-in defaults as running locally.

## Project structure

```
src/
  api/              API clients (one per API area, e.g. AuthApiClient)
  pages/            Page objects (one per UI page/component)
  infrastructure/   Shared fixtures and logging
  config/           Environment configuration
  utils/            UI text strings (strings.json)
tests/
  api/              API tests (+ negative-tests/ subfolder)
  ui/               UI tests (+ negative-tests/ subfolder)
  e2e/              Full user-journey tests
  setup/            Logs in once; every test reuses that login
```

A test never talks to Playwright directly — it always goes through a page object or API client. See `CLAUDE.md` for the full set of conventions this project follows.

## CI

`.github/workflows/playwright.yml` runs on demand (manual trigger). You pick which suite to run (`all`, `api`, `ui`, or `e2e`). It installs Chromium, type-checks, lints, runs the chosen suite, and uploads the HTML report as a downloadable artifact — including traces, screenshots, and videos for anything that failed.

## Design decisions

### Part 4 — API + UI: no forced correlation

SauceDemo (the UI) and DummyJSON (the API) are two unrelated demo systems. SauceDemo sells backpacks and t-shirts; DummyJSON's catalog is phones and laptops. There is no shared backend and no product that exists in both. Nothing connects them.

Because of that, a test that fetches a product from the API and checks it appears in the UI (or the other way around) is not just hard — it's impossible to write honestly. The two catalogs never overlap, so a test like that could only pass by coincidence, or by faking a relationship that doesn't exist.

The exercise explicitly allows for this:

> "You are not required to force an artificial end-to-end relationship between the two systems. If the systems cannot be meaningfully correlated, explain your design decision."

This is that explanation. No Part 4 test was written, because:

1. **There's no real relationship to check.** An API+UI test only has value when it confirms two views of the *same* data agree. Here, there is no shared data.
2. **A fake correlation would be misleading, not useful.** Pairing "the cheapest DummyJSON product" with "the cheapest SauceDemo product" would look like a real cross-system check, but would prove nothing about the two systems actually agreeing on anything.
3. **A shared convention (e.g. "both show price as a positive number") isn't a real connection either** — it just means two unrelated systems happened to pick a sensible number type.

If the two systems *did* share real data — for example, if SauceDemo's catalog were actually powered by the DummyJSON API — the right Part 4 test would fetch the data from the API and use the UI only to confirm it renders correctly, instead of duplicating logic in both places. This suite already does exactly that pattern, just within one system: [`tests/e2e/dynamic-product-flow.spec.ts`](./tests/e2e/dynamic-product-flow.spec.ts) reads a product's data from the product list, then checks that same data reappears correctly on the details page and in the cart.
