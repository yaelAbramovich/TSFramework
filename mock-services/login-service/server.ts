import { randomBytes } from 'crypto';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import {
  forceServerErrorHeaderName,
  forceServerErrorHeaderValue,
  LoginMethod,
  LoginResponse,
  loginMethods,
  seededAccounts,
} from '../../src/testData/loginService';

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const SEEDED_LAST_LOGIN_AT = '2024-01-01T00:00:00.000Z';

function assertIdentifiersAreUnique(): void {
  const seenIdentifiers = new Set<string>();
  for (const account of seededAccounts) {
    const { loginMethod, credentials } = account;
    const identifierKey = `${loginMethod.name}:${credentials[loginMethod.identifierField]}`;
    if (seenIdentifiers.has(identifierKey)) {
      throw new Error(`Duplicate ${loginMethod.identifierField} in seeded accounts: ${identifierKey}`);
    }
    seenIdentifiers.add(identifierKey);
  }
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown> | undefined> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => {
      try {
        const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed !== null && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : undefined);
      } catch {
        resolve(undefined);
      }
    });
  });
}

async function handleLogin(
  loginMethod: LoginMethod,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  if (request.headers[forceServerErrorHeaderName] === forceServerErrorHeaderValue) {
    sendJson(response, 500, {
      error: 'internal_server_error',
      message: 'Server error forced by the test',
    });
    return;
  }

  const body = await readJsonBody(request);
  const identifier = body?.[loginMethod.identifierField];
  const secret = body?.[loginMethod.secretField];

  if (typeof identifier !== 'string' || typeof secret !== 'string' || !identifier || !secret) {
    sendJson(response, 400, {
      error: 'bad_request',
      message: `"${loginMethod.identifierField}" and "${loginMethod.secretField}" are required`,
    });
    return;
  }

  const matchingAccount = seededAccounts.find(
    (account) =>
      account.loginMethod === loginMethod &&
      account.credentials[loginMethod.identifierField] === identifier &&
      account.credentials[loginMethod.secretField] === secret,
  );

  if (!matchingAccount) {
    sendJson(response, 401, { error: 'invalid_credentials', message: 'Invalid credentials' });
    return;
  }

  const loginResponse: LoginResponse = {
    token: randomBytes(24).toString('hex'),
    expires: new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString(),
    lastLoginAt: SEEDED_LAST_LOGIN_AT,
    userConfigs: matchingAccount.userConfigs,
  };
  sendJson(response, 200, loginResponse);
}

export function startLoginService(port: number): Promise<Server> {
  assertIdentifiersAreUnique();

  const server = createServer((request, response) => {
    const loginMethod = loginMethods.find((method) => method.path === request.url);
    if (!loginMethod || request.method !== 'POST') {
      sendJson(response, 404, { error: 'not_found', message: 'Unknown endpoint' });
      return;
    }
    void handleLogin(loginMethod, request, response);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve(server));
  });
}
