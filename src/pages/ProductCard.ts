import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import strings from '../utils/strings.json';

/**
 * ProductCard represents a single repeating product item on ProductsPage.
 * Its locators are scoped to the card's root locator (passed in by
 * ProductsPage) rather than the whole page, so each card acts on only its
 * own name/price/description/button.
 */
export class ProductCard extends BasePage {
  private readonly nameField: Locator;
  private readonly priceField: Locator;
  private readonly descriptionField: Locator;
  private readonly addToCartButton: Locator;
  private readonly viewProductDetailsLink: Locator;

  public constructor(page: Page, rootLocator: Locator) {
    super(page, 'ProductCard');

    this.nameField = rootLocator.getByTestId('inventory-item-name').describe('Product name');
    this.priceField = rootLocator.getByTestId('inventory-item-price').describe('Product price');
    this.descriptionField = rootLocator
      .getByTestId('inventory-item-desc')
      .describe('Product description');
    this.addToCartButton = rootLocator
      .getByRole('button', { name: strings.pages.products.addToCartButtonAccessibleName })
      .describe('Add to cart button');
    this.viewProductDetailsLink = rootLocator
      .getByRole('button', {
        name: new RegExp(`^${strings.pages.products.viewProductDetailsAccessibleNamePrefix}`),
      })
      .first()
      .describe('View product details link');
  }

  public async getProductName(): Promise<string> {
    return this.getVisibleTextFromElement(this.nameField, 'Product name');
  }

  public async getProductPrice(): Promise<number> {
    const priceText = await this.getVisibleTextFromElement(this.priceField, 'Product price');
    return Number(priceText.replace('$', ''));
  }

  public async getProductDescription(): Promise<string> {
    return this.getVisibleTextFromElement(this.descriptionField, 'Product description');
  }

  public async clickAddToCartButton(): Promise<void> {
    await this.clickOnElement(this.addToCartButton, 'Add to cart button');
  }

  public async clickViewProductDetailsLink(): Promise<void> {
    await this.clickOnElement(this.viewProductDetailsLink, 'View product details link');
  }
}
