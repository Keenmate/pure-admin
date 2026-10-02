# Markup-fidelity harness

A cheap, browser-free way to prove that the wrapper libraries
(**svelte-pure-admin**, **keen-pure-admin**) emit the **same DOM** core blesses —
without booting dev servers or Playwright.

Core is the **oracle**: it owns, per component, a set of neutral scenarios + the
golden markup for each, plus a feature→class contract. Every wrapper ships a
declarative **capability map** (neutral feature → its own prop). Two checks run
off that shared contract:

- **Correctness** (`compare.mjs`) — render each scenario, diff against the golden
  after normalizing away framework noise. *Does the wrapper emit what core blesses?*
- **Completeness** (`capability.mjs`) — diff the feature contract against the CSS,
  each wrapper's map, and the scenario set. *Is any feature/option unmapped?*

```
                 fidelity/fixtures/<component>.json   ← core: features + scenarios + goldens
                                  │
        ┌─────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
   dumpers (per wrapper, map-driven)                    capability.mjs (core)
   svelte:  node scripts/fidelity/dump.mjs <c>          reads <component>.json
   keen:    mix pa.fidelity.dump <c>                    + each wrapper's <c>.map.json
        │  each reads its own <c>.map.json              + dist/css/main.css
        ▼                                                       │
   svelte-<c>.dump.json / keen-<c>.dump.json                    ▼
        └───────────────► compare.mjs (core) ────►      3 axes, exit=#gaps
              normalize + diff vs golden, exit=#failures
```

## What it checks — and what it doesn't

**Signal (compared):** tag names, element nesting/order, class tokens, all
non-framework attributes (`type`, `title`, `href`, `data-*`, `aria-*`, `role`…),
and text content.

**Noise (normalized away):** HTML comments (Svelte SSR block anchors, LiveView
markers), `phx-*` / `data-phx*` attributes, attribute order, class-token order,
whitespace, and boolean/presence-attr spelling (`disabled` ≡ `disabled=""` ≡
`disabled="true"`; `data-ripple` likewise). See `lib/normalize.mjs`.

**Boundaries (out of scope):**
- **Structural markup only, not computed CSS.** Whether a class actually lays
  out correctly is core's job (tested once), not per-wrapper. This catches
  phantom classes, missing/extra elements, wrong nesting, drift.
- **Pre-JS-hook only.** SSR render can't see DOM that client JS builds
  (toast/flash chips, overflow toolbar, split-button menus). Those stay manual
  or need their own JS-render fixtures.
- **API-name divergence.** Two wrappers can emit identical markup from
  differently-named props — the render diff is name-agnostic. The maps make the
  names reviewable, but agreeing on prop vocabulary is a separate concern.

## The fixture (contract)

`fixtures/<component>.json` carries:

- **`block`** — the component's base class (`pa-btn`, `pa-card`) for the CSS check.
  For a **family** that spans several blocks (`pa-loader-dots`/`-bars`/…,
  `pa-list` + `pa-list-ordered`, …) use **`blocks: [...]`** instead — the CSS check
  then scopes to every listed block. (A single `block` whose name matches *nothing*
  in the CSS triggers a "vacuous scope" note — the tell that the block is wrong or
  is really a family. The one legit class-less case is inline `<code>`.)
- **`features`** — the oracle's feature→class contract, authored from
  `dist/css/main.css` (NOT `components.json` — its static extraction misses every
  SCSS-`@each`-generated variant). Each feature declares `kind`
  (enum/bool/string/slot), its `options`, and a `produces` class template
  (`pa-btn--{value}`, `null` for structural/native).
- **`scenarios`** — neutral prop bags + the `golden` markup. Attribute + class
  order and whitespace are normalized, so goldens are written for readability.
- **`deferred`** *(optional)* — element classes a slice intentionally leaves to a
  later sub-slice. Two forms: a **fixture ref** (`{ "fixture": "card-tab" }` or
  `"fixture:card-tab"`) is *verified* — the named fixture must actually produce or
  render the class, else `DEFER?` hard-fails; **plain prose** is an *acknowledged*
  out-of-scope note (e.g. `pa-badge__remove`, owned by command-palette, not the
  badge component; `pa-progress__label`, the composed group shape the wrappers
  still diverge on). Reported `deferred` (visible, advisory) instead of failing.
- **`cssStateClasses`** *(optional)* — block modifiers (`<block>--*`) that
  `pa-*.js` TOGGLES at runtime (never hand-authored), so no feature produces them.
  Counted as claimed by the block-modifier reverse check.
- **`cssStateElements`** *(optional)* — the element-level analogue: `<block>__*`
  elements `pa-*.js` BUILDS at runtime and that never appear in the SSR markup a
  wrapper emits (e.g. stat fit-mode's `__slot`/`__group`/`__meta`). No feature can
  produce them and no SSR golden can exercise them, so they'd read as blind spots —
  listed here they're reported as `runtime` (out of the strict-compare surface).

**The CSS check has two reverse directions.** Block modifiers (`<block>--*`) must be
claimed by a feature's `produces` or `cssStateClasses`. Element classes (`<block>__*`)
must be *accounted for* — claimed by a feature, **exercised by at least one scenario
golden** (so `compare.mjs` actually renders it), listed in `deferred`, or listed in
`cssStateElements` (JS-built, runtime-only). An element class core ships that none of
those account for is an `UNCOVERED` blind spot (hard failure) — this is what catches a
fixture that silently skips a whole sub-feature (card's inline-tabs, …).

## The capability map (per wrapper)

`<component>.map.json` in each wrapper — a declarative manifest keyed by the same
neutral feature names, each giving that wrapper's `prop`, `kind`, and (for enums)
its real `values`. Kinds: `enum` / `string` / `bool` (opt `negate`) / `slot` /
`const` (fixed value from a flag — e.g. keen's stat card is `variant="stat"`),
plus `channel:"rest"` for keen globals. **The dumper drives off this map**, so a
wrong prop name breaks rendering — the map can't lie silently.

## Running

```bash
# 1. Each wrapper produces a dump (in its own repo / toolchain):
#    svelte:  node scripts/fidelity/dump.mjs card   → svelte-card.dump.json
#    keen:    mix pa.fidelity.dump card             → fidelity/keen-card.dump.json

# 2. Core — correctness (diff dumps vs goldens):
node fidelity/compare.mjs fixtures/card.json \
  ../../../svelte-pure-admin/scripts/fidelity/svelte-card.dump.json --label svelte

# 3. Core — completeness (contract vs CSS + both maps + scenarios):
node fidelity/capability.mjs fixtures/card.json dist/css/main.css \
  --map svelte=../../../svelte-pure-admin/scripts/fidelity/card.map.json \
  --map keen=../../../keen-pure-admin/fidelity/card.map.json
```

Both tools exit non-zero on failure (0 = aligned), so they drop into CI. A
`*.dump.json` is `[{ "name": "<scenario>", "html": "<fragment>" }]` — a
regenerable artifact (gitignored in the wrappers).

### Core CI gate

`compare.mjs` needs a wrapper's dump, so correctness runs in the svelte/keen
repos' own CI. The **completeness** half needs only the fixtures + the compiled
CSS, so it runs in core:

```bash
npm run fidelity -w @keenmate/pure-admin-core   # fidelity/check-all.mjs
```

`check-all.mjs` sweeps every fixture through `capability.mjs` axis-1 (feature
contract ↔ `dist/css/main.css`) + axis-3, failing if core drifts its CSS out from
under the oracle contract (phantom class, unmapped modifier, uncovered element).
Wired as `.github/workflows/fidelity.yml` on push/PR touching `src/scss/**` or
`fidelity/**`.

### Consuming the oracle from the published package

`fidelity/` ships in the npm package (`files` + the `./fidelity/*` export), so a
wrapper can run the harness against the installed core instead of a sibling
checkout:

```bash
node node_modules/@keenmate/pure-admin-core/fidelity/compare.mjs \
  node_modules/@keenmate/pure-admin-core/fidelity/fixtures/card.json \
  scripts/fidelity/svelte-card.dump.json --label svelte
```

## Adding a component

1. **Fixture** — write `fixtures/<component>.json`: set `block`, author
   `features` from `dist/css/main.css` (`grep -oE '\.pa-<block>(--|__)[a-z0-9-]+'`),
   and write scenarios + goldens from the snippet + SCSS.
2. **Maps** — add `<component>.map.json` in each wrapper (neutral feature → its
   prop/kind/values). Register the component in each dumper (svelte `REGISTRY`,
   keen `render/2` + `meta/1` clauses).
3. **Run** all three commands. Fix the wrapper (not the golden) unless the golden
   is wrong; `capability.mjs` flags any feature/option a wrapper is missing.

The normalizer (`lib/normalize.mjs`) is dependency-free and shared — no HTML
parser dep added to the published package. The svelte dumper renders via vite's
SSR loader so any component compiles as the app builds it (TS, relative imports).
