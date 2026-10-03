import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Header represents the site header rendered on every authenticated page
 * (Products, product details, cart, ...). It's registered as its own
 * fixture rather than wrapped by each page, since it's identical
 * regardless of which page is currently shown.
 */
export class Header extends BasePage {
  private readonly cartIcon: Locator;
  private readonly cartBadge: Locator;

  public constructor(page: Page) {
    super(page, 'Header');

    this.cartIcon = this.page.getByTestId('shopping-cart-link').describe('Cart icon');
    this.cartBadge = this.page
      .getByTestId('shopping-cart-badge')
      .describe('Cart item count badge');
  }

  public async clickCartIcon(): Promise<void> {
    await this.clickOnElement(this.cartIcon, 'Cart icon');
  }

  public async getCartItemCount(): Promise<number> {
    const badgeText = await this.getVisibleTextFromElementOrEmpty(
      this.cartBadge,
      'Cart item count badge',
    );
    return badgeText === '' ? 0 : Number(badgeText);
  }
}
