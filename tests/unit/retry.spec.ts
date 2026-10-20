import { test, expect } from '@playwright/test';
import { retry } from '../../src/utils/retry';

test.describe('retry', () => {
  test('returns the first result that meets the success condition', async () => {
    const results = [10, 50, 90, 95];
    const result = await retry(() => results.shift() as number, (n) => n > 80, 10);
    expect(result, 'Expected the first value above 80').toBe(90);
    expect(results, 'Expected retry to stop calling the operation after success').toEqual([95]);
  });

  test('works with getRandomNumber', async () => {
    const getRandomNumber = (): number => Math.floor(Math.random() * 100) + 1;
    const result = await retry(getRandomNumber, (n) => n > 80, 1000);
    expect(result, 'Expected a number above 80').toBeGreaterThan(80);
  });

  test('throws when max attempts are exhausted', async () => {
    await expect(retry(() => 1, (n) => n > 80, 3)).rejects.toThrow('after 3 attempts');
  });

  test('throws when the timeout elapses', async () => {
    await expect(
      retry(() => new Promise<number>(() => {}), () => true, 3, 200),
    ).rejects.toThrow('timed out after 200ms');
  });

  test('rejects an invalid maxAttempts', async () => {
    await expect(retry(() => 1, () => true, 0)).rejects.toThrow('maxAttempts');
  });
});
