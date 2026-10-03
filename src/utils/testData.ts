export function generateUniqueEmail(prefix = 'qa-test'): string {
  return `${prefix}-${Date.now()}@example.com`;
}
