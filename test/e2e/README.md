Playwright E2E test workspace

This folder is an isolated Node workspace for end-to-end tests using Playwright.

Quick start

1. From repository root, install dependencies for this workspace:

   # from Windows PowerShell
   cd test/e2e; npm ci

2. Install Playwright browsers (required once):

    npm run install:playwright

Local vs CI runs

- Local (fast, uses dev server):

   # from repository root
   cd test/e2e
   npm test

   This uses the Playwright webServer config to run `npm run dev` in the app folder.

- CI / production build (recommended for release validation):

   # from repository root
   cd test/e2e
   # run production build + start then tests
   PLAYWRIGHT_USE_PROD=1 npm test

   In CI the test job should set `PLAYWRIGHT_USE_PROD=1` so Playwright will run
   `npm run build && npm run start` in the app folder before executing tests.

3. Run the test suite (headless):

   npm test

4. Run headed (visible) browser for debugging:

   npm run test:headed

Notes

- Keep E2E tests in `test/e2e/tests/` (e.g., `tests/example.spec.ts`).
- Add a `playwright.config.ts` at the repo root or in this folder if you prefer isolated config.
- The main application lives in `src/random-with-friends/`; ensure the app is running (e.g., `npm run dev` from that folder)
  or adapt Playwright to start the app during the test run.
