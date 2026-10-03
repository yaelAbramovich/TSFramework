import { test as base, APIRequestContext, expect } from '@playwright/test';
import { AuthApiClient, RegisteredUser } from '../api/AuthApiClient';
import { TasksApiClient } from '../api/TasksApiClient';
import { environmentConfiguration } from '../config/environment';
import { generateUniqueEmail } from '../utils/testData';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { Logger } from './Logger';

const DEFAULT_PASSWORD = 'Password123';
const DEFAULT_NAME = 'QA Test';

export interface AuthenticatedApiContext {
  // Has the Authorization header already set - protected API clients are
  // built from this instead of the plain `request` fixture, so they never
  // touch the access token directly.
  requestContext: APIRequestContext;
  user: RegisteredUser;
  credentials: { email: string; password: string };
}

export interface TaskCleanup {
  // Deletion happens in this fixture's teardown (after the test body
  // finishes, pass or fail), not inline here - that's what makes cleanup
  // resilient to a failed assertion elsewhere in the test.
  registerTaskForCleanup(taskId: string): void;
}

/**
 * Global Playwright fixtures — everything that is broadly useful across the
 * whole test tree lives here. Tests (or suite-local fixture files) import
 * `test` from this module and extend it further when they need fixtures
 * that are only meaningful to a subset of tests.
 *
 * Playwright lazily instantiates each fixture the first time a test's
 * parameter list references it, so unused fixtures cost nothing.
 *
 * To add a global fixture (e.g. a POM or API client):
 *   1. Add its type to `TestFixtures`.
 *   2. Add the factory under `.extend<TestFixtures>({ ... })`.
 *
 * Scope: fixtures default to test-scoped (fresh instance per test), which
 * matches `page`/`request` — Playwright's built-in fixtures we wrap are also
 * test-scoped, so construction stays aligned with the browser/request
 * lifecycle.
 */
export interface TestFixtures {
  authApiClient: AuthApiClient;
  authenticatedApiContext: AuthenticatedApiContext;
  authenticatedApiClient: AuthApiClient;
  tasksApiClient: TasksApiClient;
  authenticatedTasksApiClient: TasksApiClient;
  taskCleanup: TaskCleanup;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}

export const test = base.extend<TestFixtures>({
  authApiClient: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },
  tasksApiClient: async ({ request }, use) => {
    await use(new TasksApiClient(request));
  },
  authenticatedApiClient: async ({ authenticatedApiContext }, use) => {
    await use(new AuthApiClient(authenticatedApiContext.requestContext));
  },
  authenticatedTasksApiClient: async ({ authenticatedApiContext }, use) => {
    await use(new TasksApiClient(authenticatedApiContext.requestContext));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  taskCleanup: async ({ authenticatedTasksApiClient }, use) => {
    const logger = new Logger('TaskCleanup');
    const taskIdsToDelete: string[] = [];

    await use({
      registerTaskForCleanup: (taskId: string) => {
        taskIdsToDelete.push(taskId);
      },
    });

    // Runs after the test body, regardless of whether its assertions
    // passed or failed. Cleanup itself must never throw - that would mask
    // the test's own result - so a failed delete is logged, not asserted.
    for (const taskId of taskIdsToDelete) {
      try {
        const { response } = await authenticatedTasksApiClient.deleteTask(taskId);
        if (!response.ok()) {
          logger.warn(`Cleanup: DELETE /api/tasks/${taskId} returned status ${response.status()}`);
        }
      } catch (cleanupError) {
        logger.warn(`Cleanup: failed to delete task ${taskId} - ${String(cleanupError)}`);
      }
    }
  },
  authenticatedApiContext: async ({ playwright, authApiClient }, use) => {
    const email = generateUniqueEmail();
    const password = DEFAULT_PASSWORD;

    const { response: registerResponse, registerResult } = await authApiClient.register(
      email,
      password,
      DEFAULT_NAME,
    );
    expect(
      registerResponse.status(),
      `authenticatedApiContext fixture: register for "${email}" returned status ${registerResponse.status()} instead of 201`,
    ).toBe(201);

    const { response: loginResponse, loginResult } = await authApiClient.login(email, password);
    expect(
      loginResponse.status(),
      `authenticatedApiContext fixture: login for "${email}" returned status ${loginResponse.status()} instead of 200`,
    ).toBe(200);

    const requestContext = await playwright.request.newContext({
      baseURL: environmentConfiguration.apiBaseUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${loginResult.access_token}` },
    });

    await use({
      requestContext,
      user: registerResult.user,
      credentials: { email, password },
    });

    await requestContext.dispose();
  },
});

export { expect } from '@playwright/test';
