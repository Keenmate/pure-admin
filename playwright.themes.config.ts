import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

/**
 * Theme matrix — every theme × light/dark × a set of demo pages, recorded as
 * snapshots (resolved custom-property values + screenshots) so a build-pipeline
 * change (e.g. the Sass @import → @use migration) can be proven render-neutral.
 *
 *   THEME_SNAPSHOTS=<dir> npx playwright test -c playwright.themes.config.ts --update-snapshots   # record
 *   THEME_SNAPSHOTS=<dir> npx playwright test -c playwright.themes.config.ts                      # compare
 *
 * Optional: THEMES=corporate,dracula to narrow the matrix.
 */
const snapshotDir = process.env.THEME_SNAPSHOTS || './e2e/theme-matrix-snapshots';

export default defineConfig({
    ...base,
    testMatch: /theme-matrix\.spec\.ts/,
    testIgnore: [],   // the base config ignores this spec; this config is its runner
    timeout: 60_000,
    snapshotPathTemplate: `${snapshotDir}/{arg}{ext}`,
    expect: {
        timeout: 10_000,
        toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixels: 0 }
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }]
});
