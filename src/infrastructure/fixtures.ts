import { test as base, APIRequestContext, expect } from '@playwright/test';
import { AuthApiClient, RegisteredUser } from '../api/AuthApiClient';
import { TasksApiClient } from '../api/TasksApiClient';
import { environmentConfiguration } from '../config/environment';
import { generateUniqueEmail } from '../utils/testData';

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
