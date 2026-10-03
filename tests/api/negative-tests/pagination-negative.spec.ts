import { test, expect } from '../../../src/infrastructure/fixtures';

[
  { limit: -5, skip: 0, invalidParamName: 'limit' },
  { limit: 5, skip: -10, invalidParamName: 'skip' },
].forEach(({ limit, skip, invalidParamName }) => {
  test(`GET /products?limit=${limit}&skip=${skip} fails`, async ({ productsApiClient }) => {
    const { response, paginationResult } = await productsApiClient.getProducts(limit, skip);

    expect(response.status(), 'Expected GET /products to return status 400').toBe(400);

    expect(
      paginationResult.message,
      `Expected an "Invalid '${invalidParamName}'" error message`,
    ).toBe(`Invalid '${invalidParamName}' - should be a positive number`);
  });
});
