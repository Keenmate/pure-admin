# Text / typography consolidation — migration plan

> **DECISION REVISED (2026-10-04): the canonical muted-text utility is
> `.text-secondary`, NOT `.text-muted`. `.text-muted` was removed entirely.**
> Rationale: `text-secondary` already had the dominant, pre-existing usage across
> the demos (loaders / splitter / detail-panel / data-display …) and its name
> matches the component `--secondary` role vocabulary (a `pa-btn--secondary` /
> `pa-stat--secondary` is the subdued variant). All `text-muted` occurrences were
> swept → `text-secondary` across the three repos; the wrapper prop value is
> `secondary` (its original name — the `muted` value added earlier this session was
> reverted). svelte's `mode="muted"` legacy prop alias is kept (→ `text-secondary`).
> `--pc-text-muted` *variable* refs in svelte docs are unrelated and untouched.
> Everything below that says "text-muted (canonical)" / "text-secondary
> (provisional alias)" is SUPERSEDED by this note.

> **TYPOGRAPHY SIZE MODEL — PINNED (2026-10-04).** The `text-*` / `$font-size-*`
> scale is ABSOLUTE: a px maps to ONE token name everywhere (no per-component
> renaming). Empirical tiers in actual use:
> - `base` = **16px** → body / bare `<p>` / `<Paragraph>` default / card titles = **the body/reading default**
> - `md` = 15px → sidebar / nav menu items (lone outlier; normalize later)
> - `sm` = **14px** → buttons / inputs / tables / tabs = **the UI-control default**
> - `xs` = 12px → badges / field labels / captions
> The old "16px called `lg`" contradiction lived ONLY in the deleted `.pa-text`
> (its local base was 14px). Gone now. `<Paragraph>`/`<.paragraph>` with no `size`
> = a plain `<p>` at 16px (matches a bare `<p>`); `size` maps DIRECTLY to the
> same-named flat utility (`sm`→text-sm=14, `lg`→text-lg=18, …) — no offset.

**Status:** Initiative 1 (`pa-text` → `text-*`) **COMPLETE** (2026-10-04).
Phases 1–4 executed and verified across all three repos: core `.pa-text`
component deleted, flat `text-*` utilities live, wrappers re-pointed, all call
sites swept, catalog regenerated, core bumped to 3.3.0-rc06 + CHANGELOG.
Verified: core/themes rebuilt (0 `.pa-text` in corporate dist), demo renders
flat utilities, svelte-check clean for the typography components, zero in-scope
`pa-text*` references remain anywhere. NOT yet committed (left for review) and
NOT published. **Deferred to the coordinated release (user-driven):** move
`.text-secondary`/`.text-body` down into pure-css beside the role
colours; `CSS-VARIABLES.md` refresh; publish chain (core → themes → wrappers);
commit the keen + svelte wrapper changes after a live runtime pass.
Initiative 2 (palette `pa-*-color-N`) is still planned/pending below.

## Why

The text/typography surface oscillates between a prefixed component namespace
(`pa-text*`) and flat unprefixed utilities (`text-*`). This created:

1. **A dead-class trap.** `text-muted` / `text-secondary` / `pa-text-secondary`
   (single hyphen) are used ~376× across the three repos' demos but were **never
   defined** — they render unstyled (or, on `<Paragraph class="text-muted">`,
   the component's own `.pa-text` colour wins so it silently shows *primary*
   colour). The only real muted-text token is `.pa-text--secondary`, a modifier
   of the `.pa-text` component — there is **no flat muted utility**.
2. **A redundant family.** `pa-text*` (12 classes) is ~80% a differently-named
   shadow of the flat `text-*` family. Every `pa-text` size resolves to the
   **identical `$font-size-*` token** as a flat `text-*` (just offset-named):

   | `pa-text*` | token | = flat `text-*` | px |
   |---|---|---|---|
   | `.pa-text` (base) | `$font-size-sm` | `.text-sm` | 14 |
   | `.pa-text--xs` | `$font-size-2xs` | `.text-2xs` | 10 |
   | `.pa-text--sm` | `$font-size-xs` | `.text-xs` | 12 |
   | `.pa-text--lg` | `$font-size-base` | `.text-base` | 16 |
   | `.pa-text--xl` | `$font-size-lg` | `.text-lg` | 18 |
   | `.pa-text--start/center/end` | — | `.text-start/center/end` | — |
   | `.pa-text--primary` | → `--pc-text-color-1` | (body = default) | — |
   | `.pa-text--secondary` | → `--pc-text-color-2` | **(missing) → `.text-muted`** | — |
   | `.pa-text--caption` | 12px + muted + mb | `.text-caption` | — |
   | `.pa-text--lead` | 16px + relaxed lh | `.text-lead` | — |

### The organizing rule (to stop the oscillation)

> **Single-declaration atom you compose freely → unprefixed utility.
> Structured, multi-element, opinionated block → `pa-`/`pc-` component.**
> Colour / size / spacing / display are always utilities; cards / navbars /
> modals are always components.

`pa-text` is a utility filed as a pseudo-component. Consolidating it into
`text-*` moves a mis-filed utility back to where all its siblings already live —
it *reduces* the oscillation, it doesn't add a new pattern.

## Scan result — is `pa-text` the only offender? **No.**

Two pa- clusters are really utilities-in-disguise:

1. **`pa-text*`** (typography: size / colour / align / semantic) — THIS migration.
2. **`pa-*-color-N` palette cluster (45 classes):** `pa-text-color`,
   `pa-bg-color`, `pa-border-color`, `pa-text-on-color`, `pa-text-bg-color`
   (5 families × 9). `.text-color-N` (unprefixed, 9) is a **literal duplicate**
   of `.pa-text-color-N` (both → `var(--pc-color-N)`; unprefixed just adds
   `!important`). **This is a SEPARATE, larger follow-up** — documented here so
   it isn't forgotten, but intentionally OUT OF SCOPE for the `pa-text`
   migration to avoid scope-creep.

Everything else (spacing, sizing, display, flex, gap, rounded, cursor, overflow,
position, font-family/style) is clean — single-namespace, no `pa-` twin.

## Ownership (where classes live)

- Role colours (`.text-primary/success/danger/warning/info`) → **pure-css**
  `src/scss/utilities.scss`.
- Size scale (`.text-2xs … .text-4xl`), align, palette (`.pa-text-color-N`) →
  **core** `src/scss/core-components/_utilities.scss`.
- `pa-text*` component → **core** `_utilities.scss`.
- Themes consume **core via `file:` link**, **pure-css via npm (`^1.1.1`)**.
  → Additive changes placed in **core** appear in the demo after a themes
  rebuild WITHOUT a pure-css publish. Final home for `.text-muted` is pure-css
  (with the other text colours), moved during the coordinated release.

## Decisions locked

- **Keep** `text-caption` / `text-lead` / `text-body` (judge in demo).
- **`text-primary` stays = accent** (Bootstrap convention; do NOT rename).
- **Keep `text-secondary` for now** as an alias of muted; showcased in the demo;
  final keep/drop decided later. (`text-secondary` is ambiguous vs the role axis,
  so it's provisional — `text-muted` is the canonical name.)

## Target API (end state)

```
SIZE (flat, 10-step — superset, keep as-is)
  text-2xs 10 · text-xs 12 · text-sm 14 · text-md 15 · text-base 16
  text-lg 18 · text-xl 20 · text-2xl 24 · text-3xl 28 · text-4xl 32

COLOUR
  role:     text-primary(=accent) · text-success · text-danger · text-warning · text-info
  neutral:  (default = body) · text-muted (NEW → --pc-text-color-2) · text-body (NEW → --pc-text-color-1)
            text-secondary (NEW, provisional alias of text-muted)
  palette:  text-color-1 … text-color-9   (= --pc-color-N; dup of pa-text-color-N — separate follow-up)

ALIGN     text-start · text-center · text-end
SEMANTIC  text-caption (NEW) · text-lead (NEW)
MISC      text-nowrap · text-truncate · text-vertical · text-vertical-up
```

`pa-text*` (12) → DELETED (breaking phase).

## Components after migration (wrappers stay prop-driven, never raw classes)

| Props | before | after |
|---|---|---|
| `<Paragraph>` default | `pa-text` | `text-sm` |
| `color="muted"` | `pa-text pa-text--secondary` | `text-sm text-muted` |
| `size="lg"` | `pa-text pa-text--lg` | `text-base` (16) |
| `align="center"` | `pa-text pa-text--center` | `text-sm text-center` |
| `<Text variant="muted">` | `pa-text--secondary` | `text-muted` |

Prop renames (keep old as deprecated alias 1 release):
`color="secondary"`→`color="muted"`; `variant="secondary"`→`variant="muted"`;
drop `color="primary"` (body is default).

## Phases

### Phase 1 — ADDITIVE (done tonight; non-breaking)
- Add to core `_utilities.scss`: `.text-muted`, `.text-body`, `.text-caption`,
  `.text-lead`, `.text-secondary` (provisional alias). `pa-text*` untouched.
- Rebuild core + themes. Add a demo page showcasing the full `text-*` family.
- **Reversible, breaks nothing.** This is what's up for review in the morning.

### Phase 2 — components re-point (breaking) ✅ DONE 2026-10-04
- keen `typography.ex`: `paragraph` now emits flat `text-*` via a
  `paragraph_size_class/1` remap (offset scale: `xs`→`text-2xs`, `sm`→`text-xs`,
  default→`text-sm`, `lg`→`text-base`, `xl`→`text-lg`) + `paragraph_color_class/1`
  (`muted`/`secondary`→`text-muted`, `primary`→`text-body`); `text` →
  `text-muted` for muted (`muted` canonical, `secondary` deprecated alias).
- svelte `Paragraph.svelte` (sizeClassMap + `color`/`mode` → `text-muted`/`text-body`),
  `Text.svelte` (`muted`/`secondary` → `text-muted`), `Heading.svelte`
  (`horizontalAlignment` → `text-*`). Prop APIs unchanged; `muted` added, `secondary`
  kept as deprecated alias. svelte-check: 0 new errors (5 pre-existing DataViz errors
  are unrelated).

### Phase 3 — call-site sweep (breaking) ✅ DONE 2026-10-04
- pure-admin demo: all mustache `pa-text*` → flat `text-*` (scripted token remap;
  `pa-textarea` / `pa-text-color-N` / `pa-text-bg-color-N` left untouched).
- keen demo (24 occ / 9 files) + svelte docs (39 occ / 10 files): raw classes → flat
  `text-*` on arbitrary elements, `color="muted"` / `variant="muted"` props on
  `<.paragraph>`/`<Paragraph>`/`<.text>`, prose/`<Code>` renamed to `text-muted`.
- Dead `pa-text-secondary` (single-hyphen) + keen's dead `pa-text--danger`/`--success`
  resolved to `text-muted` / `text-danger` / `text-success`.

### Phase 4 — remove `pa-text*` ✅ DONE 2026-10-04 (relocation deferred)
- Deleted the 12 `pa-text*` classes from core `_utilities.scss`; rebuilt core + all
  16 themes (0 `.pa-text` component in corporate dist; flat utils present).
- Catalog regenerated: removed `pa-text` from the generator taxonomy (line ~334) and
  de-dotted the migration-note comments (the generator scrapes `.pa-*` from comments
  too, so dotted `.pa-text--*` in a comment re-created phantom catalog blocks).
  Now 60 components · 152 blocks · 659 selectors. Core → 3.3.0-rc06 + CHANGELOG + lockfile.
- **STILL DEFERRED (coordinated release, user-driven):** move
  `.text-muted`/`.text-body`/`.text-secondary` into pure-css `utilities.scss` beside
  the role colours; `CSS-VARIABLES.md` refresh; publish chain
  pure-css → core → themes → wrappers; commit keen + svelte after a live runtime pass.

---

# Initiative 2 — palette colour utilities (`pa-*-color-N` → unprefixed)

Separate from the `pa-text` work above; **same de-oscillation rule.** The 9-step
data palette (`--pc-color-N` + contrast `--pc-color-N-text`, both emitted in
pure-css `_base-css-variables.scss`) is exposed through 5 utility families, 4 of
them stuck in `pa-`. All are atomic colour utilities → they belong unprefixed.

### Census (call sites across all 3 repos)

| family | pa-demo | keen | svelte | pa- sites | note |
|---|---|---|---|---|---|
| `pa-text-color-N` | 12 | 0 | 2 | 14 | unprefixed `text-color-N` already exists (134 uses) — the dominant form |
| `pa-bg-color-N` | 1 | 1 | 11 | 13 | |
| `pa-border-color-N` | 10 | 0 | 2 | 12 | |
| `pa-text-on-color-N` | 0 | 0 | 0 | **0** | unused today, but KEPT (renamed) by decision |
| `pa-text-bg-color-N` | 10 | 0 | 0 | 10 | the composite |

~49 pa- call sites total (vs 134 already-unprefixed `text-color-N`).

### End state

| today | → target | declaration |
|---|---|---|
| `pa-text-color-N` + `text-color-N` | **`text-color-N`** | `color: var(--pc-color-N)` |
| `pa-bg-color-N` | **`bg-color-N`** | `background-color: var(--pc-color-N)` |
| `pa-border-color-N` | **`border-color-N`** | `border-color: var(--pc-color-N)` |
| `pa-text-on-color-N` | **`text-on-color-N`** | `color: var(--pc-color-N-text)` (contrast text; kept despite 0 current uses) |
| `pa-text-bg-color-N` | **`surface-color-N`** | `background: var(--pc-color-N)` + `color: var(--pc-color-N-text)` |

Naming logic: **`{property}-color-N` = palette slot N applied to that property**;
`surface-color-N` = palette-tinted surface with guaranteed-readable text (the only
composite). All emit `!important` to match `text-color-N` + the role colours so
they win when composed onto a component.

### Decisions (locked)
- Unprefix **all five** families (incl. `text-on-color-N`, kept despite 0 current
  uses — renamed, not dropped).
- Composite name = `surface-color-N`.
- `!important` on all (cascade parity with `text-color-N` + role colours).
- Keep the composite (don't force compose).
- Home = core `_utilities.scss` now (file-linked, demo-able) → pure-css
  `utilities.scss` beside the role colours + palette tokens in the coordinated release.

### Exhaustive colour-apply scan (confirmed complete)
These **5 families are the ENTIRE standalone colour-apply surface** — no other
`bg-{role}` / `fill-` / `ring-` utilities exist. Everything else matching "color"
is a **component `--color` modifier** (`pa-btn--color`, `pa-badge--color`,
`pa-alert--color`, `pa-card--color`, `pa-toast--color`, `pa-input--color`, …) —
palette-tinted *component variants*, correctly `pa-`-scoped (part of a component's
BEM), so they **stay** and are out of scope.

### Known naming wart (accepted)
`text-color-N` → `--pc-color-N` (data PALETTE, e.g. pink) while
`text-muted`/`text-body` → `--pc-text-color-N` (text HIERARCHY). Mental model:
**numbered `-color-N` = palette; named (`muted`/`body`) = hierarchy.** Tolerable,
not renaming.

### Phases (mirror Initiative 1)
- **A. Additive:** add unprefixed `bg-color-N`, `border-color-N`,
  `text-on-color-N`, `surface-color-N`; `text-color-N` already exists. Build core
  + themes; showcase on Helpers/Colors demo. Non-breaking.
- **B. Sweep call sites (~49):** `pa-text-color→text-color`,
  `pa-bg-color→bg-color`, `pa-border-color→border-color`,
  `pa-text-bg-color→surface-color` across all repos (raw HTML → classes,
  wrappers → props/classes).
- **C. Remove pa-:** delete the 45 `pa-*-color-N`; relocate the unprefixed family
  into pure-css beside the role colours + palette tokens; update `COMPONENTS.md` /
  `components.json` + `CSS-VARIABLES.md`; coordinated publish chain
  (pure-css → core → themes → wrappers).

### Scope
~45 pa- classes + ~49 call sites across 3 repos — roughly the same size as
Initiative 1, and independent of it (can run in parallel or after).

## Risks / notes
- **Suffix shift is not a blind find/replace** (`pa-text--sm`=12 ≠ `text-sm`=14;
  `pa-text--lg`=16 = `text-base`). Use the token table above.
- **`.text-color-2` (palette, pink `--pc-color-2`) ≠ muted text
  (`--pc-text-color-2`, slate).** Naming collision to keep in mind; `.text-muted`
  sidesteps it.
- Demo loads theme CSS, so **themes must be rebuilt** after any core utility add.
