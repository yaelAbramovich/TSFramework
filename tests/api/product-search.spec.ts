import { test, expect } from '../../src/infrastructure/fixtures';
import { Product } from '../../src/api/ProductsApiClient';

const REQUIRED_PRODUCT_FIELDS: (keyof Product)[] = ['id', 'title', 'price'];

[{ searchQuery: 'phone' }].forEach(({ searchQuery }) => {
  test(`GET /products/search?q=${searchQuery} succeeds`, async ({ productsApiClient }) => {
    const { response, searchResult } = await productsApiClient.searchProducts(searchQuery);

    expect(
      response.status(),
      `Expected GET /products/search?q=${searchQuery} to return status 200, but got ${response.status()}`,
    ).toBe(200);

    expect(
      searchResult.products.length,
      `Expected GET /products/search?q=${searchQuery} to return at least one product`,
    ).toBeGreaterThan(0);

    searchResult.products.forEach((product) => {
      REQUIRED_PRODUCT_FIELDS.forEach((fieldName) => {
        if (fieldName === 'price') return; // price has its own non-negative check below

        expect(
          product[fieldName],
          `product ${JSON.stringify(product)} is missing "${fieldName}"`,
        ).toBeTruthy();
      });
    });

    searchResult.products.forEach((product) => {
      expect(
        product.price,
        `product ${JSON.stringify(product)} "price" must be a non-negative number`,
      ).toBeGreaterThanOrEqual(0);
    });

    const productIds = searchResult.products.map((product) => product.id);
    expect(
      new Set(productIds).size,
      `Expected all product ids to be unique, but got ${JSON.stringify(productIds)}`,
    ).toBe(productIds.length);
  });
});
