import { test as base, expect } from '@playwright/test';

// Extend the test with typed fixtures
const test = base.extend<{
  createRoom: (displayName: string) => Promise<string>;
}>({
  createRoom: async ({ page }, use) => {
    await use(async (displayName: string) => {
      await page.goto('/');
      await page.getByLabel('Display Name').fill(displayName);
      await page.getByRole('button', { name: /Create Room|Creating/ }).click();
      await page.waitForURL(/\/room\/[A-Za-z0-9-]+/);
      return page.url().split('/').pop()?.split('?')[0] || '';
    });
  },
});

test.describe('Room Creation and Joining Flow', () => {
  test('creates a new room and joins as host', async ({ page }) => {
    // Start from home page
    await page.goto('/');

    // Fill in display name
    const displayName = 'Test Host';
    await page.getByLabel('Display Name').fill(displayName);

    // Create room and wait for navigation
    const createButton = page.getByRole('button', { name: /Create Room|Creating/ });
    await createButton.click();

    // Verify we landed in the room
    await expect(page.url()).toMatch(/\/room\/[A-Za-z0-9-]+/);
    await expect(page.getByText(displayName)).toBeVisible();
    await expect(page.getByText('(Host)')).toBeVisible();
  });

  test('shows error when joining non-existent room', async ({ page }) => {
    await page.goto('/');

    // Open join dialog
    await page.getByRole('button', { name: 'Join Room' }).click();

    // Fill join form
    await page.getByLabel('Room Code').fill('non-existent-room');
    await page.getByLabel('Display Name').fill('Test User');

    // Try to join
    await page.getByRole('button', { name: /Join Room|Checking/ }).click();

    // Verify error toast
    await expect(page.getByText('Room not found')).toBeVisible();
  });

  test('successfully joins an existing room', async ({ browser }) => {
    // Create a room with the host
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto('/');
    const hostName = 'Host User';
    await hostPage.getByLabel('Display Name').fill(hostName);
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();

    // Wait for navigation and extract room ID
    const roomUrl = hostPage.url();
    const roomId = roomUrl.split('/').pop()?.split('?')[0];

    // Join with a guest
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    await guestPage.goto('/');
    await guestPage.getByRole('button', { name: 'Join Room' }).click();

    const guestName = 'Guest User';
    await guestPage.getByLabel('Room Code').fill(roomId!);
    await guestPage.getByLabel('Display Name').fill(guestName);
    await guestPage.getByRole('button', { name: /Join Room|Checking/ }).click();

    // Verify both users see each other
    for (const page of [hostPage, guestPage]) {
      await expect(page.getByText(hostName)).toBeVisible();
      await expect(page.getByText(guestName)).toBeVisible();
      await expect(page.getByText('(Host)')).toBeVisible();
    }
  });
});

test.describe('Host Management', () => {
  test('promotes new host when original host leaves', async ({ browser }) => {
    // Set up host and guest
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto('/');
    await hostPage.getByLabel('Display Name').fill('Original Host');
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();

    const roomId = hostPage.url().split('/').pop()?.split('?')[0];

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    await guestPage.goto('/');
    await guestPage.getByRole('button', { name: 'Join Room' }).click();
    await guestPage.getByLabel('Room Code').fill(roomId!);
    await guestPage.getByLabel('Display Name').fill('Future Host');
    await guestPage.getByRole('button', { name: /Join Room|Checking/ }).click();

    // Close host's connection
    await hostPage.close();

    // Verify guest was promoted
    await expect(guestPage.getByText('(Host)')).toBeVisible();
  });

  test('allows host to close room', async ({ browser }) => {
    // Set up host and guest
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto('/');
    await hostPage.getByLabel('Display Name').fill('Host User');
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();

    const roomId = hostPage.url().split('/').pop()?.split('?')[0];

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    await guestPage.goto('/');
    await guestPage.getByRole('button', { name: 'Join Room' }).click();
    await guestPage.getByLabel('Room Code').fill(roomId!);
    await guestPage.getByLabel('Display Name').fill('Guest User');
    await guestPage.getByRole('button', { name: /Join Room|Checking/ }).click();

    // Host closes room
    await hostPage.getByRole('button', { name: 'Close Room' }).click();

    // Verify both users are redirected home
    for (const page of [hostPage, guestPage]) {
      await expect(page).toHaveURL('/');
    }
  });
});
