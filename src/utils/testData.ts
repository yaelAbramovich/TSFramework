export function generateUniqueEmail(prefix = 'qa-test'): string {
  return `${prefix}-${Date.now()}@example.com`;
}

export function generateUniqueTaskTitle(prefix = 'QA run task'): string {
  return `${prefix} ${Date.now()}`;
}
