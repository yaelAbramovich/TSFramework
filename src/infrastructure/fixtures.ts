import { test as base, expect } from '@playwright/test';
import { AuthApiClient } from '../api/AuthApiClient';
import { ProductsApiClient } from '../api/ProductsApiClient';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { Header } from '../pages/Header';
import { CartPage } from '../pages/CartPage';
import { environmentConfiguration } from '../config/environment';

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
  accessToken: string;
  productsApiClient: ProductsApiClient;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  header: Header;
  cartPage: CartPage;
}

export const test = base.extend<TestFixtures>({
  authApiClient: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },
  productsApiClient: async ({ request }, use) => {
    await use(new ProductsApiClient(request));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  header: async ({ page }, use) => {
    await use(new Header(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  accessToken: async ({ authApiClient }, use) => {
    const { response, loginResult } = await authApiClient.login(
      environmentConfiguration.apiUsername,
      environmentConfiguration.apiPassword,
    );

    expect(
      response.status(),
      `accessToken fixture: login for "${environmentConfiguration.apiUsername}" returned status ${response.status()} instead of 200`,
    ).toBe(200);
    expect(loginResult.accessToken).toBeTruthy();

    await use(loginResult.accessToken);
  },
});

export { expect } from '@playwright/test';
