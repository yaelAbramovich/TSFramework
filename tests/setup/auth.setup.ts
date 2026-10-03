import { test } from '../../src/infrastructure/fixtures';
import { environmentConfiguration } from '../../src/config/environment';

const authFile = '.auth/user.json';

test('authenticate', async ({ page, loginPage }) => {
  await loginPage.navigateToLoginPage();
  await loginPage.submitLoginFormWithCredentials(
    environmentConfiguration.applicationUsername,
    environmentConfiguration.applicationPassword,
  );

  await page.context().storageState({ path: authFile });
});
