import { test, expect } from '../../src/infrastructure/fixtures';

[{ limit: 10, skip: 10 }].forEach(({ limit, skip }) => {
  test(`GET /products?limit=${limit}&skip=${skip} paginates correctly`, async ({
    productsApiClient,
  }) => {
    const { response, paginationResult } = await productsApiClient.getProducts(limit, skip);

    expect(
      response.status(),
      `Expected GET /products?limit=${limit}&skip=${skip} to return status 200`,
    ).toBe(200);

    expect(
      paginationResult.products.length,
      `Expected ${limit} products to be returned`,
    ).toBe(limit);

    expect(paginationResult.skip, 'Expected the response "skip" to match the requested skip').toBe(
      skip,
    );
    expect(
      paginationResult.limit,
      'Expected the response "limit" to match the requested limit',
    ).toBe(limit);
    expect(paginationResult.total, 'Expected "total" to be a positive number').toBeGreaterThan(0);
  });
});

[{ limit: 10, firstPageSkip: 0, secondPageSkip: 10 }].forEach(
  ({ limit, firstPageSkip, secondPageSkip }) => {
    test(`GET /products pages at skip=${firstPageSkip} and skip=${secondPageSkip} do not share products`, async ({
      productsApiClient,
    }) => {
      const { paginationResult: firstPage } = await productsApiClient.getProducts(
        limit,
        firstPageSkip,
      );
      const { paginationResult: secondPage } = await productsApiClient.getProducts(
        limit,
        secondPageSkip,
      );

      const firstPageIds = firstPage.products.map((product) => product.id);
      const secondPageIds = secondPage.products.map((product) => product.id);
      const duplicateIds = firstPageIds.filter((id) => secondPageIds.includes(id));

      expect(duplicateIds, 'Expected no product ids to appear on both pages').toEqual([]);
    });
  },
);
