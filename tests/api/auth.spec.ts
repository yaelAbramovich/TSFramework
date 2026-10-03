import { test, expect } from '../../src/infrastructure/fixtures';
import { generateUniqueEmail } from '../../src/utils/testData';

[{ email: generateUniqueEmail(), password: 'Password123', name: 'QA Test' }].forEach(
  ({ email, password, name }) => {
    test('POST /api/auth/register creates a new user', async ({ authApiClient }) => {
      const { response, registerResult } = await authApiClient.register(email, password, name);

      expect(
        response.status(),
        'Expected POST /api/auth/register to return status 201',
      ).toBe(201);

      expect(
        registerResult.message,
        'Expected a user-created success message',
      ).toBe('User created successfully');
      expect(registerResult.user.email, 'Expected the registered email to match').toBe(email);
      expect(registerResult.user.name, 'Expected the registered name to match').toBe(name);
      expect(registerResult.user.id, 'Expected a user id to be returned').toBeTruthy();

      const createdAtTimestamp = new Date(registerResult.user.createdAt).getTime();
      expect(
        Number.isNaN(createdAtTimestamp),
        'Expected createdAt to be a valid date',
      ).toBe(false);
    });
  },
);

[{ email: generateUniqueEmail(), password: 'Password123', name: 'QA Test' }].forEach(
  ({ email, password, name }) => {
    test('POST /api/auth/login returns an access token', async ({ authApiClient }) => {
      await authApiClient.register(email, password, name);

      const { response, loginResult } = await authApiClient.login(email, password);

      expect(response.status(), 'Expected POST /api/auth/login to return status 200').toBe(200);

      expect(loginResult.access_token, 'Expected an access token to be returned').toBeTruthy();
      expect(loginResult.token_type, 'Expected the token type to be Bearer').toBe('Bearer');
      expect(
        loginResult.expires_in,
        'Expected expires_in to be a positive number',
      ).toBeGreaterThan(0);
    });
  },
);

test('GET /api/auth/me returns the authenticated user', async ({
  authenticatedApiContext,
  authenticatedApiClient,
}) => {
  const { response, currentUserResult } = await authenticatedApiClient.getCurrentUser();

  expect(response.status(), 'Expected GET /api/auth/me to return status 200').toBe(200);

  expect(
    currentUserResult.user.id,
    'Expected the current user id to match the registered user',
  ).toBe(authenticatedApiContext.user.id);
  expect(
    currentUserResult.user.email,
    'Expected the current user email to match the registered user',
  ).toBe(authenticatedApiContext.credentials.email);
  expect(
    currentUserResult.user.name,
    'Expected the current user name to match the registered user',
  ).toBe(authenticatedApiContext.user.name);
});
