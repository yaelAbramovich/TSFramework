import { APIResponse, expect } from '@playwright/test';

export function assertResponseIsSuccessful(response: APIResponse): void {
  expect(
    response.ok(),
    `Expected a successful HTTP response, but got status ${response.status()}`,
  ).toBeTruthy();
}

export function assertFieldEquals<TFieldValue>(
  actualValue: TFieldValue,
  expectedValue: TFieldValue,
  fieldDescription: string,
): void {
  expect(actualValue, fieldDescription).toBe(expectedValue);
}

export function assertFieldIsPresent(actualValue: unknown, fieldDescription: string): void {
  expect(actualValue, fieldDescription).toBeTruthy();
}

export function assertArrayIsNotEmpty<TItem>(actualArray: TItem[], arrayDescription: string): void {
  expect(actualArray.length, arrayDescription).toBeGreaterThan(0);
}

export function assertArrayLengthEquals<TItem>(
  actualArray: TItem[],
  expectedLength: number,
  arrayDescription: string,
): void {
  expect(actualArray.length, arrayDescription).toBe(expectedLength);
}

export function assertEveryArrayItemEqualsFields<TItem>(
  actualArray: TItem[],
  expectedFields: Partial<TItem>,
  arrayDescription: string,
): void {
  actualArray.forEach((actualItem, itemIndex) => {
    (Object.keys(expectedFields) as (keyof TItem)[]).forEach((fieldKey) => {
      expect(actualItem[fieldKey], `${arrayDescription}[${itemIndex}].${String(fieldKey)}`).toBe(
        expectedFields[fieldKey],
      );
    });
  });
}

export function assertResponseHasStatus(
  response: APIResponse,
  expectedStatus: number,
  responseDescription: string,
): void {
  expect(response.status(), responseDescription).toBe(expectedStatus);
}
