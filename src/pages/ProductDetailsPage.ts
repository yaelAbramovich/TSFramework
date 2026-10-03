import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductCard } from './ProductCard';
import strings from '../utils/strings.json';

/**
 * ProductDetailsPage reuses ProductCard for reading the product's own
 * name/price/description and clicking "Add to cart" - the details page
 * renders the same data-test attributes as a product card on
 * ProductsPage, just as the single item instead of one of many.
 */
export class ProductDetailsPage extends BasePage {
  private readonly productCard: ProductCard;
  private readonly backToProductsButton: Locator;

  public constructor(page: Page) {
    super(page, 'ProductDetailsPage');

    const detailsRoot = this.page.getByTestId('inventory-item').describe('Product details');
    this.productCard = new ProductCard(page, detailsRoot);

    this.backToProductsButton = this.page
      .getByRole('button', {
        name: strings.pages.productDetails.backToProductsButtonAccessibleName,
      })
      .describe('Back to products button');
  }

  public async getProductName(): Promise<string> {
    return this.productCard.getProductName();
  }

  public async getProductPrice(): Promise<number> {
    return this.productCard.getProductPrice();
  }

  public async getProductDescription(): Promise<string> {
    return this.productCard.getProductDescription();
  }

  public async clickAddToCartButton(): Promise<void> {
    await this.productCard.clickAddToCartButton();
  }

  public async clickBackToProductsButton(): Promise<void> {
    await this.clickOnElement(this.backToProductsButton, 'Back to products button');
  }

  public async validateProductDetailsPageDisplay(): Promise<void> {
    await this.assertCurrentPageUrlContains('inventory-item.html', 'Product details page URL');
  }
}
