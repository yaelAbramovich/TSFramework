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
}

export class AuthApiClient extends BaseApiClient {
  private static readonly LOGIN_PATH = '/auth/login';

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
}
