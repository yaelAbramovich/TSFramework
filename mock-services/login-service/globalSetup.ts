import { environmentConfiguration } from '../../src/config/environment';
import { startLoginService } from './server';

/** Starts the dummy login service before the test run and stops it afterwards. */
export default async function globalSetup(): Promise<() => Promise<void>> {
  const port = Number(new URL(environmentConfiguration.loginServiceBaseUrl).port);
  const server = await startLoginService(port);
  return () =>
    new Promise<void>((resolve, reject) => {
      server.close((closeError) => (closeError ? reject(closeError) : resolve()));
    });
}
