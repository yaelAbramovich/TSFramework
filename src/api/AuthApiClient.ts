import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient, HttpMethod } from './BaseApiClient';

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  // Swagger documents this as required, but the live API doesn't
  // actually return it - typed optional to match reality.
  updatedAt?: string;
}

export interface RegisterResult {
  message: string;
  user: RegisteredUser;
}

export interface LoginResult {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUserResult {
  user: CurrentUser;
}

export class AuthApiClient extends BaseApiClient {
  private static readonly REGISTER_PATH = '/api/auth/register';
  private static readonly LOGIN_PATH = '/api/auth/login';
  private static readonly CURRENT_USER_PATH = '/api/auth/me';

  public constructor(requestContext: APIRequestContext) {
    super(requestContext, 'AuthApiClient');
  }

  public async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ response: APIResponse; registerResult: RegisterResult }> {
    const response = await this.sendHttpRequest(HttpMethod.POST, AuthApiClient.REGISTER_PATH, {
      jsonRequestBody: { email, password, name },
    });
    const registerResult = await this.parseResponseAsJson<RegisterResult>(response);
    return { response, registerResult };
  }

  public async login(
    email: string,
    password: string,
  ): Promise<{ response: APIResponse; loginResult: LoginResult }> {
    const response = await this.sendHttpRequest(HttpMethod.POST, AuthApiClient.LOGIN_PATH, {
      jsonRequestBody: { email, password },
    });
    const loginResult = await this.parseResponseAsJson<LoginResult>(response);
    return { response, loginResult };
  }

  public async getCurrentUser(): Promise<{
    response: APIResponse;
    currentUserResult: CurrentUserResult;
  }> {
    const response = await this.sendHttpRequest(HttpMethod.GET, AuthApiClient.CURRENT_USER_PATH);
    const currentUserResult = await this.parseResponseAsJson<CurrentUserResult>(response);
    return { response, currentUserResult };
  }
}
