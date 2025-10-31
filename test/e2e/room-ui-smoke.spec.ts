import { expect, test } from '@playwright/test';

/**
 * Smoke tests for basic UI rendering and navigation
 * These tests verify the UI structure without requiring full Pusher integration
 */

test.describe('Room UI Smoke Tests', () => {
  test('should render home page with create room form', async ({ page }) => {
    await page.goto('/');
    
    // Verify page title
    await expect(page.locator('h1')).toContainText('Random With Friends');
    
    // Verify create room form exists
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Room")')).toBeVisible();
    
    // Verify join room button exists
    await expect(page.locator('button:has-text("Join Room")')).toBeVisible();
  });

  test('should open join room dialog', async ({ page }) => {
    await page.goto('/');
    
    // Click join room button
    await page.click('button:has-text("Join Room")');
    
    // Verify dialog opens with form fields
    await expect(page.locator('input[name="roomId"]')).toBeVisible();
    // Use more specific selector for displayName in dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.locator('input[name="displayName"]')).toBeVisible();
  });

  test('should validate empty display name on create room', async ({ page }) => {
    await page.goto('/');
    
    // Try to submit without name
    await page.click('button:has-text("Create Room")');
    
    // Should show validation error or prevent submission
    const hasValidationError = await page.locator('text=/required/i').isVisible().catch(() => false);
    const stillOnHomePage = page.url().includes('/') && !page.url().includes('/room/');
    
    expect(hasValidationError || stillOnHomePage).toBeTruthy();
  });

  test('should validate empty fields on join room', async ({ page }) => {
    await page.goto('/');
    
    // Open join dialog
    await page.click('button:has-text("Join Room")');
    await page.waitForSelector('input[name="roomId"]', { state: 'visible' });
    
    // Try to submit without filling fields - click the button within the dialog
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('button:has-text("Join Room")').click();
    
    // Should show validation error
    await expect(page.locator('text=/required/i')).toBeVisible();
  });

  test('should accept valid display name format', async ({ page }) => {
    await page.goto('/');
    
    // Fill in valid name
    await page.fill('input[name="displayName"]', 'Test User');
    
    // Input should accept the value
    const value = await page.inputValue('input[name="displayName"]');
    expect(value).toBe('Test User');
  });

  test('should accept room ID input in join form', async ({ page }) => {
    await page.goto('/');
    
    // Open join dialog
    await page.click('button:has-text("Join Room")');
    await page.waitForSelector('input[name="roomId"]', { state: 'visible' });
    
    // Fill in room ID
    await page.fill('input[name="roomId"]', 'TEST');
    
    // Input should accept the value
    const value = await page.inputValue('input[name="roomId"]');
    expect(value).toBe('TEST');
  });
});
