import { test, expect } from '../../src/infrastructure/fixtures';

test('GET /api/tasks without authentication is rejected', async ({ tasksApiClient }) => {
  const { response, tasksListResult } = await tasksApiClient.getTasks();

  expect(response.status(), 'Expected GET /api/tasks to return status 401').toBe(401);

  expect(tasksListResult.error, 'Expected an Unauthorized error message').toBe('Unauthorized');
});
