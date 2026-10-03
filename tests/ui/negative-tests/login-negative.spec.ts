import { test } from '../../../src/infrastructure/fixtures';

[{ username: 'standard_user', password: 'wrong-password' }].forEach(({ username, password }) => {
  test('Login with invalid credentials shows an error', async ({ loginPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.submitLoginFormWithCredentials(username, password);

    await loginPage.assertInvalidCredentialsErrorIsVisible();
  });
});
