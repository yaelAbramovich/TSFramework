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

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface CreateTaskResult extends Task {
  // Only present when the request is rejected (e.g. validation error) -
  // the endpoint returns this error shape instead of the task fields.
  error?: string;
}

export interface GetTaskByIdResult extends Task {
  // Only present when the request is rejected (e.g. unauthenticated, or the
  // task doesn't exist) - the endpoint returns this error shape instead of
  // the task fields.
  error?: string;
}

export interface DeleteTaskResult {
  // Present on success.
  message?: string;
  // Present when the request is rejected (e.g. unauthenticated, or the task
  // doesn't exist).
  error?: string;
}

export class TasksApiClient extends BaseApiClient {
  private static readonly TASKS_PATH = '/api/tasks';

  private static singleTaskPath(id: string): string {
    return `${TasksApiClient.TASKS_PATH}/${id}`;
  }

  public constructor(requestContext: APIRequestContext) {
    super(requestContext, 'TasksApiClient');
  }

  public async getTasks(): Promise<{ response: APIResponse; tasksListResult: TasksListResult }> {
    const response = await this.sendHttpRequest(HttpMethod.GET, TasksApiClient.TASKS_PATH);
    const tasksListResult = await this.parseResponseAsJson<TasksListResult>(response);
    return { response, tasksListResult };
  }

  public async getTaskById(
    id: string,
  ): Promise<{ response: APIResponse; getTaskByIdResult: GetTaskByIdResult }> {
    const response = await this.sendHttpRequest(
      HttpMethod.GET,
      TasksApiClient.singleTaskPath(id),
    );
    const getTaskByIdResult = await this.parseResponseAsJson<GetTaskByIdResult>(response);
    return { response, getTaskByIdResult };
  }

  public async createTask(
    taskData: CreateTaskRequest,
  ): Promise<{ response: APIResponse; createTaskResult: CreateTaskResult }> {
    const response = await this.sendHttpRequest(HttpMethod.POST, TasksApiClient.TASKS_PATH, {
      jsonRequestBody: taskData,
    });
    const createTaskResult = await this.parseResponseAsJson<CreateTaskResult>(response);
    return { response, createTaskResult };
  }

  public async deleteTask(
    id: string,
  ): Promise<{ response: APIResponse; deleteTaskResult: DeleteTaskResult }> {
    const response = await this.sendHttpRequest(
      HttpMethod.DELETE,
      TasksApiClient.singleTaskPath(id),
    );
    const deleteTaskResult = await this.parseResponseAsJson<DeleteTaskResult>(response);
    return { response, deleteTaskResult };
  }
}
