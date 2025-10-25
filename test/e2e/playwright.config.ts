import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env.CI;
const useProd = process.env.PLAYWRIGHT_USE_PROD === '1';

export default defineConfig({
  testDir: './',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputDir: './playwright-report',
        outputFolder: new Date().toISOString().split('T')[0],
      },
    ],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    headless: true,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: useProd
    ? {
        // Build and start the production server for CI/release validation
        command: 'npm run start',
        cwd: '../../src/random-with-friends',
        url: 'http://localhost:3000',
        timeout: 180_000,
        reuseExistingServer: false,
      }
    : {
        // Fast dev server for local development
        command: 'npm run dev',
        cwd: '../../src/random-with-friends',
        url: 'http://localhost:3000',
        timeout: 120_000,
        reuseExistingServer: !isCi,
      },
});
