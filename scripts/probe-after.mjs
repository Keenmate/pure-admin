// One-off probe: read computed ::after content of each .pa-field__value on /audit.
// Usage: MSYS_NO_PATHCONV=1 node scripts/probe-after.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${BASE}/audit`, { waitUntil: 'networkidle' });

const rows = await page.$$eval('.pa-field', (fields) =>
	fields.map((f) => {
		const val = f.querySelector('.pa-field__value');
		const after = val ? getComputedStyle(val, '::after').content : '(no value el)';
		const label = f.querySelector('.pa-field__label')?.textContent?.trim();
		return { label, after };
	})
);

for (const r of rows) console.log(`${r.label?.padEnd(16)} ::after content = ${r.after}`);
await browser.close();
