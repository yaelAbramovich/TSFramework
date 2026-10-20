# Running the tests in Docker

The tests run inside the official Playwright image, so no local Node or browser install is needed.

## Prerequisites
- Docker (Desktop or Engine) with Compose v2
- A `.env` file — copy it from the example and adjust if needed:
  ```bash
  cp .env.example .env
  ```
  `.env` is gitignored and excluded from the image (`.dockerignore`); it is passed in at run time via `env_file`.

## Commands
```bash
npm run docker:build         # build the image
npm run docker:test          # run all tests
npm run docker:test:api      # API tests only
npm run docker:test:ui       # UI tests only
```

Without npm:
```bash
docker compose build
docker compose run --rm tests                                   # all tests
docker compose run --rm tests npx playwright test -g "title"    # any Playwright command
```

## Reports
`playwright-report/` and `test-results/` are mounted to the host, so after a run:
```bash
npm run report
```

## Files
| File | Purpose |
|---|---|
| `Dockerfile` | Playwright base image, `npm ci`, runs as non-root `pwuser`, default `npm test` |
| `.dockerignore` | Keeps `.env`, `node_modules`, `.git` and reports out of the image |
| `docker-compose.yml` | Loads `.env`, sets `ipc: host`, mounts report folders |

## Notes
- The image tag in the `Dockerfile` (`v1.62.1-noble`) must match the installed `@playwright/test` version — update both together.
- `ipc: host` prevents Chromium crashes from limited shared memory.
- The image runs with `CI=true`.
