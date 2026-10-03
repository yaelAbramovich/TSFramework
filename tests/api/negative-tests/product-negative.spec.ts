import { test, expect } from '../../../src/infrastructure/fixtures';

[{ productId: 999999 }].forEach(({ productId }) => {
  test(`GET /products/${productId} for a non-existing product fails`, async ({
    productsApiClient,
  }) => {
    const { response, product } = await productsApiClient.getProductById(productId);

    expect(response.status(), 'Expected GET /products/{id} to return status 404').toBe(404);

    expect(
      product.message,
      'Expected a "Product not found" error message',
    ).toBe(`Product with id '${productId}' not found`);
  });
});
