// Live-DOM dumper for keen-pure-admin structural fidelity audits.
// Loads a LiveView route in a headless browser, extracts the subtree(s) for a
// selector, strips LiveView runtime noise (phx-* attrs, hydration comments,
// data-phx-*, generated ids) so the diff is about STRUCTURE + classes + a11y
// attrs vs the core snippet — not runtime plumbing.
//
// Usage:
//   BASE=http://localhost:18700 node scripts/dump-dom.mjs <path> <selector> [nth]
// e.g. node scripts/dump-dom.mjs /components/modals ".pa-modal" 0
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:18700';
const [, , path = '/', selector = 'body', nthRaw] = process.argv;
const nth = nthRaw === undefined ? null : Number(nthRaw);

const browser = await chromium.launch();
const page = await browser.newPage();
// LiveView holds a websocket open, so 'networkidle' never fires — use 'load'.
await page.goto(BASE + path, { waitUntil: 'load' });
await page.waitForTimeout(400);

const html = await page.evaluate(({ selector, nth }) => {
  const stripComments = (node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT);
    const comments = [];
    while (walker.nextNode()) comments.push(walker.currentNode);
    comments.forEach((c) => c.remove());
  };
  // Attributes that are LiveView/runtime plumbing, not part of the markup contract.
  const NOISE = /^(phx-|data-phx|data-pa-|aria-controls$|aria-labelledby$|aria-describedby$)/;
  const stripAttrs = (el) => {
    el.querySelectorAll('*').forEach((n) => {
      [...n.attributes].forEach((a) => {
        if (NOISE.test(a.name)) n.removeAttribute(a.name);
      });
    });
    [...el.attributes].forEach((a) => {
      if (NOISE.test(a.name)) el.removeAttribute(a.name);
    });
  };
  const format = (el) => {
    const clone = el.cloneNode(true);
    stripComments(clone);
    stripAttrs(clone);
    return clone.outerHTML;
  };
  const els = Array.from(document.querySelectorAll(selector));
  if (!els.length) return `NO MATCH for ${selector}`;
  if (nth === null) return `[${els.length} matches]\n` + format(els[0]);
  return format(els[nth]);
}, { selector, nth });

const pretty = html
  .replace(/></g, '>\n<')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .join('\n');

console.log(pretty);
await browser.close();
