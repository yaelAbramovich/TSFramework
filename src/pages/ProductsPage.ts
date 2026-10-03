import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductCard } from './ProductCard';
import strings from '../utils/strings.json';

export class ProductsPage extends BasePage {
  private readonly productCardRoots: Locator;
  private readonly sortDropdown: Locator;

  public constructor(page: Page) {
    super(page, 'ProductsPage');

    this.productCardRoots = this.page.getByTestId('inventory-item').describe('Product card');
    this.sortDropdown = this.page
      .getByLabel(strings.pages.products.sortDropdownAccessibleName)
      .describe('Sort products dropdown');
  }

  public async getProductCards(): Promise<ProductCard[]> {
    const cardCount = await this.productCardRoots.count();
    return Array.from(
      { length: cardCount },
      (_, index) => new ProductCard(this.page, this.productCardRoots.nth(index)),
    );
  }

  public async getProductNames(): Promise<string[]> {
    const cards = await this.getProductCards();
    return Promise.all(cards.map((card) => card.getProductName()));
  }

  public async getProductPrices(): Promise<number[]> {
    const cards = await this.getProductCards();
    return Promise.all(cards.map((card) => card.getProductPrice()));
  }

  public async selectSortByPriceLowToHigh(): Promise<void> {
    await this.selectOptionFromDropdown(
      this.sortDropdown,
      strings.pages.products.priceLowToHighSortOptionText,
      'Sort products dropdown',
    );
  }

  public async getCheapestProductCard(): Promise<ProductCard> {
    const cardsWithPrices = await this.getProductCardsWithPrices();
    return cardsWithPrices.reduce((cheapest, current) =>
      current.price < cheapest.price ? current : cheapest,
    ).card;
  }

  public async getMostExpensiveProductCard(): Promise<ProductCard> {
    const cardsWithPrices = await this.getProductCardsWithPrices();
    return cardsWithPrices.reduce((mostExpensive, current) =>
      current.price > mostExpensive.price ? current : mostExpensive,
    ).card;
  }

  public async getProductCardByPrice(price: number): Promise<ProductCard> {
    const cardsWithPrices = await this.getProductCardsWithPrices();
    const matchingCardWithPrice = cardsWithPrices.find(
      (cardWithPrice) => cardWithPrice.price === price,
    );

    if (!matchingCardWithPrice) {
      throw new Error(`No product found with price ${price}`);
    }

    return matchingCardWithPrice.card;
  }

  private async getProductCardsWithPrices(): Promise<{ card: ProductCard; price: number }[]> {
    const cards = await this.getProductCards();
    const prices = await Promise.all(cards.map((card) => card.getProductPrice()));
    return cards.map((card, index) => ({ card, price: prices[index] }));
  }
}
