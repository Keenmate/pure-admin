#!/usr/bin/env node
/**
 * Naming parity — do the two wrappers call the same feature by the same name?
 *
 * The markup checks (compare.mjs / capability.mjs) are name-agnostic by design:
 * each wrapper maps a NEUTRAL feature to its own prop, and only the rendered DOM
 * is compared. So keen `:tools` and svelte `headerActions` both pass while the
 * public APIs diverge. This check closes that gap: for every feature both
 * wrappers map, keen's prop (snake_case) must equal svelte's (camelCase) after
 * case conversion — modulo the framework idioms below. Conventions: NAMING.md.
 *
 * Usage:  node fidelity/naming.mjs [--keen <dir>] [--svelte <dir>] [component…]
 *   defaults: ../../../keen-pure-admin/fidelity, ../../../svelte-pure-admin/scripts/fidelity
 * Exit code = number of mismatches.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : dflt; };
const keenDir = opt('--keen', path.resolve(here, '../../../../keen-pure-admin/fidelity'));
const svelteDir = opt('--svelte', path.resolve(here, '../../../../svelte-pure-admin/scripts/fidelity'));
const only = new Set(args);

const paint = (c, s) => (process.stdout.isTTY ? `\x1b[${{ red: 31, green: 32, yellow: 33, gray: 90, bold: 1 }[c]}m${s}\x1b[0m` : s);
const camel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * Per-component authoring idioms (NAMING.md "Accepted idioms"): the same DOM,
 * authored the way each framework does it naturally — keen named slots vs
 * svelte child components / data arrays / an explicit mode flag.
 */
const COMPONENT_IDIOMS = {
  splitter: [['pane', 'children']],          // keen <:pane> slots vs <SplitterPane> children
  'range-group': [['row', 'rows']],          // keen <:row> slots vs svelte rows[] data array
  'kpi-terminal': [['pane_demo', 'hasTabs']], // keen tabs on when <:pane> slots exist vs svelte hasTabs (SSR must know up front)
};

/**
 * Framework idioms — the SAME concept spelled the way each framework requires.
 * Returns true when keen `k` and svelte `s` are an accepted idiom pair.
 */
function idiom(k, s, component) {
  if (COMPONENT_IDIOMS[component]?.some(([ki, si]) => ki === k && si === s)) return true;
  if (k === 'inner_block' && s === 'children') return true;            // default slot
  if (k.endsWith('_') && camel(k.slice(0, -1)) === s) return true;     // Elixir reserved word (end_, footer_)
  if (/^on_/.test(k) && s === 'on' + k.slice(3).replace(/_/g, '')) return true; // event: keen phx event name, svelte lowercase callback
  return false;
}

function readMap(dir, file) {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')).features || {};
}

let mismatches = 0, compared = 0;
const files = fs.readdirSync(keenDir).filter((f) => f.endsWith('.map.json')).sort();
for (const file of files) {
  const component = file.replace(/\.map\.json$/, '');
  if (only.size && !only.has(component)) continue;
  const keen = readMap(keenDir, file);
  const svelte = readMap(svelteDir, file);
  if (!keen || !svelte) continue;
  const rows = [];
  for (const [feature, k] of Object.entries(keen)) {
    if (feature === '//' || !svelte[feature]) continue;
    const kp = k.prop, sp = svelte[feature].prop;
    if (typeof kp !== 'string' || typeof sp !== 'string') continue;
    compared++;
    if (camel(kp) === sp || idiom(kp, sp, component)) continue;
    rows.push(`   ${paint('red', 'NAME')} ${feature.padEnd(24)} keen ${paint('bold', kp)}  ≠  svelte ${paint('bold', sp)}  ${paint('gray', `(expected svelte ${camel(kp)} or keen ${sp.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())})`)}`);
  }
  if (rows.length) {
    console.log(paint('red', `✗ ${component}`) + paint('gray', ` — ${rows.length} name mismatch(es)`));
    console.log(rows.join('\n'));
    mismatches += rows.length;
  }
}
console.log('\n' + (mismatches === 0
  ? paint('green', `${compared} shared features — keen and svelte use the same names`)
  : paint('red', `${mismatches} name mismatch(es)`) + paint('gray', ` across ${compared} shared features (see fidelity/NAMING.md)`)));
process.exit(mismatches);
