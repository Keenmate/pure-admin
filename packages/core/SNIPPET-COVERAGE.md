# Pure Admin — Snippet Coverage Report

> **Auto-generated** by `scripts/build-components-catalog.mjs` (runs with `npm run catalog`).
> Do not edit by hand. This is a maintainer QA artifact — it is *not* shipped in the npm package.

The systematic sweep behind the snippet walkthrough: for each `pa-*` component it checks how many of its catalog selectors (blocks + elements + modifiers) actually appear in the snippet a code-gen tool would copy from.

**How to read it**
- **Structural coverage** — share of the component's catalog selectors present in its snippet. Only `@each`-interpolated variants (`&--#{$v}`, e.g. `pa-composite-badge--primary`) are excluded; explicitly-written colour modifiers (`pa-badge--danger`, …) ARE catalog selectors and count, so a snippet omitting some now reads as < 100% (intended signal).
- **Ref block** — heuristic: does the snippet carry a trailing `REFERENCE` / `CLASSES:` summary (the `badges.html` gold-standard shape: sections → inline modifier docs → scenarios → reference block)?
- **Status** — for gaps: `todo` (snippet owed), `deferred` (API in flux), `superseded` (owned elsewhere).

## Action queue — snippets to uplift (worst first)

| Component | Snippet | Coverage | Ref block | Missing selectors |
|---|---|:--:|:--:|---|
| Data-viz primitives | progress.html | 21/95 (22%) | ✗ | `pa-bar-list`, `pa-data-bar`, `pa-gauge`, `pa-heatmap`, `pa-progress-ring`, `pa-sparkline`, `pa-stacked-bar`, `pa-bar-list__bar`, `pa-bar-list__header`, `pa-bar-list__item`, `pa-bar-list__label`, `pa-bar-list__value`, `pa-data-bar__fill`, `pa-data-bar__track`, `pa-data-bar__value`, `pa-gauge__inner`, `pa-gauge__label`, `pa-gauge__max`, `pa-gauge__min`, `pa-gauge__value`, `pa-heatmap__cell`, `pa-heatmap__legend`, `pa-heatmap__legend-cell`, `pa-progress-ring__inner`, `pa-progress-ring__label`, `pa-progress-ring__value`, `pa-sparkline__bar`, `pa-stacked-bar__legend`, `pa-stacked-bar__legend-item`, `pa-stacked-bar__legend-swatch`, `pa-stacked-bar__segment`, `pa-bar-list--compact`, `pa-bar-list--danger`, `pa-bar-list--info`, `pa-bar-list--success`, `pa-bar-list--warning`, `pa-data-bar--danger`, `pa-data-bar--info`, `pa-data-bar--negative`, `pa-data-bar--success`, `pa-data-bar--warning`, `pa-gauge--danger`, `pa-gauge--info`, `pa-gauge--success`, `pa-gauge--warning`, `pa-gauge--zones`, `pa-heatmap--compact`, `pa-heatmap--danger`, `pa-heatmap--success`, `pa-progress-ring--danger`, `pa-progress-ring--info`, `pa-progress-ring--lg`, `pa-progress-ring--sm`, `pa-progress-ring--success`, `pa-progress-ring--warning`, `pa-sparkline--danger`, `pa-sparkline--info`, `pa-sparkline--lg`, `pa-sparkline--sm`, `pa-sparkline--success`, `pa-sparkline--warning`, `pa-stacked-bar--lg`, `pa-stacked-bar--sm`, `pa-stacked-bar__legend-swatch--danger`, `pa-stacked-bar__legend-swatch--info`, `pa-stacked-bar__legend-swatch--primary`, `pa-stacked-bar__legend-swatch--secondary`, `pa-stacked-bar__legend-swatch--success`, `pa-stacked-bar__legend-swatch--warning`, `pa-stacked-bar__segment--danger`, `pa-stacked-bar__segment--info`, `pa-stacked-bar__segment--secondary`, `pa-stacked-bar__segment--success`, `pa-stacked-bar__segment--warning` |
| Button | buttons.html | 55/59 (93%) | ✓ | `pa-btn-split__item--info`, `pa-btn-split__item--primary`, `pa-btn-split__item--secondary`, `pa-btn-split__item--warning` |

## Gaps — components with no snippet

| Component | Block | Status | Reason |
|---|---|:--:|---|
| Scroll lock | `pa-scroll-lock` | todo | Dedicated snippet owed. |
| Settings panel | `pa-settings-panel` | deferred | Demo-internal composition; no standalone public contract yet. |
| Logic tree | `pa-logic-tree` | deferred | API not yet stable — a snippet would chase a moving target. |
| File selector | `pa-file-dropzone` | superseded | Superseded by @keenmate/web-dropzone (the demo "File Upload" route renders the web component). Removal candidate — no snippet owed. |

## Full structural coverage + reference block

`Card`, `Section`, `Splitter`, `Modal`, `Tabs`, `Detail panel`, `Profile panel`, `Table card`, `Form layout`, `Text input`, `Textarea`, `Select`, `Input group`, `Input wrapper / token field`, `Checkbox`, `Radio`, `Checkbox list`, `Range slider`, `Range group`, `Inline query editor`, `Filter card`, `Pager`, `Popconfirm`, `Table`, `Comparison table`, `List`, `Document`, `Sheet (printable document)`, `Code block`, `Data display (field lists)`, `Statistics / stat cards`, `KPI showcase — shared base`, `KPI showcase — terminal`, `KPI showcase — sparkline list`, `KPI showcase — comparison gauges`, `KPI showcase — hero + supporting`, `KPI showcase — bento`, `KPI showcase — numeric strip`, `KPI showcase — editorial minimal`, `Alert`, `Callout`, `Toast`, `Notifications`, `Tooltip`, `Popover`, `Loaders / spinners`, `Timeline`, `Steps`, `Sections (navigated long content)`, `Badge`, `Label`, `Composite badge`, `Command palette`, `Search results`, `Icon`, `Utilities & state hooks`

