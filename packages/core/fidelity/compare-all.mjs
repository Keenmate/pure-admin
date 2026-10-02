#!/usr/bin/env node
// Cross-wrapper compare SWEEP.
//
// For every fixture, diff each wrapper's dump against the golden (applying the
// fixture's per-component `normalize` trims). Prints a per-fixture matrix +
// totals, and surfaces the gaps — components a wrapper never dumped (a missing
// map), and scenarios present in the golden but absent from a dump.
//
//   node compare-all.mjs            # sweep both wrappers
//   node compare-all.mjs --wrapper keen
//
// Exit code = total failing scenarios (real divergences) across all wrappers,
// so it drops into CI. Missing dumps/scenarios are reported but don't gate
// (a wrapper legitimately may not map every component yet) unless --strict.
//
// Requires the wrapper dumps to exist first:
//   svelte:  node scripts/fidelity/dump.mjs --all
//   keen:    mix pa.fidelity.dump --all

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalize } from './lib/normalize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures');

// Sibling repos: __dirname is .../pure-admin/packages/core/fidelity, so four
// levels up reaches C:/Git/KM (the repos' common parent).
const WRAPPERS = {
  keen: (c) => path.join(__dirname, `../../../../keen-pure-admin/fidelity/keen-${c}.dump.json`),
  svelte: (c) => path.join(__dirname, `../../../../svelte-pure-admin/scripts/fidelity/svelte-${c}.dump.json`)
};

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m'
};
const paint = (c, s) => `${C[c]}${s}${C.reset}`;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function main() {
  const args = process.argv.slice(2);
  let only = null, strict = false;
  for (let k = 0; k < args.length; k++) {
    if (args[k] === '--wrapper') only = args[++k];
    else if (args[k] === '--strict') strict = true;
  }
  const wrappers = Object.keys(WRAPPERS).filter((w) => !only || w === only);

  const fixtures = fs.readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .sort();

  let totalFail = 0, totalPass = 0, totalMissScenarios = 0;
  const missingDumps = []; // `${component} [${wrapper}]`
  const failedFixtures = [];

  console.log(paint('bold', `\nMarkup fidelity sweep — ${wrappers.join(' + ')} vs core goldens\n`));

  for (const component of fixtures) {
    const fixture = readJson(path.join(FIXTURES, `${component}.json`));
    const normOpts = fixture.normalize || {};
    const scenarios = fixture.scenarios || [];
    const cells = [];
    let fixtureHasFail = false;

    for (const w of wrappers) {
      const dumpPath = WRAPPERS[w](component);
      if (!fs.existsSync(dumpPath)) {
        cells.push(`${w} ${paint('gray', '—')}`);
        missingDumps.push(`${component} [${w}]`);
        continue;
      }
      const byName = new Map(readJson(dumpPath).map((d) => [d.name, d.html]));
      let pass = 0, fail = 0, miss = 0;
      const failNames = [];
      for (const s of scenarios) {
        const actual = byName.get(s.name);
        if (actual === undefined) { miss++; continue; }
        if (normalize(s.golden, normOpts) === normalize(actual, normOpts)) pass++;
        else { fail++; failNames.push(s.name); }
      }
      totalPass += pass; totalFail += fail; totalMissScenarios += miss;
      if (fail || miss) fixtureHasFail = true;
      const color = fail ? 'red' : miss ? 'yellow' : 'green';
      let cell = `${w} ${paint(color, `${pass}/${scenarios.length}`)}`;
      if (fail) cell += paint('red', ` ✗${fail}`);
      if (miss) cell += paint('yellow', ` ?${miss}`);
      cells.push(cell);
      if (fail) failedFixtures.push(`${component} [${w}]: ${failNames.join(', ')}`);
    }

    const tag = fixture.composite ? paint('cyan', ' (composite)') : '';
    const mark = fixtureHasFail ? paint('red', '✗') : paint('green', '✓');
    console.log(`  ${mark} ${component.padEnd(26)}${tag ? tag.padEnd(0) : ''}  ${cells.join('   ')}`);
  }

  console.log('');
  if (failedFixtures.length) {
    console.log(paint('red', 'Divergences:'));
    for (const f of failedFixtures) console.log('  ' + paint('red', f));
    console.log('');
  }
  if (missingDumps.length) {
    console.log(paint('yellow', `Not dumped (no wrapper map / stale dump) — ${missingDumps.length}:`));
    console.log('  ' + paint('gray', missingDumps.join('  ')));
    console.log('');
  }

  const summary =
    `${totalPass} pass, ${totalFail} fail, ${totalMissScenarios} missing-scenario` +
    `  ·  ${missingDumps.length} not-dumped`;
  console.log(paint(totalFail === 0 ? 'green' : 'red', summary) + '\n');

  const exit = totalFail + (strict ? totalMissScenarios + missingDumps.length : 0);
  process.exit(exit);
}

main();
