// Dependency-free HTML-fragment normalizer for the markup-fidelity harness.
//
// Turns an HTML fragment into a canonical string so that two renderers which
// emit the *same DOM* but differ in framework noise / attribute order /
// whitespace normalize to byte-identical output. Comparison is then plain
// string equality, and any real difference (a missing element, a phantom
// class, wrong nesting) survives.
//
// What is treated as NOISE (dropped / canonicalized), and why:
//   - HTML comments               — Svelte 5 SSR injects <!--[--> / <!--]-->
//                                    / <!----> block anchors; LiveView injects
//                                    its own. Never part of the contract.
//   - phx-* / data-phx* attrs     — LiveView wiring, invisible to CSS.
//   - id / for auto-hooks         — generated ids (phash2, unique_integer)
//     when they match a noise      differ per render; only stripped when they
//     pattern (see IGNORE_ATTRS).  look generated, not when hand-set.
//   - attribute order             — sorted alphabetically.
//   - class-token order           — sorted; CSS is order-independent.
//   - whitespace                  — runs collapsed to a single space, text
//                                    nodes trimmed, whitespace-only text
//                                    nodes (inter-element) dropped.
//   - boolean attrs               — disabled="" ≡ disabled ≡ disabled="true"
//                                    (rendered as bare name).
//
// What is treated as SIGNAL (kept): tag names, element nesting/order, class
// tokens, all other attributes (type, title, href, data-*, aria-*, role…),
// and text content.

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// Attributes dropped unconditionally (framework wiring, never CSS contract).
const IGNORE_ATTR_PREFIXES = ['phx-', 'data-phx'];
const IGNORE_ATTRS = new Set(['data-phx-id', 'data-phx-component']);

// Boolean attributes: presence is all that matters; value is canonicalized to
// bare-name output. (disabled / disabled="" / disabled="disabled" / true → same.)
const BOOLEAN_ATTRS = new Set([
  'disabled', 'checked', 'selected', 'readonly', 'required', 'multiple',
  'hidden', 'open', 'autofocus',
  // Framework presence-flag attributes: their VALUE is irrelevant — the JS hook
  // only tests for the attribute's existence. Different wrappers serialize the
  // boolean differently (`data-ripple="true"` vs `data-ripple=""`); both mean
  // "ripple on". Normalize to bare so presence, not spelling, is compared.
  'data-ripple'
]);

function isIgnoredAttr(name) {
  if (IGNORE_ATTRS.has(name)) return true;
  return IGNORE_ATTR_PREFIXES.some((p) => name.startsWith(p));
}

// ── tokenizer ────────────────────────────────────────────────────────────
function tokenize(html) {
  const tokens = [];
  let i = 0;
  const n = html.length;
  while (i < n) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      i = end === -1 ? n : end + 3;
      continue; // drop comments
    }
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) {
        tokens.push({ type: 'text', value: html.slice(i) });
        break;
      }
      let raw = html.slice(i + 1, end);
      i = end + 1;
      if (raw[0] === '/') {
        tokens.push({ type: 'close', name: raw.slice(1).trim().toLowerCase() });
      } else if (raw[0] === '!') {
        continue; // doctype / declarations — irrelevant to fragments
      } else {
        let selfClose = false;
        if (raw.endsWith('/')) {
          selfClose = true;
          raw = raw.slice(0, -1);
        }
        tokens.push({ type: 'open', selfClose, ...parseTag(raw) });
      }
    } else {
      const next = html.indexOf('<', i);
      const stop = next === -1 ? n : next;
      tokens.push({ type: 'text', value: html.slice(i, stop) });
      i = stop;
    }
  }
  return tokens;
}

function parseTag(raw) {
  raw = raw.trim();
  const nameMatch = /^([a-zA-Z][a-zA-Z0-9:-]*)/.exec(raw);
  if (!nameMatch) return { name: raw.toLowerCase(), attrs: {} };
  const name = nameMatch[1].toLowerCase();
  let j = nameMatch[0].length;
  const attrs = {};
  while (j < raw.length) {
    while (j < raw.length && /\s/.test(raw[j])) j++;
    if (j >= raw.length) break;
    const am = /^([^\s=/>]+)/.exec(raw.slice(j));
    if (!am) {
      j++;
      continue;
    }
    const attrName = am[1].toLowerCase();
    j += am[0].length;
    while (j < raw.length && /\s/.test(raw[j])) j++;
    let value = '';
    let hadValue = false;
    if (raw[j] === '=') {
      hadValue = true;
      j++;
      while (j < raw.length && /\s/.test(raw[j])) j++;
      const q = raw[j];
      if (q === '"' || q === "'") {
        j++;
        const endq = raw.indexOf(q, j);
        value = raw.slice(j, endq === -1 ? raw.length : endq);
        j = endq === -1 ? raw.length : endq + 1;
      } else {
        const vm = /^[^\s>]+/.exec(raw.slice(j));
        value = vm ? vm[0] : '';
        j += vm ? vm[0].length : 0;
      }
    }
    attrs[attrName] = { value, hadValue };
  }
  return { name, attrs };
}

// ── tree builder ─────────────────────────────────────────────────────────
function buildTree(tokens) {
  const root = { name: '#root', children: [] };
  const stack = [root];
  for (const t of tokens) {
    const top = stack[stack.length - 1];
    if (t.type === 'text') {
      top.children.push({ type: 'text', value: t.value });
    } else if (t.type === 'open') {
      const node = { type: 'element', name: t.name, attrs: t.attrs, children: [] };
      top.children.push(node);
      if (!t.selfClose && !VOID_ELEMENTS.has(t.name)) stack.push(node);
    } else if (t.type === 'close') {
      // pop to the nearest matching open tag (tolerant of mismatches)
      for (let k = stack.length - 1; k >= 1; k--) {
        if (stack[k].name === t.name) {
          stack.length = k;
          break;
        }
      }
    }
  }
  return root;
}

// ── serializer ───────────────────────────────────────────────────────────
function collapseText(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function serializeAttrs(attrs) {
  const names = Object.keys(attrs)
    .filter((name) => !isIgnoredAttr(name))
    .sort();
  const parts = [];
  for (const name of names) {
    if (BOOLEAN_ATTRS.has(name)) {
      parts.push(name); // presence only
      continue;
    }
    let { value } = attrs[name];
    if (name === 'class') {
      value = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (value === '') continue; // empty class = no class
    }
    parts.push(`${name}="${value}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

function serializeNode(node) {
  if (node.type === 'text') {
    return collapseText(node.value);
  }
  const open = `<${node.name}${serializeAttrs(node.attrs)}>`;
  if (VOID_ELEMENTS.has(node.name)) return open;
  const inner = node.children.map(serializeNode).join('');
  return `${open}${inner}</${node.name}>`;
}

/**
 * Normalize an HTML fragment to its canonical form for structural comparison.
 * @param {string} html
 * @returns {string}
 */
export function normalize(html) {
  const root = buildTree(tokenize(html ?? ''));
  return root.children.map(serializeNode).join('');
}

/**
 * A readable, token-per-line form of the normalized markup — used to produce a
 * human diff when two fragments disagree.
 * @param {string} html
 * @returns {string[]}
 */
export function normalizeLines(html) {
  // Break the canonical string at tag boundaries so a diff points at the
  // offending element instead of one giant line.
  return normalize(html)
    .replace(/></g, '>\n<')
    .split('\n');
}
