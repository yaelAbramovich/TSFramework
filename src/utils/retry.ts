import { Logger } from '../infrastructure/Logger';

const logger = new Logger('retry');

const DEFAULT_TIMEOUT_MS = 30_000;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Calls `operation` until `successCondition` accepts its result, then returns that result.
 * Throws if `maxAttempts` is exhausted or `timeoutMs` elapses before a result is accepted.
 * Errors thrown by `operation` itself are not retried — they propagate immediately.
 */
export async function retry<T>(
  operation: () => T | Promise<T>,
  successCondition: (result: T) => boolean,
  maxAttempts: number,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  delayBetweenAttemptsMs: number = 0,
): Promise<T> {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error(`retry: maxAttempts must be an integer >= 1, got ${maxAttempts}`);
  }

  const deadline = Date.now() + timeoutMs;
  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error(`retry: timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  const runAttempts = async (): Promise<T> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await operation();
      if (successCondition(result)) {
        logger.debug(`Success condition met on attempt ${attempt}/${maxAttempts}`);
        return result;
      }
      logger.debug(`Attempt ${attempt}/${maxAttempts} did not meet success condition`);
      if (attempt < maxAttempts && delayBetweenAttemptsMs > 0) {
        await sleep(Math.min(delayBetweenAttemptsMs, Math.max(0, deadline - Date.now())));
      }
    }
    throw new Error(`retry: success condition not met after ${maxAttempts} attempts`);
  };

  try {
    // Racing the timeout also bounds a single operation call that hangs.
    return await Promise.race([runAttempts(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}
