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

// Class tokens that literally appear in a scenario golden — i.e. markup that
// compare.mjs actually renders and diffs. An element class exercised by a golden
// is genuinely tested even if no feature declares it.
function goldenClassSet(scenarios) {
  const set = new Set();
  const re = /class\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  for (const s of scenarios || []) {
    const html = s.golden || '';
    let m;
    while ((m = re.exec(html))) {
      for (const t of (m[1] ?? m[2] ?? '').split(/\s+/)) if (t) set.add(t);
    }
  }
  return set;
}

// A `deferred` bucket (object keyed by class, or array of classes) names element
// classes a slice intentionally leaves to a future sub-slice — claimed, but
// reported separately so the deferral stays visible instead of silent.
function normalizeBucket(bucket) {
  if (!bucket) return new Set();
  if (Array.isArray(bucket)) return new Set(bucket);
  if (typeof bucket === 'object') return new Set(Object.keys(bucket).filter((k) => k !== '//'));
  return new Set();
}

// All concrete classes a fixture is responsible for: everything its features
// produce + its cssStateClasses. Used to VERIFY a fixture-backed deferral.
function allProducedClasses(fixture) {
  const out = new Set();
  for (const [name, feat] of Object.entries(fixture.features || {})) {
    if (name === '//') continue;
    for (const c of producedClasses(name, feat)) out.add(c);
  }
  for (const k of Object.keys(fixture.cssStateClasses || {})) if (k !== '//') out.add(k);
  return out;
}

// A deferral value may name the fixture that actually covers the class —
// `{ "fixture": "card-tab" }` or the string `"fixture:card-tab"`. Anything else
// (plain prose) is an *acknowledged* out-of-scope deferral, not verified.
function resolveDeferRef(val) {
  if (val && typeof val === 'object' && val.fixture) return val.fixture;
  if (typeof val === 'string' && val.startsWith('fixture:')) return val.slice('fixture:'.length);
  return null;
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
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // One component can span several blocks (a family: pa-loader-dots/-bars/…,
  // pa-list + pa-list-ordered, …). `blocks: [...]` lists them; `block` is the
  // single-block shorthand.
  const blocks =
    Array.isArray(fixture.blocks) && fixture.blocks.length
      ? fixture.blocks
      : [fixture.block || `pa-${fixture.component}`];
  const blockModRes = blocks.map((b) => new RegExp('^' + esc(b) + '--'));
  const blockElemRes = blocks.map((b) => new RegExp('^' + esc(b) + '__'));
  const matchesAny = (res, c) => res.some((re) => re.test(c));
  const deferred = normalizeBucket(fixture.deferred);
  // Element-level analogue of cssStateClasses: <block>__* elements that
  // pa-*.js BUILDS at runtime and are never in the SSR markup a wrapper emits
  // (e.g. stat fit-mode's __slot/__group/__meta). No feature can produce them
  // and no SSR golden can exercise them, so they'd read as blind spots — list
  // them here to mark them legitimately out of the strict-compare surface.
  const stateElements = normalizeBucket(fixture.cssStateElements);
  const goldenClasses = goldenClassSet(fixture.scenarios);
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
  // reverse (block modifiers): every <block>--* in CSS must be claimed by a
  // feature's `produces` or by `cssStateClasses`.
  const blockModifiers = [...css].filter((c) => matchesAny(blockModRes, c)).sort();
  const unclaimed = blockModifiers.filter((c) => !claimed.has(c));
  if (unclaimed.length) {
    for (const c of unclaimed) {
      console.log(`   ${paint('red', 'UNMAPPED')} .${c} exists in CSS but no feature (or cssStateClasses) claims it`);
      hardFailures++;
    }
  } else {
    console.log(`   ${paint('green', 'ok')} all ${blockModifiers.length} block-modifier class(es) (${blocks.join(', ')} --*) are claimed`);
  }

  // reverse (element classes): every <block>__* in CSS must be ACCOUNTED FOR —
  // by a feature's produces / cssStateClasses, by appearing in at least one
  // scenario golden (so compare.mjs actually exercises it), or by an explicit
  // `deferred` bucket (labelled, reported separately). Anything left is a real
  // blind spot: markup core ships that no scenario tests and no feature maps.
  const elementClasses = [...css].filter((c) => matchesAny(blockElemRes, c)).sort();
  const coveredElem = new Set([...claimed, ...goldenClasses, ...deferred, ...stateElements]);
  const deferredElem = elementClasses.filter((c) => deferred.has(c));
  const stateElem = elementClasses.filter((c) => stateElements.has(c) && !deferred.has(c));
  const uncoveredElem = elementClasses.filter((c) => !coveredElem.has(c));
  if (uncoveredElem.length) {
    for (const c of uncoveredElem) {
      console.log(`   ${paint('red', 'UNCOVERED')} .${c} exists in CSS but no feature claims it and no golden exercises it`);
      hardFailures++;
    }
  } else if (elementClasses.length) {
    console.log(`   ${paint('green', 'ok')} all ${elementClasses.length} element class(es) (${blocks.join(', ')} __*) are claimed or exercised by a golden`);
  }
  // A deferral that NAMES a covering fixture must actually be produced/rendered by
  // that fixture — otherwise `deferred` is just silencing a real gap. Prose
  // deferrals (no fixture ref) stay acknowledged/advisory.
  const deferredRaw =
    fixture.deferred && typeof fixture.deferred === 'object' && !Array.isArray(fixture.deferred)
      ? fixture.deferred
      : {};
  const verifiedDefer = new Set();
  for (const [cls, val] of Object.entries(deferredRaw)) {
    if (cls === '//') continue;
    const ref = resolveDeferRef(val);
    if (!ref) continue;
    const refPath = path.join(path.dirname(path.resolve(fixturePath)), `${ref}.json`);
    let refFix;
    try {
      refFix = readJson(refPath);
    } catch {
      console.log(`   ${paint('red', 'DEFER?')} .${cls} defers to fixture "${ref}" — can't read ${ref}.json`);
      hardFailures++;
      continue;
    }
    const refCovered = new Set([...goldenClassSet(refFix.scenarios), ...allProducedClasses(refFix)]);
    if (refCovered.has(cls)) verifiedDefer.add(cls);
    else {
      console.log(`   ${paint('red', 'DEFER?')} .${cls} defers to "${ref}" but that fixture neither produces nor renders it`);
      hardFailures++;
    }
  }
  if (verifiedDefer.size) {
    console.log(`   ${paint('green', 'ok')} ${verifiedDefer.size} deferral(s) verified against a fragment fixture`);
  }
  const ackElem = deferredElem.filter((c) => !verifiedDefer.has(c) && !resolveDeferRef(deferredRaw[c]));
  if (ackElem.length) {
    const shown = ackElem.slice(0, 6).join(', ');
    const more = ackElem.length > 6 ? ` …(+${ackElem.length - 6} more)` : '';
    console.log(`   ${paint('yellow', 'deferred')} ${ackElem.length} element class(es) acknowledged out-of-scope (unverified): ${shown}${more}`);
  }
  if (stateElem.length) {
    const shown = stateElem.slice(0, 6).join(', ');
    const more = stateElem.length > 6 ? ` …(+${stateElem.length - 6} more)` : '';
    console.log(`   ${paint('cyan', 'runtime')}  ${stateElem.length} element class(es) built by JS at runtime, not in SSR markup (cssStateElements): ${shown}${more}`);
  }

  // vacuous-scope guard: block(s) matching NOTHING in CSS — no modifier, no
  // element, AND no base class — mean the fixture's block name is wrong or it's a
  // multi-block family that needs `blocks: [...]`. A fragment whose base class
  // exists but has no modifiers/sub-elements (e.g. pa-list__item, whose parts are
  // flat siblings pa-list__content/…) is fine — its leaf classes are claimed by
  // features' `produces` and exercised by goldens. (Inline <code> is the one legit
  // genuinely class-less case.)
  const anyBaseClass = blocks.some((b) => css.has(b));
  if (!blockModifiers.length && !elementClasses.length && !anyBaseClass) {
    console.log(`   ${paint('yellow', 'note')} block(s) ${blocks.join(', ')} matched 0 modifier + 0 element + 0 base class in main.css — verify the block name, or use "blocks": [...] for a family (ignore if the component is intentionally class-less, e.g. inline <code>)`);
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
