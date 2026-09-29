import { test, expect } from '../../src/infrastructure/fixtures';

[{ searchQuery: 'phone' }].forEach(({ searchQuery }) => {
  test(`GET /products/search?q=${searchQuery} succeeds`, async ({ productsApiClient }) => {
    const { response, searchResult } = await productsApiClient.searchProducts(searchQuery);

    expect(
      response.status(),
      `Expected GET /products/search?q=${searchQuery} to return status 200`,
    ).toBe(200);

    expect(searchResult.products, 'Expected searchResult.products to be defined').toBeDefined();
    expect(
      Array.isArray(searchResult.products),
      'Expected searchResult.products to be an array',
    ).toBe(true);

    expect(
      searchResult.total,
      'Expected searchResult.total to be greater than 0',
    ).toBeGreaterThan(0);
    expect(
      searchResult.limit,
      'Expected searchResult.limit to equal products.length',
    ).toBe(searchResult.products.length);

    expect(searchResult.skip, 'Expected searchResult.skip to be 0').toBe(0);

    searchResult.products.forEach((product) => {
      expect(
        product.id,
        `product ${JSON.stringify(product)} "id" must be a number`,
      ).toEqual(expect.any(Number));
      expect(
        product.title,
        `product ${JSON.stringify(product)} "title" must be a string`,
      ).toEqual(expect.any(String));
      expect(
        product.title,
        `product ${JSON.stringify(product)} "title" must not be empty`,
      ).not.toBe('');
      expect(
        product.price,
        `product ${JSON.stringify(product)} "price" must be a number`,
      ).toEqual(expect.any(Number));
      expect(
        product.price,
        `product ${JSON.stringify(product)} "price" must be a positive number`,
      ).toBeGreaterThan(0);
    });

    const productIds = searchResult.products.map((product) => product.id);
    expect(
      new Set(productIds).size,
      'Expected all product ids to be unique',
    ).toBe(productIds.length);
  });
});
