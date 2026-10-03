import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient, HttpMethod } from './BaseApiClient';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  // Only present when login fails - the endpoint returns this error shape
  // instead of the fields above.
  message?: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

export class AuthApiClient extends BaseApiClient {
  private static readonly LOGIN_PATH = '/auth/login';
  private static readonly CURRENT_USER_PATH = '/auth/me';

  public constructor(requestContext: APIRequestContext) {
    super(requestContext, 'AuthApiClient');
  }

  public async login(
    username: string,
    password: string,
  ): Promise<{ response: APIResponse; loginResult: LoginResult }> {
    const response = await this.sendHttpRequest(HttpMethod.POST, AuthApiClient.LOGIN_PATH, {
      jsonRequestBody: { username, password },
    });
    const loginResult = await this.parseResponseAsJson<LoginResult>(response);
    return { response, loginResult };
  }

  public async getCurrentUser(
    accessToken: string,
  ): Promise<{ response: APIResponse; currentUser: CurrentUser }> {
    const response = await this.sendHttpRequest(HttpMethod.GET, AuthApiClient.CURRENT_USER_PATH, {
      requestHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const currentUser = await this.parseResponseAsJson<CurrentUser>(response);
    return { response, currentUser };
  }
}
