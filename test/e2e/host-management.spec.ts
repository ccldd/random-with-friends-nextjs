import { expect, test } from '@playwright/test';
import {
    closeRoom,
    createRoom,
    getParticipants,
    isParticipantHost,
    joinRoom,
    waitForParticipant,
    waitForParticipantToLeave,
    waitForRoomClosed,
} from './utils/room-helpers';

test.describe('Host Management', () => {
  test('should show close room button only to host', async ({ page, context }) => {
    const hostName = 'Alice';
    const guestName = 'Bob';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Verify host sees close button
    await expect(page.locator('[data-testid="close-room-button"]')).toBeVisible();
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    // Verify guest does NOT see close button
    await expect(guestPage.locator('[data-testid="close-room-button"]')).not.toBeVisible();
    
    await guestPage.close();
  });

  test('should allow host to close room', async ({ page, context }) => {
    const hostName = 'Charlie';
    const guestName = 'Diana';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    await waitForParticipant(page, guestName);
    
    // Host closes the room
    await closeRoom(page);
    
    // Both should see room closed message
    await waitForRoomClosed(page);
    await waitForRoomClosed(guestPage);
    
    await guestPage.close();
  });

  test('should promote new host when current host leaves', async ({ page, context }) => {
    const hostName = 'Eve';
    const guest1Name = 'Frank';
    const guest2Name = 'Grace';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Two guests join
    const guest1Page = await context.newPage();
    await joinRoom(guest1Page, roomId, guest1Name);
    
    const guest2Page = await context.newPage();
    await joinRoom(guest2Page, roomId, guest2Name);
    
    await waitForParticipant(page, guest2Name);
    
    // Verify host badge is on original host
    expect(await isParticipantHost(guest1Page, hostName)).toBe(true);
    
    // Host closes their page (leaves)
    await page.close();
    
    // Wait a moment for promotion
    await guest1Page.waitForTimeout(2000);
    
    // First guest should be promoted to host
    const participants = await getParticipants(guest1Page);
    const guest1 = participants.find((p) => p.name === guest1Name);
    expect(guest1?.isHost).toBe(true);
    
    // Verify promoted host sees close button
    await expect(guest1Page.locator('[data-testid="close-room-button"]')).toBeVisible();
    
    await guest1Page.close();
    await guest2Page.close();
  });

  test('should handle multiple host changes', async ({ page, context }) => {
    const host1Name = 'Host1';
    const host2Name = 'Host2';
    const guestName = 'Guest';
    
    // First host creates room
    const { roomId } = await createRoom(page, host1Name);
    
    // Second potential host joins
    const host2Page = await context.newPage();
    await joinRoom(host2Page, roomId, host2Name);
    
    // Regular guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    await waitForParticipant(page, guestName);
    
    // First host leaves
    await page.close();
    await host2Page.waitForTimeout(2000);
    
    // Second host should be promoted
    expect(await isParticipantHost(host2Page, host2Name)).toBe(true);
    
    // Second host leaves
    await host2Page.close();
    await guestPage.waitForTimeout(2000);
    
    // Guest should be promoted
    expect(await isParticipantHost(guestPage, guestName)).toBe(true);
    
    await guestPage.close();
  });

  test('should remove participant from list when they disconnect', async ({ page, context }) => {
    const hostName = 'Henry';
    const guestName = 'Iris';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    await waitForParticipant(page, guestName);
    
    // Verify both participants visible
    let participants = await getParticipants(page);
    expect(participants).toHaveLength(2);
    
    // Guest disconnects
    await guestPage.close();
    
    // Guest should be removed from host's list
    await waitForParticipantToLeave(page, guestName);
    
    participants = await getParticipants(page);
    expect(participants).toHaveLength(1);
    expect(participants[0].name).toBe(hostName);
  });

  test('should maintain host role across page refresh', async ({ page }) => {
    const hostName = 'Jack';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Verify host badge
    expect(await isParticipantHost(page, hostName)).toBe(true);
    
    // Refresh page
    await page.reload();
    
    // Wait for reconnection
    await page.waitForSelector('[data-testid="participant-list"]');
    
    // Should still be host
    expect(await isParticipantHost(page, hostName)).toBe(true);
    
    // Should still see close button
    await expect(page.locator('[data-testid="close-room-button"]')).toBeVisible();
  });

  test('should close room when last participant leaves', async ({ page, context }) => {
    const hostName = 'Kate';
    const guestName = 'Leo';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    await waitForParticipant(page, guestName);
    
    // Both leave
    await page.close();
    await guestPage.close();
    
    // Try to join the same room with a new user
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.click('text=Join Room');
    await newPage.fill('input[name="roomId"]', roomId);
    await newPage.fill('input[name="displayName"]', 'NewUser');
    await newPage.click('button:has-text("Join Room")');
    
    // Should fail - room no longer exists
    await expect(newPage.locator('text=/room not found/i')).toBeVisible();
    
    await newPage.close();
  });

  test('should prevent guests from closing room', async ({ page, context }) => {
    const hostName = 'Mike';
    const guestName = 'Nina';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guest joins
    const guestPage = await context.newPage();
    await joinRoom(guestPage, roomId, guestName);
    
    // Guest should NOT see close button
    const closeButton = guestPage.locator('[data-testid="close-room-button"]');
    await expect(closeButton).not.toBeVisible();
    
    // Verify room is still active for host
    const participants = await getParticipants(page);
    expect(participants).toHaveLength(2);
    
    await guestPage.close();
  });

  test('should show host indicator consistently across all participants', async ({
    page,
    context,
  }) => {
    const hostName = 'Oscar';
    const guest1Name = 'Paula';
    const guest2Name = 'Quinn';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // Guests join
    const guest1Page = await context.newPage();
    await joinRoom(guest1Page, roomId, guest1Name);
    
    const guest2Page = await context.newPage();
    await joinRoom(guest2Page, roomId, guest2Name);
    
    await waitForParticipant(page, guest2Name);
    
    // All pages should agree on who is host
    expect(await isParticipantHost(page, hostName)).toBe(true);
    expect(await isParticipantHost(guest1Page, hostName)).toBe(true);
    expect(await isParticipantHost(guest2Page, hostName)).toBe(true);
    
    // All pages should agree guests are NOT hosts
    expect(await isParticipantHost(page, guest1Name)).toBe(false);
    expect(await isParticipantHost(guest1Page, guest1Name)).toBe(false);
    expect(await isParticipantHost(guest2Page, guest1Name)).toBe(false);
    
    await guest1Page.close();
    await guest2Page.close();
  });

  test('should promote earliest-joined guest when host leaves', async ({ page, context }) => {
    const hostName = 'Rachel';
    const firstGuestName = 'Sam';
    const secondGuestName = 'Tina';
    
    // Host creates room
    const { roomId } = await createRoom(page, hostName);
    
    // First guest joins
    const firstGuestPage = await context.newPage();
    await joinRoom(firstGuestPage, roomId, firstGuestName);
    
    // Small delay
    await page.waitForTimeout(500);
    
    // Second guest joins later
    const secondGuestPage = await context.newPage();
    await joinRoom(secondGuestPage, roomId, secondGuestName);
    
    await waitForParticipant(page, secondGuestName);
    
    // Host leaves
    await page.close();
    
    // Wait for promotion
    await firstGuestPage.waitForTimeout(2000);
    
    // First guest (earliest) should be promoted
    expect(await isParticipantHost(firstGuestPage, firstGuestName)).toBe(true);
    expect(await isParticipantHost(secondGuestPage, firstGuestName)).toBe(true);
    
    // Second guest should NOT be host
    expect(await isParticipantHost(firstGuestPage, secondGuestName)).toBe(false);
    
    await firstGuestPage.close();
    await secondGuestPage.close();
  });
});
