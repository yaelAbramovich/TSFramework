# UPEX DOJO — API + UI Automation Challenge

**Suggested time:** 60 minutes | **Level:** Senior QA Automation | **Application:** UPEX DOJO

## Scenario

You are testing a lightweight task-management application. A user can register, sign in, and manage tasks on a Kanban dashboard. The application exposes a REST API for authentication and task management. Your goal is to build a small, maintainable automated test suite that validates the same task across the API and the UI.

## Application & documentation

- **Live application:** https://dojo.upexgalaxy.com/
- **Interactive API documentation:** https://dojo.upexgalaxy.com/api/docs
- **Project repository / reference:** github.com/upex-galaxy/upex-dojo

## Technical constraints

- Use Playwright Test with TypeScript. Use Playwright's `APIRequestContext` for API calls.
- The API and UI must target the same UPEX DOJO environment and the same test user.
- Use a unique email address for your test run. Do not depend on shared demo data or on a task list being empty.
- Do not hard-code generated user IDs, task IDs, or access tokens.
- Use the Swagger page as the source of truth for request schemas, required fields, response shapes, and allowed enum values.

> **Important:** The public repository documents the main routes and a sample task payload. Verify the exact current schema and status values in the live Swagger UI before implementing.

---

## Your assignment

Build an automated flow that creates a task through the API, verifies it in the UI, changes its status through the UI, and confirms the persisted result through the API.

### Part A — Authentication & API checks (20 min)

- Register a new user through the API using a unique email address and a valid password. Use the request schema shown in Swagger.
- Log in through the API and capture the returned access token. Keep it in a reusable authenticated API context or fixture.
- Call the current-user endpoint and verify that the returned identity matches the registered user.
- Verify that requesting the protected tasks endpoint without authentication is rejected with the expected authorization status.

### Part B — Create and verify a task across layers (25 min)

- Create a task through the API. Give it a distinctive, run-specific title so it can be found reliably.
- Include the required task fields. Use a valid initial status and priority based on the API documentation.
- Validate the response status code and the important response fields. Save the generated task ID.
- Log in to the web application through the UI using the same user created in Part A.
- Open the Dashboard / Kanban board and verify that the task created by the API is visible in the expected column.
- Verify at least the task title and one additional attribute, such as priority or status.

### Part C — UI action + API verification (10 min)

- Move the task to a different status using the UI's Kanban interaction (for example, drag and drop if supported).
- Verify in the UI that the task appears in the destination column.
- Fetch the task by ID through the API and verify that the updated status was persisted.

### Part D — Cleanup (5 min)

- Delete the task through the API when the test is complete, if the endpoint is available and permitted.
- Keep cleanup resilient: a failed assertion should not prevent cleanup from being attempted.

Document any environment limitation that prevents a step from running; do not silently skip it.

---

## Documented API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/auth/me` | Get the authenticated user |
| GET | `/api/tasks` | List the user's tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get a task by ID |
| PATCH | `/api/tasks/:id/status` | Update task status only |
| PUT / DELETE | `/api/tasks/:id` | Update / delete a task |

---

## Implementation expectations

Design the solution as if it were a small real-world automation project, not a single test script.

### Suggested structure

```
tests/
  api/
    auth.spec.ts
    tasks.spec.ts
  ui/
    task-dashboard.spec.ts
src/
  api/        (API clients)
  pages/      (Page Object Models)
  fixtures/   (shared setup and authenticated context)
  types/      (request / response types)
playwright.config.ts
Dockerfile
.dockerignore
README.md
```

You may adjust the structure if you can explain the trade-offs.

### Code quality & framework requirements

- Use reusable API client methods instead of scattering raw requests throughout tests.
- Use fixtures or another clean mechanism to share authentication and test setup.
- Use TypeScript interfaces or types for important API request and response objects.
- Use Page Object Models where they add value; keep locators resilient and user-facing where possible.
- Avoid fixed sleeps. Prefer Playwright auto-waiting and condition-based assertions.
- Keep test data isolated. Generate unique values and avoid assumptions about pre-existing records.
- Use clear assertions for HTTP status codes, response data, and visible UI state.

### Docker requirement

- Provide a `Dockerfile` and `.dockerignore` for the test project.
- The container should install dependencies and run the Playwright test suite.
- Pass the application URL through an environment variable (for example, `BASE_URL`). Do not bake environment-specific values into the test code.
- Document the commands required to build the image and run the tests. Include any required Playwright browser installation steps.

---

## Deliverables

- A working Playwright + TypeScript project.
- Automated API tests and at least one cross-layer API/UI scenario.
- `Dockerfile` and `.dockerignore`.
- README with setup, execution, environment variables, and assumptions.
- A short note describing design decisions, known limitations, and what you would improve with more time.

---

## Optional bonus (if time permits)

- Add a negative registration or login test.
- Validate that one user's tasks are not visible to another user, if the application behavior supports this scenario.
- Add an API-only status update followed by a UI assertion.
- Configure an HTML report or trace collection for failures.

---

## What the interviewer may ask you

- Why did you choose API setup for some steps and UI validation for others?
- How do you prevent tests from depending on execution order or shared data?
- Where should the access token live, and how would you avoid leaking it in logs?
- How would you handle a flaky drag-and-drop interaction?
- What should happen if task creation succeeds but the UI assertion fails?
- How would you make the suite safe to run in parallel?

**Interview mindset:** Prioritize a reliable end-to-end flow, clear assertions, and explainable design decisions over implementing every bonus item.
