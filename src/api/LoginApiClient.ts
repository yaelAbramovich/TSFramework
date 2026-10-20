import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  forceServerErrorHeaderName,
  forceServerErrorHeaderValue,
  LoginErrorResponse,
  LoginMethod,
  LoginResponse,
} from '../testData/loginService';
import { BaseApiClient, HttpMethod } from './BaseApiClient';

export class LoginApiClient extends BaseApiClient {
  constructor(requestContext: APIRequestContext) {
    super(requestContext, 'LoginApiClient');
  }

  /** Each login method's endpoint path lives on its `LoginMethod` entry, shared with the mock service. */
  public async postLogin(
    loginMethod: LoginMethod,
    credentials: Record<string, string>,
  ): Promise<APIResponse> {
    return this.sendHttpRequest(HttpMethod.POST, loginMethod.path, {
      jsonRequestBody: credentials,
    });
  }

  public async postLoginForcingServerError(
    loginMethod: LoginMethod,
    credentials: Record<string, string>,
  ): Promise<APIResponse> {
    return this.sendHttpRequest(HttpMethod.POST, loginMethod.path, {
      jsonRequestBody: credentials,
      requestHeaders: { [forceServerErrorHeaderName]: forceServerErrorHeaderValue },
    });
  }

  public async parseLoginErrorResponse(apiResponse: APIResponse): Promise<LoginErrorResponse> {
    return this.parseResponseAsJson<LoginErrorResponse>(apiResponse);
  }

  public async parseLoginResponse(apiResponse: APIResponse): Promise<LoginResponse> {
    return this.parseResponseAsJson<LoginResponse>(apiResponse);
  }
}
