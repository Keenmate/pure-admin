// Ad-hoc audit: how many pa-* BEM classes does the catalog generator MISS
// because it never resolves SCSS `&__` / `&--` parent nesting?
//
// Strategy: brace-aware scan of each component SCSS partial, maintaining a stack
// of RESOLVED selector lists. `&` resolves against the parent. Collect every
// resolved `.pa-*` class. Compare to (a) the generator's literal-only regex and
// (b) components.json.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCSS = join(ROOT, 'packages/core/src/scss');
const CATALOG = join(ROOT, 'packages/core/components.json');

const CLASS_RE =
  /\.(pa-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)/g;

function walk(dir, filter, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, filter, out);
    else if (filter(p)) out.push(p);
  }
  return out;
}

const files = [
  ...walk(join(SCSS, 'core-components'), (p) => p.endsWith('.scss')),
  join(SCSS, 'utilities.scss'),
];

// Strip comments so `.pa-x` mentioned in prose doesn't count as a selector.
function stripComments(t) {
  return t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}

// Resolve a child selector token against a list of parent selectors.
// Child "&__x" with parent ".pa-a, .pa-b" -> [".pa-a__x", ".pa-b__x"].
// Child without "&" -> itself (new context), parent ignored for descendant.
function resolve(child, parents) {
  if (!parents.length) parents = [''];
  const out = [];
  for (const p of parents) {
    if (child.includes('&')) out.push(child.replaceAll('&', p));
    else out.push(child); // nested descendant/new block — keep as-is
  }
  return out;
}

// Brace-aware walk → every resolved selector string that appears before a `{`.
function resolvedSelectors(text) {
  text = stripComments(text);
  const stack = [['']]; // stack of parent selector-lists
  const all = [];
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '{') {
      const sel = buf.trim();
      buf = '';
      if (sel.startsWith('@')) { stack.push(stack[stack.length - 1]); continue; } // at-rule: keep parent
      const parents = stack[stack.length - 1];
      // selector list can be comma-separated; resolve each part
      const parts = sel.split(',').map((s) => s.trim()).filter(Boolean);
      const resolved = [];
      for (const part of parts) resolved.push(...resolve(part, parents));
      all.push(...resolved);
      stack.push(resolved);
    } else if (c === '}') {
      buf = '';
      if (stack.length > 1) stack.pop();
    } else if (c === ';') {
      buf = ''; // declaration — discard
    } else {
      buf += c;
    }
  }
  return all;
}

function classesFrom(strings) {
  const set = new Set();
  for (const s of strings) {
    for (const m of s.matchAll(CLASS_RE)) set.add(m[1]);
  }
  return set;
}

// Catalog's known classes. components.json stores class names WITHOUT a leading
// dot, so match bare pa-* tokens (not the dot-prefixed selector form).
const catalogText = readFileSync(CATALOG, 'utf8');
const BARE_RE = /\b(pa-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)\b/g;
const catalogClasses = new Set();
for (const m of catalogText.matchAll(BARE_RE)) catalogClasses.add(m[1]);

let totalResolved = new Set();
let totalLiteral = new Set();
const perFileMissing = [];

for (const f of files) {
  const rel = relative(SCSS, f).replaceAll('\\', '/');
  const raw = readFileSync(f, 'utf8');
  const resolved = classesFrom(resolvedSelectors(raw));
  const literal = classesFrom([stripComments(raw)]);
  resolved.forEach((c) => totalResolved.add(c));
  literal.forEach((c) => totalLiteral.add(c));
  const missing = [...resolved].filter((c) => !literal.has(c)).sort();
  if (missing.length) perFileMissing.push({ rel, missing });
}

const missingVsLiteral = [...totalResolved].filter((c) => !totalLiteral.has(c)).sort();
const missingVsCatalog = [...totalResolved].filter((c) => !catalogClasses.has(c)).sort();

console.log('=== SUMMARY ===');
console.log('Resolved pa-* classes (with & nesting):', totalResolved.size);
console.log('Literal-only pa-* classes (generator sees):', totalLiteral.size);
console.log('MISSING from literal scan (the & gap):', missingVsLiteral.length);
console.log('MISSING from components.json:', missingVsCatalog.length);
console.log('\n=== MISSING FROM components.json (resolved-but-uncatalogued) ===');
console.log(missingVsCatalog.join('\n'));
console.log('\n=== BY FILE (resolved-but-not-literal) ===');
for (const { rel, missing } of perFileMissing) {
  console.log(`\n${rel} (${missing.length}):`);
  console.log('  ' + missing.join('\n  '));
}
