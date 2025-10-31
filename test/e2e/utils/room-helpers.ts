import { Page } from '@playwright/test';

/**
 * Test helper utilities for room creation and management flows
 */

export interface RoomInfo {
  roomId: string;
  hostName: string;
}

export interface ParticipantInfo {
  name: string;
  isHost: boolean;
}

/**
 * Creates a room using the UI and returns the room information
 */
export async function createRoom(page: Page, hostName: string): Promise<RoomInfo> {
  await page.goto('/');

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');

  // Find the create room form (not in a dialog) and fill in the displayName
  // We target the form that has "Create Room" button (not "Join Room")
  const createForm = page
    .locator('form')
    .filter({ has: page.locator('button:has-text("Create Room")') });
  await createForm.locator('input[name="displayName"]').fill(hostName);

  // Click create room button
  await createForm.locator('button:has-text("Create Room")').click();

  // Wait for navigation to room page
  await page.waitForURL(/\/room\/[A-Z0-9]+/, { timeout: 30000 });

  // Extract room ID from URL
  const url = page.url();
  const match = url.match(/\/room\/([A-Z0-9]+)/);

  if (!match) {
    throw new Error('Failed to extract room ID from URL');
  }

  return {
    roomId: match[1],
    hostName,
  };
}

/**
 * Joins an existing room using the UI
 */
export async function joinRoom(page: Page, roomId: string, guestName: string): Promise<void> {
  await page.goto('/');

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');

  // Click "Join Room" button to open dialog
  await page.click('button:has-text("Join Room")');

  // Wait for dialog to open
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });

  // Fill in the join form within the dialog
  await dialog.locator('input[name="roomId"]').fill(roomId);
  await dialog.locator('input[name="displayName"]').fill(guestName);

  // Click join button in dialog
  await dialog.locator('button:has-text("Join Room")').click();

  // Wait for navigation to room page
  await page.waitForURL(`/room/${roomId}`, { timeout: 30000 });
}

/**
 * Gets the list of participants shown in the room
 */
export async function getParticipants(page: Page): Promise<ParticipantInfo[]> {
  // Wait for participant list to be visible
  await page.waitForSelector('[data-testid="participant-list"]', { timeout: 5000 });
  
  // Get all participant items
  const participantElements = await page.locator('[data-testid="participant-item"]').all();
  
  const participants: ParticipantInfo[] = [];
  
  for (const element of participantElements) {
    const nameElement = await element.locator('[data-testid="participant-name"]');
    const name = await nameElement.textContent();
    const isHost = (await element.locator('[data-testid="host-badge"]').count()) > 0;
    
    if (name) {
      participants.push({
        name: name.trim(),
        isHost,
      });
    }
  }
  
  return participants;
}

/**
 * Waits for a specific participant to appear in the list
 */
export async function waitForParticipant(
  page: Page,
  participantName: string,
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(
    `[data-testid="participant-item"]:has-text("${participantName}")`,
    { timeout }
  );
}

/**
 * Waits for a specific participant to disappear from the list
 */
export async function waitForParticipantToLeave(
  page: Page,
  participantName: string,
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(
    `[data-testid="participant-item"]:has-text("${participantName}")`,
    { state: 'detached', timeout }
  );
}

/**
 * Checks if a participant is marked as host
 */
export async function isParticipantHost(page: Page, participantName: string): Promise<boolean> {
  const participants = await getParticipants(page);
  const participant = participants.find((p) => p.name === participantName);
  return participant?.isHost ?? false;
}

/**
 * Closes the room (host action)
 */
export async function closeRoom(page: Page): Promise<void> {
  await page.click('[data-testid="close-room-button"]');
  
  // Confirm in dialog if present
  const confirmButton = page.locator('button:has-text("Close Room")').last();
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }
}

/**
 * Waits for the room to be closed (shows closed message)
 */
export async function waitForRoomClosed(page: Page, timeout = 5000): Promise<void> {
  await page.waitForSelector('text=/Room.*closed/i', { timeout });
}

/**
 * Gets the connection status indicator text
 */
export async function getConnectionStatus(page: Page): Promise<string> {
  const statusElement = await page.locator('[data-testid="connection-status"]');
  const text = await statusElement.textContent();
  return text?.trim() ?? '';
}

/**
 * Waits for connection status to change to specific state
 */
export async function waitForConnectionStatus(
  page: Page,
  status: 'connected' | 'reconnecting' | 'disconnected',
  timeout = 5000
): Promise<void> {
  await page.waitForSelector(
    `[data-testid="connection-status"][data-status="${status}"]`,
    { timeout }
  );
}

/**
 * Validates that a room ID matches expected format
 */
export function isValidRoomId(roomId: string): boolean {
  return /^[A-Z0-9]{4,12}$/.test(roomId);
}

/**
 * Opens a room directly by URL (bypassing creation/join flow)
 */
export async function openRoomByUrl(page: Page, roomId: string): Promise<void> {
  await page.goto(`/room/${roomId}`);
}

/**
 * Simulates network disconnect/reconnect for testing connection handling
 */
export async function simulateDisconnect(page: Page): Promise<void> {
  await page.context().setOffline(true);
}

export async function simulateReconnect(page: Page): Promise<void> {
  await page.context().setOffline(false);
}
