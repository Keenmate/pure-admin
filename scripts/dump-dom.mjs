// Ad-hoc DOM dumper for comparing svelte-pure-admin rendered output against
// the core canonical markup. Usage:
//   node scripts/dump-dom.mjs <path> <selector> [nth]
// e.g. node scripts/dump-dom.mjs /buttons ".pa-btn" 0
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const [, , path = '/', selector = 'body', nthRaw] = process.argv;
const nth = nthRaw === undefined ? null : Number(nthRaw);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(BASE + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

const html = await page.evaluate(({ selector, nth }) => {
  const strip = (node) => {
    // Remove Svelte hydration comment nodes so the diff is about real markup.
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT);
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach((c) => c.remove());
  };
  const format = (el) => {
    const clone = el.cloneNode(true);
    strip(clone);
    return clone.outerHTML;
  };
  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return `NO MATCH for ${selector}`;
  if (nth === null) return `[${els.length} matches]\n` + format(els[0]);
  return format(els[nth]);
}, { selector, nth });

// Light prettifier: newline before each tag.
const pretty = html
  .replace(/></g, '>\n<')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .join('\n');

console.log(pretty);
await browser.close();
