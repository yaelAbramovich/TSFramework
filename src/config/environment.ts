import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export type SupportedLogLevel = 'debug' | 'info' | 'warn' | 'error';

function readEnvironmentVariableOrUndefined(variableName: string): string | undefined {
  const rawValue = process.env[variableName];
  if (rawValue === undefined || rawValue.trim() === '') return undefined;
  return rawValue.trim();
}

function readStringEnvironmentVariableOrDefault(
  variableName: string,
  defaultValue: string,
): string {
  return readEnvironmentVariableOrUndefined(variableName) ?? defaultValue;
}

function readNumericEnvironmentVariableOrDefault(
  variableName: string,
  defaultValue: number,
): number {
  const rawValue = readEnvironmentVariableOrUndefined(variableName);
  if (rawValue === undefined) return defaultValue;
  const parsedValue = Number(rawValue);
  if (Number.isNaN(parsedValue)) throw new Error(
      `Environment variable "${variableName}" must be a number but got "${rawValue}"`,
    )
  return parsedValue;
}

export interface EnvironmentConfiguration {
  applicationUrl: string;
  applicationUsername: string;
  applicationPassword: string;
  apiUrl: string;
  apiUsername: string;
  apiPassword: string;
  defaultActionTimeoutMs: number;
  defaultNavigationTimeoutMs: number;
  logLevel: SupportedLogLevel;
}

export const environmentConfiguration: EnvironmentConfiguration = {
  applicationUrl: readStringEnvironmentVariableOrDefault(
    'APPLICATION_URL',
    'https://www.saucedemo.com/',
  ),
  applicationUsername: readStringEnvironmentVariableOrDefault(
    'APPLICATION_USERNAME',
    'standard_user',
  ),
  applicationPassword: readStringEnvironmentVariableOrDefault(
    'APPLICATION_PASSWORD',
    'secret_sauce',
  ),
  apiUrl: readStringEnvironmentVariableOrDefault('API_URL', 'https://dummyjson.com/'),
  apiUsername: readStringEnvironmentVariableOrDefault('API_USERNAME', 'emilys'),
  apiPassword: readStringEnvironmentVariableOrDefault('API_PASSWORD', 'emilyspass'),
  defaultActionTimeoutMs: readNumericEnvironmentVariableOrDefault(
    'DEFAULT_ACTION_TIMEOUT_MS',
    10_000,
  ),
  defaultNavigationTimeoutMs: readNumericEnvironmentVariableOrDefault(
    'DEFAULT_NAVIGATION_TIMEOUT_MS',
    30_000,
  ),
  logLevel: readStringEnvironmentVariableOrDefault('LOG_LEVEL', 'info') as SupportedLogLevel,
};
