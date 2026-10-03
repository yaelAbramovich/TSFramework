import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TaskPriority } from '../api/TasksApiClient';
import strings from '../utils/strings.json';

export class DashboardPage extends BasePage {
  // "My Tasks" is real on-screen heading text, so its value comes from
  // strings.json; the .describe() text alongside it is automation-internal
  // and stays an inline literal.
  private readonly taskBoardHeading = this.page
    .getByRole('heading', { level: 1, name: strings.pages.dashboard.heading })
    .describe('Dashboard - task board heading');

  public constructor(page: Page) {
    super(page, 'DashboardPage');
  }

  // A task card's generated ID has no accessible role or label of its own,
  // so getByTestId is the only non-circular way to pinpoint "this exact
  // task" - the justified last-resort case convention 3 carves out. Once
  // anchored on the card by ID, its sub-content is read via role/text
  // instead of further testids wherever that's possible without
  // presupposing the value being asserted.
  private getTaskCardLocator(taskId: string): Locator {
    return this.page.getByTestId(`task-card-${taskId}`);
  }

  private getTaskCardInColumnLocator(taskId: string, columnTestId: string): Locator {
    return this.page.getByTestId(columnTestId).getByTestId(`task-card-${taskId}`);
  }

  private getTaskTitleLocator(taskId: string): Locator {
    return this.getTaskCardLocator(taskId)
      .getByRole('heading')
      .describe(`Title of task card ${taskId}`);
  }

  private getTaskPriorityLocator(taskId: string): Locator {
    // The priority badge is a plain <div> with no role/label distinguishing
    // it from the rest of the card, and its own text content is the value
    // under test - locating it by that same text would make the assertion
    // circular. getByTestId is the only locator left that isn't circular.
    return this.getTaskCardLocator(taskId)
      .getByTestId(`task-priority-${taskId}`)
      .describe(`Priority badge of task card ${taskId}`);
  }

  private getTaskDragHandleLocator(taskId: string): Locator {
    // Same reasoning as getTaskCardLocator: the drag handle has no
    // accessible role tied to this specific task's generated ID.
    return this.page
      .getByTestId(`task-drag-handle-${taskId}`)
      .describe(`Drag handle of task card ${taskId}`);
  }

  private getColumnLocator(columnTestId: string): Locator {
    return this.page.getByTestId(columnTestId);
  }

  public async assertTaskBoardIsVisible(): Promise<void> {
    await this.assertElementIsVisible(this.taskBoardHeading, 'Dashboard - task board heading');
  }

  public async assertTaskIsVisibleInBacklogColumn(taskId: string): Promise<void> {
    const description = `Task card ${taskId} in the Backlog column`;
    await this.assertElementIsVisible(
      this.getTaskCardInColumnLocator(taskId, 'column-backlog').describe(description),
      description,
    );
  }

  public async assertTaskIsVisibleInInProgressColumn(taskId: string): Promise<void> {
    const description = `Task card ${taskId} in the In Progress column`;
    await this.assertElementIsVisible(
      this.getTaskCardInColumnLocator(taskId, 'column-in_progress').describe(description),
      description,
    );
  }

  public async assertTaskIsVisibleInDoneColumn(taskId: string): Promise<void> {
    const description = `Task card ${taskId} in the Done column`;
    await this.assertElementIsVisible(
      this.getTaskCardInColumnLocator(taskId, 'column-done').describe(description),
      description,
    );
  }

  public async assertTaskTitleEquals(taskId: string, expectedTitle: string): Promise<void> {
    await this.assertElementHasExactText(
      this.getTaskTitleLocator(taskId),
      expectedTitle,
      `Title of task card ${taskId}`,
    );
  }

  public async assertTaskPriority(taskId: string, expectedPriority: TaskPriority): Promise<void> {
    await this.assertElementHasExactText(
      this.getTaskPriorityLocator(taskId),
      expectedPriority,
      `Priority badge of task card ${taskId}`,
    );
  }

  public async dragTaskToInProgressColumn(taskId: string): Promise<void> {
    await this.dragElementToElement(
      this.getTaskDragHandleLocator(taskId),
      this.getColumnLocator('column-in_progress').describe('In Progress column'),
      `Task card ${taskId} dragged to the In Progress column`,
    );
  }
}
