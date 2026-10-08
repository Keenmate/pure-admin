#!/usr/bin/env node
// Cross-wrapper compare SWEEP + COVERAGE gate.
//
// Two things in one pass:
//   CORRECTNESS — for every fixture, diff each wrapper's dump against the golden
//     (applying the fixture's per-component `normalize` trims). Real divergences
//     gate (exit code).
//   COVERAGE — does every wrapper actually IMPLEMENT every core capability? A
//     fixture is a capability; a wrapper "covers" it by shipping a current dump.
//     A REQUIRED capability with no dump is a hard coverage failure that gates —
//     so "wrapper silently doesn't implement X" can no longer hide as a quiet
//     "not dumped" line. A capability a wrapper legitimately can't/shouldn't
//     implement must say so in the fixture's `coverage` block, with a reason:
//
//        "coverage": { "svelte": { "exempt": "no standalone component — drawn inside the list" } }
//
//     Absent/true → required for that wrapper. `{ "exempt": "<reason>" }` (or
//     false) → acknowledged out-of-scope: reported, not gated. Composites are
//     compare-only, so they're not coverage-required unless a fixture opts in.
//
//   node compare-all.mjs            # sweep both wrappers (gates on divergences + required-missing)
//   node compare-all.mjs --wrapper keen
//   node compare-all.mjs --strict   # ALSO gate missing scenarios + exempt gaps (no-exceptions run)
//
// Requires the wrapper dumps to exist first (a missing dump reads as "not
// implemented" — regenerate before trusting a red):
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

// Is this fixture a REQUIRED capability for wrapper `w`? Default = required.
// `coverage[w]` of `{exempt:"reason"}` or `false` opts out (reported, not gated).
// Composites are compare-only seams → not required unless the fixture says true.
function coverageFor(fixture, w) {
  const v = (fixture.coverage || {})[w];
  if (v && typeof v === 'object' && v.exempt) return { required: false, reason: v.exempt };
  if (v === false) return { required: false, reason: 'declared out-of-scope' };
  if (v === true) return { required: true };
  if (fixture.composite) return { required: false, reason: 'composite (compare-only)' };
  return { required: true };
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
  const requiredMissing = []; // `${component} [${wrapper}]` — REQUIRED capability, no dump → gates
  const exemptMissing = [];   // `${component} [${wrapper}]: reason` — acknowledged, reported
  const failedFixtures = [];
  const knownFixtures = []; // acknowledged divergences — reported, not gated
  let totalKnown = 0;

  console.log(paint('bold', `\nMarkup fidelity sweep — ${wrappers.join(' + ')} vs core goldens\n`));

  for (const component of fixtures) {
    const fixture = readJson(path.join(FIXTURES, `${component}.json`));
    const normOpts = fixture.normalize || {};
    // Per-wrapper acknowledged divergence: a wrapper whose SSR intentionally
    // differs from the oracle (keen's popconfirm trigger-wrapper + data-placement
    // scaffolding; svelte non-dumpable components). Reported as KNOWN, not a
    // miss — so the sweep flags real drift, not documented differences.
    const knownDivergent = fixture.knownDivergent || {};
    const scenarios = fixture.scenarios || [];
    const cells = [];
    let fixtureHasFail = false;

    for (const w of wrappers) {
      const dumpPath = WRAPPERS[w](component);
      if (!fs.existsSync(dumpPath)) {
        const { required, reason } = coverageFor(fixture, w);
        if (required) {
          cells.push(`${w} ${paint('red', 'MISSING')}`);
          requiredMissing.push(`${component} [${w}]`);
          fixtureHasFail = true;
        } else {
          cells.push(`${w} ${paint('gray', 'exempt')}`);
          exemptMissing.push(`${component} [${w}]: ${reason}`);
        }
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

      if (knownDivergent[w] && (fail || miss)) {
        // Acknowledged — count matching scenarios as pass, the rest as known.
        totalPass += pass;
        totalKnown += fail + miss;
        knownFixtures.push(`${component} [${w}]: ${knownDivergent[w]}`);
        let cell = `${w} ${paint('yellow', 'known')}`;
        if (fail) cell += paint('yellow', ` ✗${fail}`);
        if (miss) cell += paint('yellow', ` ?${miss}`);
        cells.push(cell);
        continue;
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
  if (knownFixtures.length) {
    console.log(paint('yellow', `Known divergences (documented, not gated) — ${knownFixtures.length}:`));
    for (const f of knownFixtures) console.log('  ' + paint('gray', f));
    console.log('');
  }
  if (requiredMissing.length) {
    console.log(paint('red', `Coverage gaps — REQUIRED capability not implemented/dumped (gates) — ${requiredMissing.length}:`));
    console.log('  ' + paint('red', requiredMissing.join('  ')));
    console.log(paint('gray', '  → implement + dump the component, or add a `coverage` exemption (with reason) to the fixture.'));
    console.log('');
  }
  if (exemptMissing.length) {
    console.log(paint('gray', `Coverage exemptions (documented out-of-scope, not gated) — ${exemptMissing.length}:`));
    for (const e of exemptMissing) console.log('  ' + paint('gray', e));
    console.log('');
  }

  const coverageFail = requiredMissing.length;
  const summary =
    `${totalPass} pass, ${totalFail} fail, ${totalMissScenarios} missing-scenario` +
    `  ·  ${totalKnown} known-divergent  ·  ${coverageFail} coverage-gap, ${exemptMissing.length} exempt`;
  console.log(paint(totalFail === 0 && coverageFail === 0 ? 'green' : 'red', summary) + '\n');

  // Default gate: real divergences + REQUIRED capabilities with no dump.
  // --strict additionally gates missing scenarios and exempt gaps.
  const exit = totalFail + coverageFail + (strict ? totalMissScenarios + exemptMissing.length : 0);
  process.exit(exit);
}

main();
