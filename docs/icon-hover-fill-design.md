# Icon hover-fill / highlight — design note

**Status:** design agreed, NOT implemented. Scheduled as part of the
*generic-UI → pure-css* migration (sibling of the shell move).
**Date:** 2026-09-26

## Goal

Give **every** icon a hover affordance inside an enabled interactive control
(button, tab, sidebar link), driven by config + convention — **no SVG
computation, no per-icon JS listeners**. Icons that have a solid/filled variant
*fill* on hover; outline-only sets (Lucide) get an alternative cue (recolour).

## Two icon mechanisms this touches

1. **Masked `.pa-icon` primitive** (currently `pure-admin/core/_icons.scss`):
   paints an SVG via `mask-image: var(--pa-icon-src)` in `currentColor`. Already
   has hover-fill: `--pa-icon-src-hover` swaps the mask on `:hover` of an enabled
   `.pa-btn` / `.pa-tabs__item`. Outline-only glyphs no-op (Lucide ships no solid).
2. **Wrapper icon components** that emit `<i class="…">` (Font Awesome) or inline
   SVG (Heroicons) — e.g. keen's `faicon/1` / `heroicon/1` / `icon/1`,
   svelte equivalents.

## The insight: no computation, just naming/weight convention

A set that expresses regular↔solid as a **naming or weight convention** can swap
states with a class/style change — no derivation:

| Set | resting → hover | swap mechanism | cost |
|---|---|---|---|
| **Font Awesome** | `far` → `fas` | **same codepoint, `font-weight` 400→900** — pure CSS `:hover { font-weight:900 }` | ~free (⚠ `far` is FA-Pro-mostly) |
| **Heroicons / Fluent / Material** | outline → solid / regular → filled | two-asset toggle (render both, CSS visibility on hover) — needs the solid set bundled | medium |
| **Lucide** | outline only | **no fill** → recolour instead (`color:` on hover; works because stroke=currentColor) | ~free |

"Automatic solid" = a **pairing/lookup at generate time** (the pureadmin CLI +
icons MCP know which sets ship a solid), NOT a runtime calculation.

## Config shape (per-set hover STRATEGY; wrapper-level, e.g. keen `config.exs`)

Note keen config is flat: `Application.get_env(:keen_pure_admin, key)`.

```elixir
config :keen_pure_admin,
  icon_hover_fill: true,
  icon_sets: [
    fa:     [resting: "far", hover: :fill],                     # font-weight flip (CSS)
    hero:   [resting: "outline", hover: :fill, solid: "solid"], # two-asset toggle
    lucide: [hover: :highlight, hover_class: "lucide-highlight"] # recolour via CSS
    # a set with `hover: :none` opts out
  ]
```

- `hover: :fill` → FA weight-flip / hero two-asset toggle.
- `hover: :highlight` → component stamps a **static** marker class; CSS owns the
  `:hover` recolour. The class is a marker, **never toggled by JS**.
- `hover: :none` → opt out.

## Division of responsibility (the rule to hold)

- **Component** (config-driven): picks the resting render and **stamps marker
  classes/attrs** (`far`/`fas`, `lucide-highlight`, `data-*-ihover`, …).
- **CSS** (foundation): owns the actual `:hover` effect (weight flip, visibility
  toggle, recolour). Keyed on the markers + enabled-control + `:hover`.
- **JS**: only an escape-hatch `hover_callback` for behaviour CSS genuinely can't
  express (e.g. swap to a *different named glyph*). NOT for recolour (CSS does it).

## Where the CSS belongs → **pure-css (foundation)**

This behaviour is universal (any consumer with interactive icons wants it), so
the hover rules belong in **`@keenmate/pure-css`**, not in each wrapper and not
demo-only. pure-css already owns the `--base-icon-*` token contract. The natural
step is to move the `.pa-icon` **primitive** (mask + `--pa-icon-src`/`-src-hover`
+ hover rule) down into pure-css alongside the tokens, and extend the hover
selector to cover enabled `.pc-sidebar__link:hover` (today it's only
`.pa-btn` / `.pa-tabs__item`). Wrapper components then only stamp markers; every
consumer (pure-admin, keen, svelte, web components) inherits the behaviour.

## Cross-repo rollout (publish chain — do NOT bolt onto an in-flight release)

1. **pure-css**: house the icon primitive + generic hover rules (fill for
   dual-style sets via `--pa-icon-src-hover`; `font-weight` flip for FA `<i>`
   keyed on a marker; `color` recolour for outline sets keyed on `hover_class`);
   extend the enabled-control selector to include sidebar links. Publish `1.0.7`.
2. **core**: drop its `.pa-icon` copy (shim), bump dep → `^1.0.7`, rebuild.
3. **themes**: rebuild 16 at the new core, republish.
4. **keen / svelte**: add the `icon_sets` config + component marker-stamping;
   bump core dep. Heroicons `:fill` also needs the **solid** Heroicon set bundled
   (keen currently ships only 25 outline) — treat as its own sub-task.

Lockstep, per the caret gotcha (a `^1.0.x` bump won't jump on its own — bump
every consumer). See `reference_pure_css_repo_and_caret_gotcha`,
`project_shell_to_pure_css` (generic-UI move).

## Not doing now

This is a foundation initiative, separate from the pure-admin 3.3.0-rc03 sync and
the keen 2.0.0-rc.1 sync (both uncommitted). Schedule independently.
