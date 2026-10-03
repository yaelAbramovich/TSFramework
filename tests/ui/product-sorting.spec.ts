import { test, expect } from '../../src/infrastructure/fixtures';
import { environmentConfiguration } from '../../src/config/environment';

[
  {
    username: environmentConfiguration.applicationUsername,
    password: environmentConfiguration.applicationPassword,
  },
].forEach(({ username, password }) => {
  test('Sorting products by price sorts them correctly', async ({ loginPage, productsPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.submitLoginFormWithCredentials(username, password);

    const namesBeforeSort = await productsPage.getProductNames();
    const pricesBeforeSort = await productsPage.getProductPrices();

    expect(namesBeforeSort.length, 'Expected product names to be retrieved').toBeGreaterThan(0);
    expect(pricesBeforeSort.length, 'Expected product prices to be retrieved').toBeGreaterThan(0);

    await productsPage.selectSortByPriceLowToHigh();

    const pricesAfterSort = await productsPage.getProductPrices();

    const ascendingPrices = [...pricesBeforeSort].sort((a, b) => a - b);
    expect(pricesAfterSort, 'Expected products to be sorted by price ascending').toEqual(
      ascendingPrices,
    );
  });
});
