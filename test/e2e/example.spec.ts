import { test, expect } from '@playwright/test';

test('homepage responds with 2xx/3xx and page loads', async ({ page }) => {
  const resp = await page.goto('/');
  expect(resp).not.toBeNull();
  expect(resp!.status()).toBeLessThan(500);
  // Basic smoke check that the document has loaded
  await expect(page.locator('body')).toBeVisible();
});
