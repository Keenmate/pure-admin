# Text / typography consolidation — migration plan

**Status:** DRAFT for review (2026-10-04). Phase 1 (additive) implemented; the
breaking phases are specified but NOT yet executed (they need visual review +
wrapper testing).

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

### Phase 2 — components re-point (breaking; needs wrapper testing)
- `<Paragraph>`/`<.paragraph>` + `<Text>`/`<.text>` emit `text-*` instead of
  `pa-text*`; add `muted` prop values; keep `secondary` alias.
- Build + visual-check both wrappers (keen :18700, svelte dev). Fidelity dumps.

### Phase 3 — call-site sweep (breaking)
- Raw HTML (pure-admin demo): remaining `pa-text*` → `text-*`.
- Wrappers: any remaining raw classes → props.
- Second dead-class population (`text-secondary`/`pa-text-secondary`) resolved
  per the Phase-1 decision.

### Phase 4 — remove `pa-text*` + relocate `.text-muted` to pure-css
- Delete the 12 `pa-text*` classes from core.
- Move `.text-muted`/`.text-body`/`.text-secondary` into pure-css `utilities.scss`
  beside the role colours.
- **Coordinated release:** pure-css → core → themes → wrappers (file:/npm chain).
- Update `COMPONENTS.md` / `components.json` catalog + `CSS-VARIABLES.md`.

### Later (separate initiative) — `pa-*-color-N` palette cluster
De-duplicate `pa-text-color-N` vs `text-color-N` and decide the home for the
`bg-color`/`border-color`/`text-on-color`/`text-bg-color` palette utilities.
NOT part of this migration.

## Risks / notes
- **Suffix shift is not a blind find/replace** (`pa-text--sm`=12 ≠ `text-sm`=14;
  `pa-text--lg`=16 = `text-base`). Use the token table above.
- **`.text-color-2` (palette, pink `--pc-color-2`) ≠ muted text
  (`--pc-text-color-2`, slate).** Naming collision to keep in mind; `.text-muted`
  sidesteps it.
- Demo loads theme CSS, so **themes must be rebuilt** after any core utility add.
