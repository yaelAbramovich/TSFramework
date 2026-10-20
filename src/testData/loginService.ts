/**
 * Single source of truth for the dummy login service: which login methods it
 * supports and which accounts are seeded. The mock server and the tests both
 * import this file, so they cannot drift apart.
 *
 * To add a login method: add one entry to `loginMethods` and at least one
 * account for it to `seededAccounts`. The server and the login test pick it up
 * automatically.
 */
/**
 * Sending this header with the value below makes the mock service answer 500
 * on any login endpoint. It is the only way the service ever returns a 500,
 * so server errors in tests are always deliberate, never random.
 */
export const forceServerErrorHeaderName = 'x-mock-force-server-error';
export const forceServerErrorHeaderValue = 'true';

export interface LoginMethod {
  readonly name: string;
  readonly path: string;
  /** Request body field that identifies the account. Must be unique per method. */
  readonly identifierField: string;
  /** Request body field that proves ownership of the account. */
  readonly secretField: string;
}

export interface UserConfig {
  key: string;
  value: string;
}

export interface SeededAccount {
  readonly loginMethod: LoginMethod;
  /** Exact JSON request body that logs this account in. */
  readonly credentials: Record<string, string>;
  readonly userConfigs: UserConfig[];
}

export interface LoginResponse {
  token: string;
  expires: string;
  lastLoginAt: string;
  userConfigs: UserConfig[];
}

export interface LoginErrorResponse {
  error: string;
  message: string;
}

export const passwordLoginMethod: LoginMethod = {
  name: 'password',
  path: '/login/password',
  identifierField: 'email',
  secretField: 'password',
};

export const mfaLoginMethod: LoginMethod = {
  name: 'mfa',
  path: '/login/mfa',
  identifierField: 'phoneNumber',
  secretField: 'code',
};

export const apiClientLoginMethod: LoginMethod = {
  name: 'api client',
  path: '/login/api-client',
  identifierField: 'clientId',
  secretField: 'clientSecret',
};

export const loginMethods: readonly LoginMethod[] = [
  passwordLoginMethod,
  mfaLoginMethod,
  apiClientLoginMethod,
];

export const seededAccounts: readonly SeededAccount[] = [
  {
    loginMethod: passwordLoginMethod,
    credentials: { email: 'alice@example.com', password: 'Passw0rd!' },
    userConfigs: [
      { key: 'theme', value: 'dark' },
      { key: 'language', value: 'en' },
    ],
  },
  {
    loginMethod: mfaLoginMethod,
    credentials: { phoneNumber: '+15550100', code: '123456' },
    userConfigs: [{ key: 'notifications', value: 'sms' }],
  },
  {
    loginMethod: apiClientLoginMethod,
    credentials: { clientId: 'ai-client-1', clientSecret: 's3cr3t-value' },
    userConfigs: [
      { key: 'rateLimit', value: '100' },
      { key: 'scope', value: 'read' },
    ],
  },
];
