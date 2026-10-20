import { test, expect } from '../../src/infrastructure/fixtures';
import { loginMethods, seededAccounts } from '../../src/testData/loginService';

for (const { loginMethod, credentials, userConfigs } of seededAccounts) {
  test(`${loginMethod.name} login with valid credentials returns a token`, async ({ loginApiClient }) => {
    const loginApiResponse = await loginApiClient.postLogin(loginMethod, credentials);
    expect(loginApiResponse.status(), `Expected POST ${loginMethod.path} to return status 200`).toBe(200);

    const loginResponse = await loginApiClient.parseLoginResponse(loginApiResponse);
    expect(loginResponse.token, 'Expected a non-empty token').toBeTruthy();
    expect(Date.parse(loginResponse.expires), 'Expected "expires" to be a future date').toBeGreaterThan(Date.now());
    expect(Date.parse(loginResponse.lastLoginAt), 'Expected "lastLoginAt" to be a valid date').not.toBeNaN();
    expect(loginResponse.userConfigs, 'Expected the account\'s userConfigs as key/value entries').toEqual(userConfigs);
  });
}

for (const loginMethod of loginMethods) {
  test(`${loginMethod.name} login with an empty request body returns 400`, async ({ loginApiClient }) => {
    const loginApiResponse = await loginApiClient.postLogin(loginMethod, {});
    expect(loginApiResponse.status(), `Expected POST ${loginMethod.path} to return status 400`).toBe(400);

    const errorResponse = await loginApiClient.parseLoginErrorResponse(loginApiResponse);
    expect(errorResponse.error, 'Expected the "bad_request" error code').toBe('bad_request');
  });
}

for (const { loginMethod, credentials } of seededAccounts) {
  test(`${loginMethod.name} login returns 500 when the stub is told to fail`, async ({ loginApiClient }) => {
    const loginApiResponse = await loginApiClient.postLoginForcingServerError(loginMethod, credentials);
    expect(loginApiResponse.status(), `Expected POST ${loginMethod.path} to return status 500`).toBe(500);

    const errorResponse = await loginApiClient.parseLoginErrorResponse(loginApiResponse);
    expect(errorResponse.error, 'Expected the "internal_server_error" error code').toBe('internal_server_error');
  });
}
