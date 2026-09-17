# Audit — `--pc-*` vs `--pa-*` CSS-variable prefix drift across the ecosystem

**Generated:** 2026-09-17 22:31:15 +0200
**Author:** Claude Opus 4.8 (1M context)
**Scope:** all sibling repos under `C:\Git\KM\` — `pure-admin`, `pure-css`,
`pure-admin-themes`, `base-css-variables`, `svelte-pure-admin`, `keen-pure-admin`,
`keen-docs`.

---

## Background — what the real naming rule is

The `--pa-` → `--pc-` "foundation de-brand" was an **ownership split, not a total
rename** (this corrects an earlier memory note that claimed *all* `--pa-*` were
renamed and "0 `--pa-` remain"):

- **`--pc-*`** = foundation / base tokens owned and emitted by **`@keenmate/pure-css`**
  (core colours, navbar / sidebar / footer layout, border radii, mode/grid).
  **77** unique live.
- **`--pa-*`** = pure-admin **component** tokens (buttons, alerts, badges, modals,
  command palette, range, kpi, splitter, …), emitted by pure-admin's
  `output-pc-component-variables` mixin in `_pc-component-variables.scss`. **These
  were never renamed.** **242** unique live.

Verified against the built CSS (`pure-admin/packages/core/dist/css/main.css`):
242 `--pa-*` vs 77 `--pc-*`.

**The bug class:** any source that writes `--pc-<token>` where the live var is
`--pa-<token>` is a **silent no-op** — the declaration sets a variable nothing
reads, so the styled value falls back to its default. Most damaging for
data-driven inline styling (gauge sizes, trend colours, range fills, splitter
sizes) where the fallback is visibly wrong.

## Method

For each repo: scanned **git-tracked authored files only** (`.md .svelte .ts .js
.scss .css .ex .exs .heex .html .mustache`, excluding `dist/` build output).
Flagged every `--pc-<stem>` where `<stem>` exists live as `--pa-<stem>` and **not**
as a `--pc-` base token. Source of truth = emitted names in `main.css`.

---

## Results

| Repo | Verdict | Hits | Where |
|---|---|---|---|
| **pure-admin** | ✅ Fixed this session | 0 | `CSS-VARIABLES.md` corrected (commit `5f54321`) |
| **pure-admin-themes** | ✅ Clean | 0 | — |
| **base-css-variables** | ✅ Clean | 0 | (only `--base-*`) |
| **pure-css** | ✅ No action | 19 | all in `CHANGELOG.md` (historical) |
| **svelte-pure-admin** | ✅ Library clean | 28 | only `CHANGELOG.md` (14) + `MARKUP_FIDELITY_AUDIT.md` (14) — scratch docs |
| **keen-docs** | ⚠️ Stale vendored | 835 | `design/core.css` (829, stale built copy), `priv/web/vendor/pure-css.css` (4), etc. → **re-vendor, don't hand-edit** |
| **keen-pure-admin** | ❌ Real functional bugs | 101 | shipped library + hooks + demo + theming doc |

---

## keen-pure-admin — the only repo needing source fixes (~85 functional hits)

These emit inline `style="--pc-…"` (or read it in JS) while pure-admin core reads
`--pa-…`, so they silently fall back to defaults.

### Shipped library components (`lib/keen_pure_admin/components/*.ex`)
| File | Hits | Example |
|---|---|---|
| `kpi_gauge_list.ex` | 9 | `defp grid_style(width), do: "--pc-kpi-gauge-cell-min: #{width};"`; tick pos/color |
| `data_viz.ex` | 3 | |
| `kpi_bento.ex` | 3 | |
| `kpi.ex` | 2 | |
| `kpi_editorial.ex` | 2 | |
| `command_palette.ex` | 1 | `--pc-command-palette-width` |
| `splitter.ex` | 1 | `--pc-splitter-gutter-size` |
| `stat.ex` | 1 | |

### Library JS hooks (`lib/assets/js/hooks/`)
| File | Hits | Note |
|---|---|---|
| `splitter_core.js` | 3 | reads `--pc-splitter-rail-size` (live: `--pa-splitter-rail-size`) |
| `detail_panel.js` | 3 | |

### Demo LiveViews (`demo/lib/demo_web/live/*.ex`)
`range_group_live` (10), `kpi_terminal_grid_live` (6), `theme_variables_live` (6),
`kpi_comparison_gauges_live` (5), `kpi_bento_live` (4), `kpi_sparkline_list_live`
(4), `splitter_live` (3), `kpi_editorial_minimal_live` (2), and 1 each in
`cards_live`, `code_live`, `data_visualization_live`, `responsivity_live`,
`stats_live`. Plus `demo/assets/js/hooks/kpi_chart.js` (1).

### Docs / tests
- `docs/theming.md` (16) — same doc bug pure-admin's `CSS-VARIABLES.md` had.
- `test/keen_pure_admin/components/loader_test.exs` (1) — assertion referencing a
  `--pc-` token; update alongside the component fix.

### Not to touch (historical / scratch)
- `component-audit.md` (9), `CHANGELOG.md` (1).

**Caveat:** keen-pure-admin has uncommitted rc14 WIP in its tree (nav-collapse
rewire, container-breakpoint). Fixing needs rebuild + LiveView runtime check on
`:18700`. Recommend scoping the shipped-library fix (`lib/**`) separately from the
demo so the published fix doesn't tangle with the WIP demo.

---

## keen-docs — re-vendor, not hand-edit

- `design/core.css` (829) — a **stale built copy** of pure-admin core (0 `--pa-`,
  all component tokens as `--pc-`), i.e. a snapshot from right after the full
  rename and before component tokens reverted to `--pa-`. Regenerate from current
  `pure-admin/packages/core/dist/css/main.css`.
- `priv/web/vendor/pure-css/pure-css.css` (4) — vendored; re-vendor from pure-css.
- `priv/web/keendocs-components.css` (1), `CHANGELOG.md` (1).

Sandbox / vendored — low urgency, mechanical.

---

## Recommended next actions (in priority order)

1. **keen-pure-admin `lib/**`** — flip `--pc-`→`--pa-` in the 8 component files + 2
   hooks (~22 hits). Ships the real user-facing fix. Rebuild + smoke test.
2. **keen-pure-admin demo + `docs/theming.md` + test** (~60 hits) — same flip;
   verify on `:18700`.
3. **keen-docs** — re-vendor `design/core.css` and `pure-css.css`.
4. **pure-css / svelte / themes** — nothing (only historical changelog mentions).

## Already done this session (pure-admin, committed on `prod`)

- `c60973b` — modal palette-style entrance + scrollbar-jump fix + runtime blur toggle.
- `5f54321` — `CSS-VARIABLES.md`: 129 component rows flipped `--pc-`→`--pa-`,
  removed dead `--pc-multiselect-*` section, fixed stale `--pc-badge-*` rows,
  reframed the section header to state the ownership split. Verified 0 stale tokens.
