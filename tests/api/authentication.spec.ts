import { test, expect } from '../../src/infrastructure/fixtures';
import { environmentConfiguration } from '../../src/config/environment';

[
  {
    username: environmentConfiguration.apiUsername,
    password: environmentConfiguration.apiPassword,
  },
].forEach(({ username, password }) => {
  test('POST /auth/login with valid credentials succeeds', async ({ authApiClient }) => {
    const { response, loginResult } = await authApiClient.login(username, password);

    expect(response.status(), 'Expected POST /auth/login to return status 200').toBe(200);

    expect(loginResult.accessToken, 'Expected an access token to be returned').toBeTruthy();
    expect(loginResult.refreshToken, 'Expected a refresh token to be returned').toBeTruthy();

    const { response: currentUserResponse, currentUser } = await authApiClient.getCurrentUser(
      loginResult.accessToken,
    );

    expect(
      currentUserResponse.status(),
      'Expected GET /auth/me with the access token to return status 200',
    ).toBe(200);

    expect(
      currentUser,
      'Expected the authenticated user to match the login response',
    ).toMatchObject({
      id: loginResult.id,
      username: loginResult.username,
      email: loginResult.email,
      firstName: loginResult.firstName,
      lastName: loginResult.lastName,
      gender: loginResult.gender,
      image: loginResult.image,
    });
  });
});
