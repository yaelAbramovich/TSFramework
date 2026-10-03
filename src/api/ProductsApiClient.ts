import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient, HttpMethod } from './BaseApiClient';

export interface Product {
  id: number;
  title: string;
  price: number;
  // Only present when the product id doesn't exist - the endpoint
  // returns this error shape instead of the fields above.
  message?: string;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
  // Only present when a pagination parameter is invalid - the endpoint
  // returns this error shape instead of the fields above.
  message?: string;
}

export class ProductsApiClient extends BaseApiClient {
  private static readonly SEARCH_PATH = '/products/search';
  private static readonly PRODUCTS_PATH = '/products';

  public constructor(requestContext: APIRequestContext) {
    super(requestContext, 'ProductsApiClient');
  }

  public async searchProducts(
    query: string,
  ): Promise<{ response: APIResponse; searchResult: ProductSearchResult }> {
    const response = await this.sendHttpRequest(HttpMethod.GET, ProductsApiClient.SEARCH_PATH, {
      queryParameters: { q: query },
    });
    const searchResult = await this.parseResponseAsJson<ProductSearchResult>(response);
    return { response, searchResult };
  }

  public async getProducts(
    limit: number,
    skip: number,
  ): Promise<{ response: APIResponse; paginationResult: ProductSearchResult }> {
    const response = await this.sendHttpRequest(HttpMethod.GET, ProductsApiClient.PRODUCTS_PATH, {
      queryParameters: { limit, skip },
    });
    const paginationResult = await this.parseResponseAsJson<ProductSearchResult>(response);
    return { response, paginationResult };
  }

  public async getProductById(
    productId: number,
  ): Promise<{ response: APIResponse; product: Product }> {
    const response = await this.sendHttpRequest(
      HttpMethod.GET,
      ProductsApiClient.singleProductPath(productId),
    );
    const product = await this.parseResponseAsJson<Product>(response);
    return { response, product };
  }

  private static singleProductPath(productId: number): string {
    return `${ProductsApiClient.PRODUCTS_PATH}/${productId}`;
  }
}
