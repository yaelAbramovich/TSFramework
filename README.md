# TSFramework — UPEX DOJO Exercise

Playwright + TypeScript tests for the UPEX DOJO task app. Covers the API
(register, login, tasks) and the UI (Kanban board), including one test
that creates a task through the API, checks it on the UI, drags it to a
new status, and confirms the status was saved — through the API again.

Full exercise brief: [EXERCISE.md](EXERCISE.md).

## Setup

```bash
npm install
npx playwright install chromium
```

Copy `.env.example` to `.env` if you want to override any default (the
app's real URL is already the default, so this step is optional):

```bash
cp .env.example .env
```

## Run the tests

```bash
npm test              # everything
npm run test:api      # API tests only
npm run test:ui       # UI tests only
npm run test:headed   # UI tests, browser visible
npm run report        # open the last HTML report
```

Run one file or one test by name:

```bash
npx playwright test tests/ui/task-dashboard.spec.ts
npx playwright test -g "flows through UI status change"
```

## Environment variables

Set in `.env`, or passed directly to the process. All have working
defaults, so none are required to just run the tests.

| Variable | Meaning | Default |
|---|---|---|
| `BASE_URL` | UI base URL | `https://dojo.upexgalaxy.com` |
| `API_BASE_URL` | API base URL | `https://dojo.upexgalaxy.com` |
| `DEFAULT_ACTION_TIMEOUT_MS` | Playwright action timeout | `10000` |
| `DEFAULT_NAVIGATION_TIMEOUT_MS` | Playwright navigation timeout | `30000` |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` | `info` |

## Docker

```bash
docker build -t ts-framework-tests .
docker run --rm \
  -e BASE_URL=https://dojo.upexgalaxy.com \
  -e API_BASE_URL=https://dojo.upexgalaxy.com \
  ts-framework-tests
```

Browsers are already installed in the base image
(`mcr.microsoft.com/playwright`), so no extra install step is needed
inside the container.

## Project structure

```
src/
  api/             API clients (one class per API, one method per endpoint)
  pages/           Page objects (one class per page)
  infrastructure/  Fixtures, logger
  config/          Reads all environment variables
  utils/           Test data generators, shared strings
tests/
  api/             API-only tests
  ui/              UI tests, including the API+UI cross-layer test
```

See `CLAUDE.md` for the full set of coding conventions this project follows.

## Assumptions

- Every test registers its own brand-new user (unique, timestamp-based
  email) and its own brand-new task (unique, timestamp-based title) — no
  shared or pre-existing data is assumed.
- Tasks created during a test are deleted through the API afterwards
  (cleanup), and that cleanup still runs even if the test itself fails.
- Only Chromium is installed/run by default, matching Playwright's advice
  to install only the browsers you need.

## Design decisions

- **Access token** is kept in a real Playwright `APIRequestContext`
  (`authenticatedApiContext` fixture) with the `Authorization` header
  already set, instead of passing the token string around as a value —
  so it's never logged or threaded through method signatures by hand.
- **Drag-and-drop** on the Kanban board needed a custom mouse sequence
  (`BasePage.dragElementToElement`): Playwright's built-in
  `locator.dragTo()` moves the mouse in one jump, which isn't enough
  movement for this board's drag library (dnd-kit) to register a drag at
  all. Confirmed live against the real app before writing the helper.
- **Cleanup** deletes the task in a fixture's teardown step, which
  Playwright always runs after the test body — pass or fail — so a failed
  assertion never skips cleanup. The teardown also re-fetches the task by
  ID afterwards to confirm the delete actually persisted, instead of
  trusting the delete response alone.

## Known limitations / what I'd improve with more time

- Only one cross-layer scenario exists (create → UI check → drag → API
  check → delete). The optional bonus items from the exercise (negative
  auth tests, cross-user task isolation, an API-only status update
  followed by a UI check) aren't implemented yet.
- Cross-browser runs (Firefox/WebKit) aren't wired up — only Chromium, to
  match CI's browser-install guidance from Playwright's docs.
- Page objects don't yet have a `validate<PageName>PageDisplay()` method
  (a project convention for confirming a page has fully rendered before
  interacting with it) — assertions currently check individual elements
  directly instead.
