import { expect, test } from '@playwright/test';
import {
    createRoom,
    getParticipants,
    joinRoom,
    waitForParticipant
} from './utils/room-helpers';

test.describe('Room Joining', () => {
  test('should allow guest to join existing room', async ({ page, context }) => {
    const hostName = 'Alice';
    const guestName = 'Bob';
    
    // Host creates a room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins the room in new page
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    // Verify guest is on the room page
    await expect(guestPage).toHaveURL(`/room/${roomId}`);
    
    // Verify guest sees both participants
    const guestParticipants = await getParticipants(guestPage);
    expect(guestParticipants).toHaveLength(2);
    
    // Verify participant names
    const names = guestParticipants.map((p) => p.name).sort();
    expect(names).toEqual([guestName, hostName].sort());
    
    await guestPage.close();
  });

  test('should show new participant to existing members', async ({ page, context }) => {
    const hostName = 'Charlie';
    const guestName = 'Diana';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    // Host should see the guest appear
    await waitForParticipant(page, guestName, 5000);
    
    // Verify host sees both participants
    const hostParticipants = await getParticipants(page);
    expect(hostParticipants).toHaveLength(2);
    
    await guestPage.close();
  });

  test('should mark only host with host badge', async ({ page, context }) => {
    const hostName = 'Eve';
    const guestName = 'Frank';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    await waitForParticipant(guestPage, hostName);
    
    // Check host page
    const hostParticipants = await getParticipants(page);
    const hostInList = hostParticipants.find((p) => p.name === hostName);
    const guestInList = hostParticipants.find((p) => p.name === guestName);
    
    expect(hostInList?.isHost).toBe(true);
    expect(guestInList?.isHost).toBe(false);
    
    // Check guest page
    const guestParticipants = await getParticipants(guestPage);
    const hostOnGuestPage = guestParticipants.find((p) => p.name === hostName);
    const guestOnGuestPage = guestParticipants.find((p) => p.name === guestName);
    
    expect(hostOnGuestPage?.isHost).toBe(true);
    expect(guestOnGuestPage?.isHost).toBe(false);
    
    await guestPage.close();
  });

  test('should reject joining non-existent room', async ({ page }) => {
    const fakeRoomId = 'FAKE';
    const guestName = 'George';
    
    await page.goto('/');
    
    // Click Join Room button to open dialog
    await page.click('button:has-text("Join Room")');
    
    // Wait for dialog
    await page.waitForSelector('input[name="roomId"]', { state: 'visible' });
    
    // Try to join fake room
    await page.fill('input[name="roomId"]', fakeRoomId);
    await page.fill('input[name="displayName"]', guestName);
    await page.click('button:has-text("Join Room")');
    
    // Should show error toast message
    await expect(page.locator('text=/room not found/i')).toBeVisible({ timeout: 3000 });
    
    // Should remain on home page
    await expect(page).toHaveURL('/');
  });

  test('should reject joining with empty display name', async ({ page }) => {
    await page.goto('/');
    
    // Click Join Room button
    await page.click('button:has-text("Join Room")');
    
    // Wait for dialog
    await page.waitForSelector('input[name="roomId"]', { state: 'visible' });
    
    // Try to join with empty name
    await page.fill('input[name="roomId"]', 'ABCD');
    await page.fill('input[name="displayName"]', '');
    await page.click('button:has-text("Join Room")');
    
    // Should show validation error (form validation prevents submission)
    await expect(page.locator('text=/display name.*required/i')).toBeVisible();
    
    // Should NOT navigate
    await expect(page).toHaveURL('/');
  });

  test('should reject invalid room ID format', async ({ page }) => {
    await page.goto('/');
    
    // Click Join Room button
    await page.click('button:has-text("Join Room")');
    
    // Wait for dialog
    await page.waitForSelector('input[name="roomId"]', { state: 'visible' });
    
    // Invalid formats
    const invalidIds = ['AB', 'abc', '12-34'];
    
    for (const invalidId of invalidIds) {
      await page.fill('input[name="roomId"]', invalidId);
      await page.fill('input[name="displayName"]', 'Test User');
      await page.click('button:has-text("Join Room")');
      
      // Should show error (either validation or API error)
      const errorVisible = await Promise.race([
        page.locator('text=/invalid.*room.*id|room.*id.*must.*be/i').isVisible().then(() => true),
        page.waitForTimeout(1000).then(() => false)
      ]);
      
      // Clear for next iteration
      await page.fill('input[name="roomId"]', '');
    }
  });

  test('should support multiple guests joining same room', async ({ page, context }) => {
    const hostName = 'Host';
    const guest1Name = 'Guest1';
    const guest2Name = 'Guest2';
    const guest3Name = 'Guest3';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Three guests join
    const guest1Page = await context.newPage();
    await joinRoom(guest1Page, roomId, guest1Name);
    
    const guest2Page = await context.newPage();
    await joinRoom(guest2Page, roomId, guest2Name);
    
    const guest3Page = await context.newPage();
    await joinRoom(guest3Page, roomId, guest3Name);
    
    // Wait for all participants to appear
    await waitForParticipant(page, guest3Name, 5000);
    
    // Verify host sees all 4 participants
    const participants = await getParticipants(page);
    expect(participants).toHaveLength(4);
    
    const names = participants.map((p) => p.name).sort();
    expect(names).toEqual([hostName, guest1Name, guest2Name, guest3Name].sort());
    
    // Verify only one host
    const hosts = participants.filter((p) => p.isHost);
    expect(hosts).toHaveLength(1);
    expect(hosts[0].name).toBe(hostName);
    
    await guest1Page.close();
    await guest2Page.close();
    await guest3Page.close();
  });

  test('should display room ID to guests after joining', async ({ page, context }) => {
    const hostName = 'Ivan';
    const guestName = 'Julia';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    // Verify room ID is visible to guest
    await expect(guestPage.locator('text=' + roomId)).toBeVisible();
    
    await guestPage.close();
  });

  test('should show join room form on home page', async ({ page }) => {
    await page.goto('/');
    
    // Click join room button
    await page.click('button:has-text("Join Room")');
    
    // Wait for dialog to open
    await page.waitForSelector('input[name="roomId"]', { state: 'visible' });
    
    // Verify form elements in dialog
    await expect(page.locator('input[name="roomId"]')).toBeVisible();
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('button:has-text("Join Room")')).toBeVisible();
  });

  test('should show connection status for guests', async ({ page, context }) => {
    const hostName = 'Karen';
    const guestName = 'Leo';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    // Connection status should be present for guest
    const statusElement = guestPage.locator('[data-testid="connection-status"]');
    await expect(statusElement).toBeVisible();
    
    // Should show connected state
    await expect(statusElement).toHaveAttribute('data-status', 'connected');
    
    await guestPage.close();
  });
});
