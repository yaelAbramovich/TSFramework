import { test, expect } from '../../src/infrastructure/fixtures';

test('Adding a dynamically selected product to the cart', async ({
  productsPage,
  productDetailsPage,
  header,
  cartPage,
}) => {
  await productsPage.navigateToProductsPage();
  await productsPage.validateProductsPageDisplay();

  const cartItemCountBeforeAdding = await header.getCartItemCount();
  expect(cartItemCountBeforeAdding, 'Expected the cart to start empty').toBe(0);

  const selectedProductCard = await productsPage.getCheapestProductCard();
  const selectedProductName = await selectedProductCard.getProductName();
  const selectedProductPrice = await selectedProductCard.getProductPrice();
  const selectedProductDescription = await selectedProductCard.getProductDescription();

  expect(selectedProductName, 'Expected the selected product to have a name').toBeTruthy();
  expect(
    selectedProductPrice,
    'Expected the selected product to have a positive price',
  ).toBeGreaterThan(0);

  await selectedProductCard.clickViewProductDetailsLink();
  await productDetailsPage.validateProductDetailsPageDisplay();

  const detailsName = await productDetailsPage.getProductName();
  const detailsPrice = await productDetailsPage.getProductPrice();
  const detailsDescription = await productDetailsPage.getProductDescription();

  expect(
    detailsName,
    'Expected the product details name to match the selected product',
  ).toBe(selectedProductName);
  expect(
    detailsPrice,
    'Expected the product details price to match the selected product',
  ).toBe(selectedProductPrice);
  expect(
    detailsDescription,
    'Expected the product details description to match the selected product',
  ).toBe(selectedProductDescription);

  await productDetailsPage.clickAddToCartButton();

  await header.clickCartIcon();
  await cartPage.validateCartPageDisplay();

  const cartItems = await cartPage.getCartItems();
  expect(cartItems.length, 'Expected exactly one item in the cart').toBe(1);

  const cartItem = await cartPage.getCartItemByName(selectedProductName);
  const cartItemPrice = await cartItem.getProductPrice();
  const cartItemDescription = await cartItem.getProductDescription();

  expect(cartItemPrice, 'Expected the cart item price to match the selected product').toBe(
    selectedProductPrice,
  );
  expect(
    cartItemDescription,
    'Expected the cart item description to match the selected product',
  ).toBe(selectedProductDescription);
});
