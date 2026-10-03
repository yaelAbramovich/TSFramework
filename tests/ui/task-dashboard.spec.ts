import { test, expect } from '../../src/infrastructure/fixtures';
import { generateUniqueTaskTitle } from '../../src/utils/testData';

test('Task created via API flows through UI status change and persists via API', async ({
  authenticatedApiContext,
  authenticatedTasksApiClient,
  taskCleanup,
  loginPage,
  dashboardPage,
}) => {
  const title = generateUniqueTaskTitle();

  const { response: createTaskResponse, createTaskResult } =
    await authenticatedTasksApiClient.createTask({
      title,
      status: 'backlog',
      priority: 'medium',
    });

  expect(createTaskResponse.status(), 'Expected POST /api/tasks to return status 201').toBe(201);

  const taskId = createTaskResult.id;
  taskCleanup.registerTaskForCleanup(taskId);

  await loginPage.navigateToLoginPage();
  await loginPage.submitLoginFormWithCredentials(
    authenticatedApiContext.credentials.email,
    authenticatedApiContext.credentials.password,
  );

  await dashboardPage.assertTaskBoardIsVisible();
  await dashboardPage.assertTaskIsVisibleInBacklogColumn(taskId);
  await dashboardPage.assertTaskTitleEquals(taskId, title);
  await dashboardPage.assertTaskPriority(taskId, 'medium');

  await dashboardPage.dragTaskToInProgressColumn(taskId);
  await dashboardPage.assertTaskIsVisibleInInProgressColumn(taskId);

  const { response, getTaskByIdResult } = await authenticatedTasksApiClient.getTaskById(taskId);

  expect(response.status(), 'Expected GET /api/tasks/:id to return status 200').toBe(200);
  expect(
    getTaskByIdResult.status,
    'Expected the persisted task status to be in_progress after the UI drag',
  ).toBe('in_progress');
});
