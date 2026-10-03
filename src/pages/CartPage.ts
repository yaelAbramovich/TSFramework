import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductCard } from './ProductCard';

/**
 * CartPage reuses ProductCard for reading each cart item's own
 * name/price/description - the cart renders the same data-test
 * attributes as a product card on ProductsPage (its "Add to cart"
 * button is replaced by "Remove", which ProductCard never looks for
 * here, so that part of ProductCard is simply unused on this page).
 */
export class CartPage extends BasePage {
  private readonly cartItemRoots: Locator;

  public constructor(page: Page) {
    super(page, 'CartPage');

    this.cartItemRoots = this.page.getByTestId('inventory-item').describe('Cart item');
  }

  public async getCartItems(): Promise<ProductCard[]> {
    const itemCount = await this.cartItemRoots.count();
    return Array.from(
      { length: itemCount },
      (_, index) => new ProductCard(this.page, this.cartItemRoots.nth(index)),
    );
  }

  public async getCartItemByName(productName: string): Promise<ProductCard> {
    const cartItems = await this.getCartItems();
    const names = await Promise.all(cartItems.map((cartItem) => cartItem.getProductName()));
    const matchingIndex = names.indexOf(productName);

    if (matchingIndex === -1) {
      throw new Error(`No cart item found with name "${productName}"`);
    }

    return cartItems[matchingIndex];
  }

  public async validateCartPageDisplay(): Promise<void> {
    await this.assertCurrentPageUrlContains('cart.html', 'Cart page URL');
  }
}
