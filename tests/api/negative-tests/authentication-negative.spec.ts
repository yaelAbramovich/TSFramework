import { test, expect } from '../../../src/infrastructure/fixtures';

[{ username: 'emilys', password: 'wrong-password' }].forEach(({ username, password }) => {
  test('POST /auth/login with invalid credentials fails', async ({ authApiClient }) => {
    const { response, loginResult } = await authApiClient.login(username, password);

    expect(response.status(), 'Expected POST /auth/login to return status 400').toBe(400);

    expect(
      loginResult.message,
      'Expected an "Invalid credentials" error message',
    ).toBe('Invalid credentials');

    expect(
      loginResult.accessToken,
      'Expected no access token to be returned',
    ).toBeUndefined();
  });
});
