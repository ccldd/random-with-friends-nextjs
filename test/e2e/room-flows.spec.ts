import { test, expect } from '@playwright/test';

test.describe('Room Creation and Joining Flow', () => {
  test('creates a new room and joins as host', async ({ page }) => {
    await page.goto('/');
    const displayName = 'Test Host';
    await page.getByLabel('Display Name').fill(displayName);
    await page.getByRole('button', { name: /Create Room|Creating/ }).click();
    await expect(page.url()).toMatch(/\/room\/[A-Za-z0-9-]+/);
    await expect(page.getByText(displayName)).toBeVisible();
    await expect(page.getByText('(Host)')).toBeVisible();
  });

  test('shows error when joining non-existent room', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Join Room' }).click();
    await page.getByLabel('Room Code').fill('non-existent-room');
    await page.getByRole('dialog').getByLabel('Display Name').fill('Test User');
    await page.getByRole('button', { name: /Join Room|Checking/ }).click();
    await expect(page.getByText('Room not found')).toBeVisible();
  });

  test('successfully joins an existing room', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto('/');
    const hostName = 'Host User';
    await hostPage.getByLabel('Display Name').fill(hostName);
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();
    await hostPage.waitForURL(/\/room\/.+/);
    const roomUrl = hostPage.url();
    const roomId = roomUrl.split('/').pop()?.split('?')[0];

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto('/');
    await guestPage.getByRole('button', { name: 'Join Room' }).click();
    const guestName = 'Guest User';
    await guestPage.getByLabel('Room Code').fill(roomId!);
    await guestPage.getByRole('dialog').getByLabel('Display Name').fill(guestName);
    await guestPage.getByRole('button', { name: /Join Room|Checking/ }).click();

    for (const page of [hostPage, guestPage]) {
      await expect(page.getByText(hostName)).toBeVisible();
      await expect(page.getByText(guestName)).toBeVisible();
      await expect(page.getByText('(Host)')).toBeVisible();
    }
  });
});

test.describe('Host Management', () => {
  test('promotes new host when original host leaves', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto('/');
    await hostPage.getByLabel('Display Name').fill('Original Host');
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();
    await hostPage.waitForURL(/\/room\/.+/);
    const roomId = hostPage.url().split('/').pop()?.split('?')[0];

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto('/');
    await guestPage.getByRole('button', { name: 'Join Room' }).click();
    await guestPage.getByLabel('Room Code').fill(roomId!);
    await guestPage.getByRole('dialog').getByLabel('Display Name').fill('Future Host');
    await guestPage.getByRole('button', { name: /Join Room|Checking/ }).click();

    await hostPage.close();
    await expect(guestPage.getByText('(Host)')).toBeVisible();
  });

  test('allows host to close room', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto('/');
    await hostPage.getByLabel('Display Name').fill('Host User');
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();
    await hostPage.waitForURL(/\/room\/.+/);
    const roomId = hostPage.url().split('/').pop()?.split('?')[0];

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto('/');
    await guestPage.getByRole('button', { name: 'Join Room' }).click();
    await guestPage.getByLabel('Room Code').fill(roomId!);
    await guestPage.getByRole('dialog').getByLabel('Display Name').fill('Guest User');
    await guestPage.getByRole('button', { name: /Join Room|Checking/ }).click();

    await hostPage.getByRole('button', { name: 'Close Room' }).click();

    for (const page of [hostPage, guestPage]) {
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Participant List', () => {
  test('updates in real-time when participants join/leave', async ({ browser }) => {
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto('/');
    const hostName = 'Host User';
    await hostPage.getByLabel('Display Name').fill(hostName);
    await hostPage.getByRole('button', { name: /Create Room|Creating/ }).click();
    await hostPage.waitForURL(/\/room\/.+/);
    const roomId = hostPage.url().split('/').pop()?.split('?')[0];

    const guest1Context = await browser.newContext();
    const guest1Page = await guest1Context.newPage();
    await guest1Page.goto('/');
    await guest1Page.getByRole('button', { name: 'Join Room' }).click();
    const guest1Name = 'Guest 1';
    await guest1Page.getByLabel('Room Code').fill(roomId!);
    await guest1Page.getByLabel('Display Name').fill(guest1Name);
    await guest1Page.getByRole('button', { name: /Join Room|Checking/ }).click();

    await expect(hostPage.getByText(guest1Name)).toBeVisible();

    const guest2Context = await browser.newContext();
    const guest2Page = await guest2Context.newPage();
    await guest2Page.goto('/');
    await guest2Page.getByRole('button', { name: 'Join Room' }).click();
    const guest2Name = 'Guest 2';
    await guest2Page.getByLabel('Room Code').fill(roomId!);
    await guest2Page.getByLabel('Display Name').fill(guest2Name);
    await guest2Page.getByRole('button', { name: /Join Room|Checking/ }).click();

    for (const page of [hostPage, guest1Page, guest2Page]) {
      await expect(page.getByText(hostName)).toBeVisible();
      await expect(page.getByText(guest1Name)).toBeVisible();
      await expect(page.getByText(guest2Name)).toBeVisible();
    }

    await guest1Page.close();

    for (const page of [hostPage, guest2Page]) {
      await expect(page.getByText(guest1Name)).not.toBeVisible();
      await expect(page.getByText(hostName)).toBeVisible();
      await expect(page.getByText(guest2Name)).toBeVisible();
    }
  });
});
