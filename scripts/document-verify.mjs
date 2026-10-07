import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('scripts/document-verify.html')).href);

const session = await page.context().newCDPSession(page);
const snap = await session.send('DOMSnapshot.captureSnapshot', { computedStyles: [] });
const s = snap.strings;
const seq = snap.documents[0].layout.text.filter((i) => i >= 0).map((i) => s[i].trim()).filter(Boolean);

const titles = new Set(['Overview','Scope','Goals','Detail','Detail2','Design','API','Appendix','Glossary']);
const rows = [];
let acc = '';
for (const tok of seq) {
  if (titles.has(tok)) { rows.push([acc, tok]); acc = ''; }
  else if (!/paragraph|Intro/i.test(tok)) acc += tok;
}

const expected = {
  Overview:'1', Scope:'1.1', Goals:'1.2', Detail:'1.2.1', Detail2:'1.2.2',
  Design:'2', API:'2.1', Appendix:'A', Glossary:'A.1',
};
let allOk = true;
for (const [num, title] of rows) {
  const ok = expected[title] === num;
  if (!ok) allOk = false;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${num || '∅'}\t${title}`);
}
console.log(`\nCompiled pa-document numbering (auto + manual): ${allOk ? 'PASS' : 'FAIL'}`);

await browser.close();
