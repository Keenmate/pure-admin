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
//   - phx-* / data-phx* attrs     — LiveView wiring, invisible to CSS. These
//                                    are WRAPPER-WIDE (every keen component),
//                                    so they live in the always-on defaults.
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
//
// TWO LAYERS OF IGNORE RULES:
//   1. WRAPPER-WIDE defaults (below) — wiring every component of a wrapper
//      emits: phx-* / data-phx* (LiveView), the boolean-attr canonicalization.
//      Always applied.
//   2. PER-COMPONENT trims — a fixture may declare a `normalize` block to drop
//      wiring that is specific to ONE component, so it is not blinded globally.
//      Shape (passed to normalize() as opts, merged onto the defaults):
//        "normalize": {
//          "ignoreAttrs":      ["data-tab-target"],   // extra attr names to drop
//          "ignoreIdPrefixes": ["tab-btn-"]           // drop id="<prefix>…" values
//        }
//      Example: keen's tab_item emits id="tab-btn-{target}" + data-tab-target
//      purely as switch_tab's DOM handles (the id/data siblings of phx-click) —
//      the core oracle blesses bare class-only buttons, so tabs-composed.json
//      scopes those trims to itself rather than polluting the global defaults
//      (a different component legitimately using that id prefix stays checked).

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// WRAPPER-WIDE defaults — framework wiring every component emits, never CSS
// contract. Always applied. Per-component extras come from the fixture's
// `normalize` block (see header), merged on at normalize()-call time.
const IGNORE_ATTR_PREFIXES = ['phx-', 'data-phx'];
const DEFAULT_IGNORE_ATTRS = new Set(['data-phx-id', 'data-phx-component']);

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

function isIgnoredAttr(name, ctx) {
  if (ctx.ignoreAttrs.has(name)) return true;
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

function serializeAttrs(attrs, ctx) {
  const names = Object.keys(attrs)
    .filter((name) => !isIgnoredAttr(name, ctx))
    .sort();
  const parts = [];
  for (const name of names) {
    if (BOOLEAN_ATTRS.has(name)) {
      parts.push(name); // presence only
      continue;
    }
    let { value } = attrs[name];
    if (name === 'id' && ctx.ignoreIdPrefixes.some((p) => value.startsWith(p))) {
      continue; // per-component switching handle (e.g. keen tab-btn-*), not a contract id
    }
    if (name === 'class') {
      value = value.split(/\s+/).filter(Boolean).sort().join(' ');
      if (value === '') continue; // empty class = no class
    }
    parts.push(`${name}="${value}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

function serializeNode(node, ctx) {
  if (node.type === 'text') {
    return collapseText(node.value);
  }
  const open = `<${node.name}${serializeAttrs(node.attrs, ctx)}>`;
  if (VOID_ELEMENTS.has(node.name)) return open;
  const inner = node.children.map((c) => serializeNode(c, ctx)).join('');
  return `${open}${inner}</${node.name}>`;
}

// Build the ignore context for a normalize() call: the always-on wrapper-wide
// defaults, plus any per-component trims the fixture declared (see header).
function buildCtx(opts = {}) {
  return {
    ignoreAttrs: new Set([...DEFAULT_IGNORE_ATTRS, ...(opts.ignoreAttrs || [])]),
    ignoreIdPrefixes: opts.ignoreIdPrefixes || []
  };
}

/**
 * Normalize an HTML fragment to its canonical form for structural comparison.
 * @param {string} html
 * @param {{ignoreAttrs?: string[], ignoreIdPrefixes?: string[]}} [opts]
 *        Per-component trims merged onto the wrapper-wide defaults (see header).
 * @returns {string}
 */
export function normalize(html, opts) {
  const ctx = buildCtx(opts);
  const root = buildTree(tokenize(html ?? ''));
  return root.children.map((n) => serializeNode(n, ctx)).join('');
}

/**
 * A readable, token-per-line form of the normalized markup — used to produce a
 * human diff when two fragments disagree.
 * @param {string} html
 * @param {{ignoreAttrs?: string[], ignoreIdPrefixes?: string[]}} [opts]
 * @returns {string[]}
 */
export function normalizeLines(html, opts) {
  // Break the canonical string at tag boundaries so a diff points at the
  // offending element instead of one giant line.
  return normalize(html, opts)
    .replace(/></g, '>\n<')
    .split('\n');
}
