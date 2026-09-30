#!/usr/bin/env node
// Capability diff — the completeness half of the fidelity harness.
//
// The render comparator (compare.mjs) proves CORRECTNESS: does the wrapper emit
// the markup core blesses for the scenarios we wrote? This proves COMPLETENESS,
// on three axes, so a feature can't slip through untested:
//
//   1. fixture features  ↔  dist/css/main.css
//        Every class a feature claims to produce exists in the compiled CSS
//        (no invented/phantom oracle), AND every pa-btn--* in the CSS is claimed
//        by some feature or listed as a JS/state class (→ catches "core added a
//        modifier and nobody added a feature").
//   2. fixture features  ↔  each wrapper's capability map
//        Every feature + every enum option the oracle defines is declared by the
//        wrapper (→ catches "wrapper is missing a feature / an option value"),
//        and flags wrapper-declared features the oracle doesn't know.
//   3. fixture features  ↔  the scenario set
//        Which feature options are never exercised by any scenario's props
//        (→ a markup-correctness coverage gap; reported as a warning).
//
//   node capability.mjs <fixture.json> <main.css> [--map label=path ...]
//
// Exit code = number of HARD failures (axes 1 & 2). Axis 3 is advisory.

import fs from 'node:fs';
import path from 'node:path';

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m'
};
const paint = (c, s) => `${C[c]}${s}${C.reset}`;
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));

// Expand a feature's `produces` template into concrete class names.
function producedClasses(name, feat) {
  const out = [];
  const tmpl = feat.produces;
  if (tmpl) {
    if (tmpl.includes('{value}') && feat.options) {
      for (const o of feat.options) out.push(tmpl.replace('{value}', o));
    } else if (tmpl.includes('{variant}') && feat.appliesToVariants) {
      for (const v of feat.appliesToVariants) out.push(tmpl.replace('{variant}', v));
    } else if (!tmpl.includes('{')) {
      out.push(tmpl);
    }
  }
  if (feat.outlineProduces && feat.options) {
    for (const o of feat.options) out.push(feat.outlineProduces.replace('{value}', o));
  }
  return out;
}

function cssClassSet(cssText) {
  const set = new Set();
  const re = /\.(-?[_a-zA-Z][\w-]*)/g;
  let m;
  while ((m = re.exec(cssText))) set.add(m[1]);
  return set;
}

function main() {
  const args = process.argv.slice(2);
  const positional = [];
  const maps = [];
  for (let k = 0; k < args.length; k++) {
    if (args[k] === '--map') {
      const [label, p] = args[++k].split('=');
      maps.push({ label, path: p });
    } else positional.push(args[k]);
  }
  const [fixturePath, cssPath] = positional;
  if (!fixturePath || !cssPath) {
    console.error('usage: node capability.mjs <fixture.json> <main.css> [--map label=path ...]');
    process.exit(2);
  }

  const fixture = readJson(fixturePath);
  const features = fixture.features || {};
  const stateClasses = fixture.cssStateClasses || {};
  const block = fixture.block || `pa-${fixture.component}`;
  const blockModRe = new RegExp('^' + block.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '--');
  const css = cssClassSet(fs.readFileSync(cssPath, 'utf-8'));

  let hardFailures = 0;
  console.log(paint('bold', `\nCapability diff — ${fixture.component}\n`));

  // ── Axis 1: features ↔ CSS ───────────────────────────────────────────────
  console.log(paint('bold', '1. feature contract ↔ compiled CSS'));
  const claimed = new Set(Object.keys(stateClasses));
  for (const [name, feat] of Object.entries(features)) {
    if (name === '//') continue;
    for (const cls of producedClasses(name, feat)) {
      claimed.add(cls);
      if (!css.has(cls)) {
        console.log(`   ${paint('red', 'PHANTOM')} feature "${name}" produces .${cls} — not in main.css`);
        hardFailures++;
      }
    }
  }
  // reverse: every block modifier (${block}--*) in CSS must be claimed. Scoped
  // to BLOCK modifiers — element modifiers (${block}__x--y) are verified forward
  // (feature produces → exists) so specialized sub-features left out of a slice
  // don't read as unmapped.
  const blockModifiers = [...css].filter((c) => blockModRe.test(c)).sort();
  const unclaimed = blockModifiers.filter((c) => !claimed.has(c));
  if (unclaimed.length) {
    for (const c of unclaimed) {
      console.log(`   ${paint('red', 'UNMAPPED')} .${c} exists in CSS but no feature (or cssStateClasses) claims it`);
      hardFailures++;
    }
  } else {
    console.log(`   ${paint('green', 'ok')} all ${blockModifiers.length} ${block}--* CSS modifiers are claimed by a feature or a state class`);
  }

  // ── Axis 2: features ↔ each wrapper map ──────────────────────────────────
  for (const { label, path: mp } of maps) {
    console.log(paint('bold', `\n2. feature contract ↔ ${label} capability map`));
    const wmap = readJson(path.resolve(mp)).features || {};
    let issues = 0;
    for (const [name, feat] of Object.entries(features)) {
      if (name === '//') continue;
      const w = wmap[name];
      if (!w) {
        console.log(`   ${paint('red', 'MISSING')} ${label} declares no mapping for feature "${name}"`);
        hardFailures++; issues++;
        continue;
      }
      if (feat.kind === 'enum' && feat.options) {
        const have = new Set(w.values || []);
        const gaps = feat.options.filter((o) => !have.has(o));
        if (gaps.length) {
          console.log(`   ${paint('red', 'OPTIONS')} ${label} "${name}" is missing option(s): ${gaps.join(', ')}`);
          hardFailures++; issues++;
        }
      }
    }
    // reverse: wrapper declares a feature the oracle doesn't know
    for (const name of Object.keys(wmap)) {
      if (name === '//') continue;
      if (!features[name]) {
        console.log(`   ${paint('yellow', 'EXTRA')}   ${label} declares feature "${name}" not in the oracle contract`);
      }
    }
    if (!issues) console.log(`   ${paint('green', 'ok')} ${label} declares every feature + every enum option the oracle defines`);
  }

  // ── Axis 3: features ↔ scenarios (advisory) ──────────────────────────────
  console.log(paint('bold', '\n3. scenario coverage (advisory)'));
  const usedEnum = {};   // feature -> Set(options exercised)
  const usedBool = new Set();
  for (const s of fixture.scenarios) {
    for (const [k, v] of Object.entries(s.props)) {
      const feat = features[k];
      if (!feat) continue;
      if (feat.kind === 'enum') (usedEnum[k] ??= new Set()).add(String(v));
      else if (feat.kind === 'bool' && v) usedBool.add(k);
    }
    // outline-{variant} coverage: an outline scenario exercises outline for its variant
    if (s.props.outline && s.props.variant) {
      (usedEnum.__outlineVariant ??= new Set()).add(s.props.variant);
    }
  }
  let gaps = 0;
  for (const [name, feat] of Object.entries(features)) {
    if (name === '//') continue;
    if (feat.kind === 'enum' && feat.options) {
      const used = usedEnum[name] || new Set();
      const missing = feat.options.filter((o) => !used.has(o));
      if (missing.length) {
        console.log(`   ${paint('yellow', 'uncovered')} ${name}: ${missing.join(', ')}  ${paint('gray', `(${used.size}/${feat.options.length} exercised)`)}`);
        gaps++;
      }
    } else if (feat.kind === 'bool' && feat.produces && !usedBool.has(name)) {
      console.log(`   ${paint('yellow', 'uncovered')} ${name}  ${paint('gray', '(no scenario sets it)')}`);
      gaps++;
    }
  }
  // outline per-variant advisory
  if (features.outline?.appliesToVariants) {
    const used = usedEnum.__outlineVariant || new Set();
    const missing = features.outline.appliesToVariants.filter((v) => !used.has(v));
    if (missing.length) {
      console.log(`   ${paint('yellow', 'uncovered')} outline×variant: ${missing.join(', ')}  ${paint('gray', `(${used.size}/${features.outline.appliesToVariants.length} exercised)`)}`);
      gaps++;
    }
  }
  if (!gaps) console.log(`   ${paint('green', 'ok')} every feature option is exercised by at least one scenario`);

  console.log('\n' + paint(hardFailures === 0 ? 'green' : 'red',
    `${hardFailures} hard failure(s) (axes 1–2)`) + paint('gray', `, ${gaps} coverage gap(s) (axis 3)\n`));
  process.exit(hardFailures);
}

main();
