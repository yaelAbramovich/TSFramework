import { defineConfig, devices } from '@playwright/test';
import { environmentConfiguration } from './src/config/environment';

/**
 * Playwright configuration — aligned with
 * https://playwright.dev/docs/best-practices
 *
 *   - fullyParallel: tests in a single file run in parallel by default
 *   - retries: only on CI (local failures should be investigated, not retried)
 *   - trace: retained for any failed test (not just on retry), since local
 *     runs have 0 retries and a failure should still leave a trace to debug
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: environmentConfiguration.applicationUrl,
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: environmentConfiguration.defaultActionTimeoutMs,
    navigationTimeout: environmentConfiguration.defaultNavigationTimeoutMs,
  },
  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /\.setup\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: environmentConfiguration.apiUrl,
      },
    },
  ],
});
