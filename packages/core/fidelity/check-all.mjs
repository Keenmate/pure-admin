#!/usr/bin/env node
// Core-only fidelity gate — the half of the harness that needs nothing but core.
//
// `compare.mjs` needs a wrapper's dump (produced in the svelte/keen repos), so it
// can't run in core's own CI. `capability.mjs` axis-1 (feature contract ↔ compiled
// CSS) + axis-3 (scenario coverage) need ONLY the fixture + dist/css/main.css — no
// maps, no sibling checkout. This runner sweeps every fixture through that
// self-contained check so core can't drift its CSS out from under the oracle
// contract (phantom class, unmapped modifier, uncovered element) without CI going red.
//
//   node fidelity/check-all.mjs            # from packages/core
//
// Exit code = number of fixtures with ≥1 hard failure. 0 = all aligned.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(here, 'fixtures');
const capability = path.join(here, 'capability.mjs');
const cssPath = path.join(here, '..', 'dist', 'css', 'main.css');

const C = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', bold: '\x1b[1m', gray: '\x1b[90m' };
const paint = (c, s) => `${C[c]}${s}${C.reset}`;

if (!fs.existsSync(cssPath)) {
  console.error(paint('red', `missing ${path.relative(process.cwd(), cssPath)} — run "npm run build" first`));
  process.exit(2);
}

const fixtures = fs
  .readdirSync(fixturesDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

console.log(paint('bold', `\nFidelity gate — ${fixtures.length} fixture(s) vs compiled CSS (capability axis-1 + axis-3)\n`));

let failed = 0;
const failingNames = [];
for (const f of fixtures) {
  const fixturePath = path.join(fixturesDir, f);
  const name = f.replace(/\.json$/, '');
  let out = '';
  let hard = 0;
  try {
    out = execFileSync('node', [capability, fixturePath, cssPath], { encoding: 'utf-8' });
  } catch (e) {
    // capability.mjs exits with #hard-failures; execFileSync throws on non-zero.
    out = (e.stdout || '') + (e.stderr || '');
    hard = typeof e.status === 'number' ? e.status : 1;
  }
  if (hard > 0) {
    failed++;
    failingNames.push(name);
    console.log(paint('red', `✗ ${name}`) + paint('gray', ` — ${hard} hard failure(s)`));
    // surface the offending lines so CI logs explain the failure
    for (const line of out.split('\n')) {
      if (/PHANTOM|UNMAPPED|UNCOVERED|DEFER\?|MISSING|OPTIONS/.test(line)) console.log('    ' + line.trim());
    }
  } else {
    console.log(paint('green', `✓ ${name}`));
  }
}

console.log('\n' + paint(failed === 0 ? 'green' : 'red',
  `${fixtures.length - failed}/${fixtures.length} fixtures aligned`) +
  (failed ? paint('red', ` — ${failed} failing: ${failingNames.join(', ')}`) : ''));
console.log('');
process.exit(failed);
