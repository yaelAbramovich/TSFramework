import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient, HttpMethod } from './BaseApiClient';

export type TaskStatus = 'backlog' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TasksListResult {
  tasks: Task[];
  meta: { count: number; maxAllowed: number; remaining: number };
  // Only present when the request is rejected (e.g. unauthenticated) -
  // the endpoint returns this error shape instead of the fields above.
  error?: string;
}

export class TasksApiClient extends BaseApiClient {
  private static readonly TASKS_PATH = '/api/tasks';

  public constructor(requestContext: APIRequestContext) {
    super(requestContext, 'TasksApiClient');
  }

  public async getTasks(): Promise<{ response: APIResponse; tasksListResult: TasksListResult }> {
    const response = await this.sendHttpRequest(HttpMethod.GET, TasksApiClient.TASKS_PATH);
    const tasksListResult = await this.parseResponseAsJson<TasksListResult>(response);
    return { response, tasksListResult };
  }
}
