# Pure Admin - npm Workspace

## Project Overview

Pure Admin is a lightweight, data-focused HTML/CSS admin framework similar to AdminLTE but more compact. Built with PureCSS foundation, SASS preprocessing, and a comprehensive component system.

Themes live in a **separate repository** at `../pure-admin-themes`, which
depends on `@keenmate/pure-admin-core` via `file:` link. See that repo's
CLAUDE.md for theme-specific guidance.

---

## Component System

Component partials live in `packages/core/src/scss/core-components/` and are
imported in `_core.scss`. Authoritative list: `ls packages/core/src/scss/core-components/`.

### Component Catalog (the pa-* inventory)

`packages/core/COMPONENTS.md` + `packages/core/components.json` are the
**authoritative, generated catalog** of every `pa-*` component: 67 components
across 9 categories, covering all ~170 blocks / ~655 class selectors. Each entry
lists the block, elements, modifiers, defining SCSS partial, and dedicated
snippet + demo. `components.json` is the machine-readable form (shipped in the
npm package) that the **svelte-pure-admin** and **keen-pure-admin** wrappers
validate their generated DOM against, and that drives snippet-coverage sweeps.

Regenerate after adding/removing any `pa-*` class:

```bash
npm run catalog -w @keenmate/pure-admin-core
```

The generator (`packages/core/scripts/build-components-catalog.mjs`) extracts
`.pa-*` selectors from the SCSS, groups them via a hand-authored block→component
taxonomy, and **fails if any discovered block is unassigned** — so the catalog
can't silently drift as new components land. Taxonomy grouping, descriptions,
and shared-file snippet/demo overrides (e.g. navbar/sidebar → `layout.html`) are
maintained inside that script. It also reports snippet gaps (currently 12
components documented only in demo mustaches, not in `snippets/`).

### HTML Snippets
Clean HTML patterns under `packages/core/snippets/` (~35 files). One file per
component category. Use them as the reference shape when generating markup
for a component.

---

## Architecture Principles

### BEM Naming Convention
**Pattern:** `pa-[block]__[element]--[modifier]`

```html
<button class="pa-btn pa-btn--primary pa-btn--lg">
  <span class="pa-btn__icon">🔍</span>
  Search
</button>
```

### One canonical markup structure per component (rigidity over flexibility)

Pure Admin is consumed by wrapper libraries — notably **svelte-pure-admin**,
whose components generate markup from props (`<Card title icon description>`).
A code generator can only emit ONE DOM tree per component. So when the CSS
accepts **two valid shapes for the same thing**, every consumer pays: the
wrapper must branch its template on which shape to emit, and hand-authored
markup drifts between the shapes with no single example to copy. Here **a
rigid, predictable structure beats a flexible one** — the opposite of the
usual "be liberal in what you accept" instinct.

Rule of thumb: **one blessed structure per slot — documented, and shown in the
snippet.** Older / shorthand forms may keep *rendering* as legacy tolerance,
but they are not a second documented option. Never present two ways to do the
same thing.

**Worked example — the card header (v2.9.0-rc05).** It used to bless two title
shapes: a bare `<h3>` (no icon) OR `.pa-card__title` + `.pa-card__title-icon`
+ `.pa-card__title-text` (with icon). That forced `<Card>` to branch on whether
an icon was passed — and because the two shapes even rendered at *different
weights* (bare `<h3>` = browser-bold 700 vs `.pa-card__title-text` = semibold
600), the demo was a visibly inconsistent mix. The fix made `.pa-card__title`
the single title contract for every card (icon optional inside
`.pa-card__title-icon`), promoted the description to a real
`.pa-card__description` element, and made `.pa-card__actions` the one actions
slot in **both** header and footer. Now a wrapper emits one tree with only the
icon `<span>` conditional. Bare `<h3>` / bare `<p>` / bare footer buttons still
render, but are legacy tolerance — not the documented shape.

### Two-layer token system: SCSS variables + `--pa-*` / `--base-*` CSS variables

Pure Admin uses **both** SCSS variables and CSS custom properties on purpose.
They serve different roles and components mix them freely:

- **SCSS variables (`$badge-padding-h`, `$font-size-xs`, etc.)** — compile-time
  tokens for structural and non-themeable values. Themes override via
  `!default` before `@import`-ing the framework.
- **CSS variables (`--pa-*` framework, `--base-*` web-component bridge)** —
  runtime theming surface. Components consume via `var(--pa-X)`. Themes emit
  values via `output-pa-css-variables` / `output-base-css-variables` mixins at
  `:root`. Enables runtime light/dark mode switching, data-driven colours
  (sparkline trend tints set inline by JS), and web-component theming
  (`<ms-multiselect>` etc. read `--base-*` from shadow DOM).

```scss
// In a component — both layers coexist
.pa-badge {
  padding: $badge-padding-v $badge-padding-h;        // SCSS — structural
  font-size: $font-size-xs;                          // SCSS — structural
  background-color: var(--pa-badge-success-bg);      // CSS var — themable at runtime
}
```

### Architectural split: `main.scss` vs `_core.scss`

- **`_core.scss`** — `@use`s every component partial. Consumed by both
  `main.scss` (the unthemed bundle) and themes (via legacy `@import`).
  Does NOT emit any `:root` block on its own — purely component CSS.
- **`main.scss`** — entry that compiles to `dist/css/main.css`. Calls the
  three emit mixins at `:root` so the unthemed bundle ships a complete set
  of neutral defaults. Consumers using `@keenmate/pure-admin-core/css`
  standalone get a working cascade; pages waiting for a theme link get
  reasonable FOUC values.
- **Themes** — written against the legacy `@import` flow:
  `@import core` + `@import base-css-variables` + their own `:root` block
  that re-emits the mixins with theme-overridden values.

Never move the `:root` emit into `_core.scss` — it would duplicate the whole
block in every theme build. Full rationale/history: `packages/core/CLAUDE.md`.

### Theme file pattern (actual current syntax)

```scss
// theme.scss — e.g. ../pure-admin-themes/corporate/src/scss/corporate.scss

// 1. Override $base-* SCSS variables (single source of truth)
$base-primary-color: #0ea5e9;
$base-success-color: #10b981;
// ... other $base-* overrides

// 2. Import variables/index — !default flags skip already-set values
@import '@keenmate/pure-admin-core/src/scss/variables/index';

// 3. (Optional) override derived $* variables for layout-specific tuning
$main-bg: #f4f6f9;
$header-bg: #1e293b;
// ...

// 4. Import core (components) + utilities + base-css-variables (mixins)
@import '@keenmate/pure-admin-core/src/scss/core';
@import '@keenmate/pure-admin-core/src/scss/utilities';
@import '@keenmate/pure-admin-core/src/scss/base-css-variables';

// 5. Emit CSS variables at :root, light-mode by default
:root, .pc-mode-light {
  @include output-base-css-variables;
  @include output-pa-css-variables;
  @include output-pa-alert-variables-light;
}

// 6. Dark mode block — overrides --pa-* values at .pc-mode-dark
.pc-mode-dark {
  --pa-main-bg: #{$dark-bg};
  // ... per-token dark overrides
  @include output-pa-alert-variables-dark;
}
```

---

## Design System

Typography uses a **10px rem base** (`html { font-size: 10px }`), so
`1.6rem = 16px`. Spacing/typography scales: `packages/core/src/scss/variables/`.

### Native Grid System (pc-col-*)

**Prefix is `pc-`, not `pa-`.** The grid is foundation-level, so it uses the
`pc-` namespace. (The old `pa-row` / `pa-col-*` classes are GONE — not legacy
tolerance, they do not exist in the compiled CSS. Any `pa-col-*` markup renders
unstyled.) The `pc-` grid is currently **emitted from core** (`dist/main.css`)
with the `pc-` prefix; a planned coordinated release graduates it down into
`@keenmate/pure-css` — see the `pc-grid graduation` note. Consume it the same
way regardless of which package emits it.

```
.pc-row                         → Flex container (row)
.pc-row--center/end             → Justify the row (also --between / --around)
.pc-row--top/middle/bottom      → Align items vertically
.pc-col                         → Auto-equal width (flex: 1)
.pc-col-auto                    → Content-based width
.pc-col-{5..100}                → Percentage columns (5% increments)
.pc-col-1-2                     → 50%  (fractions)
.pc-col-1-3, 2-3                → Thirds
.pc-col-1-4, 3-4                → Quarters
.pc-col-1-5…4-5, 1-6/5-6, 1-12…11-12  → Fifths / sixths / twelfths
.pc-col-sm-*, md-*, lg-*, xl-*  → Responsive variants (mobile-first)
.pc-col--no-padding             → Drop the column gutter
.pc-col--grow / --shrink        → flex-grow / allow shrink below content
```

Wrappers emit these from props: svelte `<Column size="100" md="50">` and keen
`<.column size="100" md="50">` both render `pc-col-100 pc-col-md-50`.

---

## Critical Rules

1. **Pick the right token layer.** Themable runtime values → `var(--pa-X)`
   (framework) or `var(--base-X)` (web-component bridge). Structural /
   compile-time values (spacing scales, font sizes, border radii on
   non-themable components) → SCSS variables. When in doubt: if a theme,
   a JS mode-switch, or inline data-driven styling would want to change
   it without a recompile, it's a CSS variable. Most role-coloured surfaces
   (`--pa-success`, `--pa-danger`, etc.) and the sentiment scale are CSS vars.
2. **Use `pa-` prefixed BEM classes only.** No demo-specific classes in core.
   Components must be reusable framework elements.
3. **Follow BEM strictly.** `pa-[block]__[element]--[modifier]`.
4. **Themes override BOTH SCSS variables and CSS variables.** SCSS overrides
   set values before `@import` (compile-time, via `!default`); the
   `output-pa-css-variables` / `output-base-css-variables` mixins emit them
   as `--pa-*` / `--base-*` at `:root` (runtime). Don't pick one or the
   other — both are part of the contract.
5. **Don't cross-reference component SCSS variables.** Each component owns
   its own variables; never reuse a sibling component's variable as a
   shortcut. Reuse via the shared `$base-*` / `$font-size-*` / `$spacing-*`
   tokens or via the runtime `--pa-*` cascade.
6. **No `min-height` on form elements** — causes inconsistent layouts.
7. **Font inheritance is global** — never add `font-family: inherit` to
   components.
8. **One canonical markup structure per component — rigidity over flexibility.**
   The framework is consumed by code generators (svelte-pure-admin) that emit
   one DOM tree per component, so never bless two valid shapes for the same
   slot. Pick one, document it, show it in the snippet; legacy forms may still
   render but aren't a second option. See the card-header worked example under
   Architecture Principles.

---

## Base CSS Variables for Web Components

`--base-*` CSS custom properties are the public theming API for the
`@keenmate/web-multiselect` and `@keenmate/web-daterangepicker` web
components (shadow-DOM children outside the SCSS compile boundary), which
consume them via fallback chains
(`--ms-accent-color: var(--base-primary-color, #3b82f6);`).
Authoritative list and emit mixin: `_base-css-variables.scss`.

---

## RTL

RTL is via CSS logical properties (`dir="rtl"` on `<html>`); use the logical
utilities (`ms-*`/`me-*`, `ps-*`/`pe-*`, `text-start`/`text-end`). Toast
positions use logical names (`top-start`, `top-end`, `bottom-start`, …).
