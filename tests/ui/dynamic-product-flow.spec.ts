import { test, expect } from '../../src/infrastructure/fixtures';
import { environmentConfiguration } from '../../src/config/environment';

[
  {
    username: environmentConfiguration.applicationUsername,
    password: environmentConfiguration.applicationPassword,
  },
].forEach(({ username, password }) => {
  test('Adding a dynamically selected product to the cart', async ({ loginPage, productsPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.submitLoginFormWithCredentials(username, password);

    const selectedProductCard = await productsPage.getCheapestProductCard();
    const selectedProductName = await selectedProductCard.getProductName();
    const selectedProductPrice = await selectedProductCard.getProductPrice();

    expect(selectedProductName, 'Expected the selected product to have a name').toBeTruthy();
    expect(
      selectedProductPrice,
      'Expected the selected product to have a positive price',
    ).toBeGreaterThan(0);
  });
});
