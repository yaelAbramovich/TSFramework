import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type SupportedLogLevel = 'debug' | 'info' | 'warn' | 'error';

function getEnv(name: string, defaultValue: string): string {
  const value = process.env[name]?.trim();
  return value || defaultValue;
}

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name]?.trim();
  if (!value) return defaultValue;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable "${name}" must be a number but got "${value}"`);
  }
  return parsed;
}

export interface EnvironmentConfiguration {
  uiBaseUrl: string;
  apiBaseUrl: string;
  uiUsername: string;
  uiPassword: string;
  defaultActionTimeoutMs: number;
  defaultNavigationTimeoutMs: number;
  logLevel: SupportedLogLevel;
}

export const environmentConfiguration: EnvironmentConfiguration = {
  uiBaseUrl: getEnv('UI_BASE_URL', 'https://the-internet.herokuapp.com'),
  apiBaseUrl: getEnv('API_BASE_URL', 'https://jsonplaceholder.typicode.com'),
  uiUsername: getEnv('UI_USERNAME', 'tomsmith'),
  uiPassword: getEnv('UI_PASSWORD', 'SuperSecretPassword!'),
  defaultActionTimeoutMs: getEnvNumber('DEFAULT_ACTION_TIMEOUT_MS', 10_000),
  defaultNavigationTimeoutMs: getEnvNumber('DEFAULT_NAVIGATION_TIMEOUT_MS', 30_000),
  logLevel: getEnv('LOG_LEVEL', 'info') as SupportedLogLevel,
};
