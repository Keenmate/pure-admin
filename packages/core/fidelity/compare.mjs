#!/usr/bin/env node
// Markup-fidelity comparator.
//
// Reads the core fixture (goldens) and a wrapper dump file, normalizes both
// sides, and reports per-scenario PASS/FAIL with a minimal diff on mismatch.
//
//   node compare.mjs <fixture.json> <wrapper-dump.json> [--label NAME]
//
// A wrapper dump is: [{ "name": "<scenario>", "html": "<rendered fragment>" }].
// Exit code is the number of failing scenarios (0 = all aligned), so it drops
// straight into CI.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize, normalizeLines } from './lib/normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m'
};
const paint = (c, s) => `${C[c]}${s}${C.reset}`;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// Minimal line diff (LCS) so a mismatch prints the offending element(s).
function diffLines(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push(paint('gray', '  ' + a[i])); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(paint('red', '- ' + a[i])); i++; }
    else { out.push(paint('green', '+ ' + b[j])); j++; }
  }
  while (i < n) out.push(paint('red', '- ' + a[i++]));
  while (j < m) out.push(paint('green', '+ ' + b[j++]));
  return out;
}

function main() {
  const args = process.argv.slice(2);
  let label = 'wrapper';
  const positional = [];
  for (let k = 0; k < args.length; k++) {
    if (args[k] === '--label') label = args[++k];
    else positional.push(args[k]);
  }
  const [fixturePath, dumpPath] = positional;
  if (!fixturePath || !dumpPath) {
    console.error('usage: node compare.mjs <fixture.json> <wrapper-dump.json> [--label NAME]');
    process.exit(2);
  }

  const fixture = readJson(path.resolve(fixturePath));
  const dump = readJson(path.resolve(dumpPath));
  const dumpByName = new Map(dump.map((d) => [d.name, d.html]));

  // Per-component normalize trims (optional). Applied to BOTH golden and dump so
  // wiring a single component emits (e.g. keen tab_item's switching handles) is
  // dropped symmetrically. Wrapper-wide wiring (phx-*) is handled by defaults.
  const normOpts = fixture.normalize || {};

  const results = [];
  for (const scenario of fixture.scenarios) {
    const golden = scenario.golden;
    const actual = dumpByName.get(scenario.name);
    if (actual === undefined) {
      results.push({ name: scenario.name, status: 'MISSING' });
      continue;
    }
    const g = normalize(golden, normOpts);
    const a = normalize(actual, normOpts);
    results.push({ name: scenario.name, status: g === a ? 'PASS' : 'FAIL', golden, actual });
  }

  const pass = results.filter((r) => r.status === 'PASS').length;
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const missing = results.filter((r) => r.status === 'MISSING').length;

  console.log(paint('bold', `\nMarkup fidelity — ${fixture.component} — ${label} vs core golden\n`));
  for (const r of results) {
    if (r.status === 'PASS') {
      console.log(`  ${paint('green', 'PASS')}  ${r.name}`);
    } else if (r.status === 'MISSING') {
      console.log(`  ${paint('yellow', 'MISS')}  ${r.name}  ${paint('gray', '(no dump entry)')}`);
    } else {
      console.log(`  ${paint('red', 'FAIL')}  ${r.name}`);
      const lines = diffLines(normalizeLines(r.golden, normOpts), normalizeLines(r.actual, normOpts));
      for (const l of lines) console.log('        ' + l);
      console.log('');
    }
  }

  const summary = `${pass} pass, ${fail} fail, ${missing} missing  (of ${results.length})`;
  console.log('\n' + paint(fail + missing === 0 ? 'green' : 'red', summary) + '\n');
  process.exit(fail + missing);
}

main();
