import { test, expect } from '../../src/infrastructure/fixtures';
import { generateUniqueTaskTitle } from '../../src/utils/testData';

test('GET /api/tasks without authentication is rejected', async ({ tasksApiClient }) => {
  const { response, tasksListResult } = await tasksApiClient.getTasks();

  expect(response.status(), 'Expected GET /api/tasks to return status 401').toBe(401);

  expect(tasksListResult.error, 'Expected an Unauthorized error message').toBe('Unauthorized');
});

test('POST /api/tasks creates a new task', async ({ authenticatedTasksApiClient }) => {
  const title = generateUniqueTaskTitle();

  const { response, createTaskResult } = await authenticatedTasksApiClient.createTask({
    title,
    status: 'backlog',
    priority: 'medium',
  });

  expect(response.status(), 'Expected POST /api/tasks to return status 201').toBe(201);

  const taskId = createTaskResult.id;
  expect(taskId, 'Expected a task id to be returned').toBeTruthy();
  expect(createTaskResult.title, 'Expected the created task title to match').toBe(title);
  expect(createTaskResult.status, 'Expected the created task status to match').toBe('backlog');
  expect(createTaskResult.priority, 'Expected the created task priority to match').toBe('medium');

  expect(
    createTaskResult.position,
    'Expected the task position to be greater than 0',
  ).toBeGreaterThan(0);

  // Compared in UTC (matching the "Z"-suffixed timestamps the API returns),
  // so this isn't sensitive to the local machine's timezone.
  const todayUtcDate = new Date().toISOString().slice(0, 10);

  expect(createTaskResult.createdAt, 'Expected createdAt to be present').toBeTruthy();
  expect(
    createTaskResult.createdAt.startsWith(todayUtcDate),
    "Expected createdAt to include today's date",
  ).toBe(true);

  expect(createTaskResult.updatedAt, 'Expected updatedAt to be present').toBeTruthy();
  expect(
    createTaskResult.updatedAt.startsWith(todayUtcDate),
    "Expected updatedAt to include today's date",
  ).toBe(true);
});
