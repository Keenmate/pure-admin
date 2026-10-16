import { test, expect, Page } from './fixtures';

/**
 * Theme matrix — run with playwright.themes.config.ts (see there for usage).
 *
 * For every theme × mode it snapshots:
 *   1. every custom property the loaded stylesheets declare, resolved on <html>
 *      and <body> — catches a token whose value changed even if no pixel moved;
 *   2. a full-page screenshot of each page in PAGES.
 */
const ALL_THEMES = [
    'audi', 'ayu', 'cafeindustrial', 'cobalt2', 'corporate', 'dark', 'darkmatter', 'dracula',
    'express', 'gruvbox', 'minimal', 'nato', 'night-owl', 'one-dark', 'sentinel', 'tokyo-night'
];
const THEMES = process.env.THEMES ? process.env.THEMES.split(',') : ALL_THEMES;
const MODES = ['light', 'dark'] as const;
const PAGES = [
    '/',
    '/buttons',
    '/forms/inputs',
    '/surfaces/cards',
    '/tables/standard',
    '/feedback/alerts',
    '/interactive/badges',
    '/design/colors'
];

async function open(page: Page, path: string, theme: string, mode: string): Promise<void> {
    await page.goto(`${path}?theme=${theme}&mode=${mode}`);
    await page.locator('.page-loader').waitFor({ state: 'detached', timeout: 15_000 });
    await page.evaluate(() => document.fonts.ready);
}

async function resolvedTokens(page: Page): Promise<Record<string, string>> {
    return page.evaluate(() => {
        const names = new Set<string>();
        const walk = (rules: CSSRuleList) => {
            for (const rule of Array.from(rules)) {
                const style = (rule as CSSStyleRule).style;
                if (style) {
                    for (let i = 0; i < style.length; i++) {
                        if (style[i].startsWith('--')) names.add(style[i]);
                    }
                }
                const nested = (rule as CSSGroupingRule).cssRules;
                if (nested) walk(nested);
            }
        };
        for (const sheet of Array.from(document.styleSheets)) {
            try { walk(sheet.cssRules); } catch { /* cross-origin sheet */ }
        }
        const html = getComputedStyle(document.documentElement);
        const body = getComputedStyle(document.body);
        const out: Record<string, string> = {};
        for (const name of Array.from(names).sort()) {
            const h = html.getPropertyValue(name).trim();
            const b = body.getPropertyValue(name).trim();
            out[name] = h === b ? h : `${h} | body: ${b}`;
        }
        return out;
    });
}

for (const theme of THEMES) {
    for (const mode of MODES) {
        test(`${theme} / ${mode}`, async ({ page }) => {
            await open(page, '/', theme, mode);
            const tokens = await resolvedTokens(page);
            expect(Object.keys(tokens).length).toBeGreaterThan(100);
            expect.soft(JSON.stringify(tokens, null, 2)).toMatchSnapshot(`${theme}-${mode}-tokens.json`);

            for (const path of PAGES) {
                await open(page, path, theme, mode);
                const slug = path === '/' ? 'home' : path.slice(1).replace(/\//g, '_');
                // <web-grid> demos render randomised data — mask them (their colours come
                // from --base-*, which the token snapshot already pins).
                await expect.soft(page).toHaveScreenshot(`${theme}-${mode}-${slug}.png`, {
                    fullPage: true,
                    mask: [page.locator('web-grid')]
                });
            }
        });
    }
}
