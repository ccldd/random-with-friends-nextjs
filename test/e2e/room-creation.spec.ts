import { expect, test } from '@playwright/test';
import { createRoom, getParticipants, isValidRoomId } from './utils/room-helpers';

test.describe('Room Creation', () => {
  test('should create a room and display room ID', async ({ page }) => {
    const hostName = 'Alice';
    
    // Create a room
    const { roomId, hostName: createdHostName } = await createRoom(page, hostName);
    
    // Verify room ID format
    expect(isValidRoomId(roomId)).toBe(true);
    expect(roomId).toHaveLength(4);
    expect(createdHostName).toBe(hostName);
    
    // Verify we're on the room page (may have query params for displayName and role)
    await expect(page).toHaveURL(new RegExp(`/room/${roomId}(\\?.*)?$`));
    
    // Verify room ID is displayed on the page
    await expect(page.locator('text=' + roomId)).toBeVisible();
  });

  test('should show creator as host in participant list', async ({ page }) => {
    const hostName = 'Bob';
    
    // Create a room
    await createRoom(page, hostName);
    
    // Wait for participant list to load
    await page.waitForSelector('[data-testid="participant-list"]');
    
    // Get participants
    const participants = await getParticipants(page);
    
    // Verify host is in the list
    expect(participants).toHaveLength(1);
    expect(participants[0].name).toBe(hostName);
    expect(participants[0].isHost).toBe(true);
  });

  test('should display host indicator badge', async ({ page }) => {
    const hostName = 'Charlie';
    
    // Create a room
    await createRoom(page, hostName);
    
    // Wait for participant list
    await page.waitForSelector('[data-testid="participant-list"]');
    
    // Verify host badge is visible
    await expect(page.locator('[data-testid="host-badge"]')).toBeVisible();
    
    // Verify badge says "Host" or similar
    const badgeText = await page.locator('[data-testid="host-badge"]').textContent();
    expect(badgeText?.toLowerCase()).toContain('host');
  });

  test('should reject empty display name', async ({ page }) => {
    await page.goto('/');
    
    // Try to create room with empty name
    await page.fill('input[name="displayName"]', '');
    await page.click('button:has-text("Create Room")');
    
    // Should show validation error
    await expect(page.locator('text=/display name.*required/i')).toBeVisible();
    
    // Should NOT navigate away from home page
    await expect(page).toHaveURL('/');
  });

  test('should create rooms with unique IDs', async ({ page, context }) => {
    const hostName1 = 'User1';
    const hostName2 = 'User2';
    
    // Create first room
    const room1 = await createRoom(page, hostName1);
    
    // Open new page in same context
    const page2 = await context.newPage();
    
    // Create second room
    const room2 = await createRoom(page2, hostName2);
    
    // Verify room IDs are different
    expect(room1.roomId).not.toBe(room2.roomId);
    
    // Both should be valid format
    expect(isValidRoomId(room1.roomId)).toBe(true);
    expect(isValidRoomId(room2.roomId)).toBe(true);
    
    await page2.close();
  });

  test('should show connection status indicator', async ({ page }) => {
    const hostName = 'David';
    
    // Create a room
    await createRoom(page, hostName);
    
    // Connection status should be present
    const statusElement = page.locator('[data-testid="connection-status"]');
    await expect(statusElement).toBeVisible();
    
    // Should show connected state
    await expect(statusElement).toHaveAttribute('data-status', 'connected');
  });

  test('should allow long display names up to limit', async ({ page }) => {
    // 64 characters is the limit
    const longName = 'A'.repeat(64);
    
    await page.goto('/');
    await page.fill('input[name="displayName"]', longName);
    await page.click('button:has-text("Create Room")');
    
    // Should succeed and navigate to room
    await page.waitForURL(/\/room\/[A-Z0-9]+/);
    
    // Verify name is displayed (may be truncated in UI but should be set)
    const participants = await getParticipants(page);
    expect(participants[0].name).toBe(longName);
  });

  test('should reject display names exceeding limit', async ({ page }) => {
    // 65 characters exceeds the limit
    const tooLongName = 'A'.repeat(65);
    
    await page.goto('/');
    await page.fill('input[name="displayName"]', tooLongName);
    await page.click('button:has-text("Create Room")');
    
    // Should show validation error
    await expect(page.locator('text=/too long/i')).toBeVisible();
    
    // Should NOT navigate away
    await expect(page).toHaveURL('/');
  });

  test('should show room creation form on home page', async ({ page }) => {
    await page.goto('/');
    
    // Verify form elements are present
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Room")')).toBeVisible();
  });
});
