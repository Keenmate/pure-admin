# @keenmate/pure-admin-core — package notes

Loaded when working under `packages/core/`. Root `CLAUDE.md` holds the
universal rules.

## Why the `:root` emit lives in `main.scss`, not `_core.scss` (v2.8.0)

Before v2.8.0 the bundled `dist/css/main.css` emitted no `:root` defaults at
all — themes were assumed to always supply them. Consumers importing
`@keenmate/pure-admin-core/css` standalone, or any page where the theme
stylesheet hadn't fully loaded yet (stale localStorage theme id producing
a 404, network race, FOUC window before the blocking `<link>` parses),
had every `var(--pa-*)` reference resolve to nothing. The resulting
`color:` declarations went invalid and fell back to inherited text colour
— canvas-based charts that captured `getComputedStyle(...).color` at draw
time rendered black, while SVG sparklines / banded sentiment cells /
delta chips silently lost their hues. The bug was hardest to spot on
runtime theme switches: charts built with the cascade resolved freeze
their colours into the Chart.js dataset and don't repaint until the
canvas is destroyed.

Emitting the mixins from `_core.scss` would have duplicated the entire
`:root` block in every theme build (themes `@import _core` and then emit
their own `:root` separately), bloating each theme CSS by ~200 lines and
forcing every theme to silently override the same neutral defaults.
Putting the emit in `main.scss` — which themes do NOT go through — gives
the unthemed bundle a working cascade while keeping all 15 theme outputs
byte-identical (verified at the 2.8.0 cut by rebuilding the
`pure-admin-themes` repo and diffing).

A first iteration (`a76d195`) emitted only the 5-step sentiment scale
defaults from `_core.scss` itself; the follow-up (`7076c2c`) moved the
emit to `main.scss` and widened it to the full
`output-base-css-variables` + `output-pa-css-variables` +
`output-pa-alert-variables-light` set so the unthemed bundle is a
complete usable baseline, not just a sentiment-colour patch.

## Card header icon alignment (FA glyph metrics)

`pa-card__title-icon` uses `font-size: $font-size-base` with `line-height: 1`,
which sets the icon's font-box height to 16px. Font Awesome glyphs sit ~1px
below the font-box center — so a "mathematically centered" icon (e.g. computed
from `(header-min-height − icon-size) / 2`) looks ~1px too high to the eye.

When you need pixel-perfect alignment (e.g. comparing icon position across two
header states like the splitter's expanded ↔ minimized rail), the cleanest
knob is **`$card-header-padding-v`** — bumping it by **0.05rem** shifts both
states down together by ½px, splitting the visual error symmetrically. Don't
hardcode a magic 0.8rem offset on a single child element; that creates a
debt that drifts when other header metrics change.
