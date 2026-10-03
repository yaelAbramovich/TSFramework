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
  baseUrl: string;
  apiBaseUrl: string;
  defaultActionTimeoutMs: number;
  defaultNavigationTimeoutMs: number;
  logLevel: SupportedLogLevel;
}

export const environmentConfiguration: EnvironmentConfiguration = {
  baseUrl: getEnv('BASE_URL', 'https://dojo.upexgalaxy.com'),
  apiBaseUrl: getEnv('API_BASE_URL', 'https://dojo.upexgalaxy.com'),
  defaultActionTimeoutMs: getEnvNumber('DEFAULT_ACTION_TIMEOUT_MS', 10_000),
  defaultNavigationTimeoutMs: getEnvNumber('DEFAULT_NAVIGATION_TIMEOUT_MS', 30_000),
  logLevel: getEnv('LOG_LEVEL', 'info') as SupportedLogLevel,
};
