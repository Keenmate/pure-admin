# Wrapper naming conventions

svelte-pure-admin and keen-pure-admin expose the **same props under the same
names**: keen spells them `snake_case`, svelte `camelCase`, and that is the only
difference. `naming.mjs` enforces it over every feature both capability maps
declare (`npm run fidelity:naming -w @keenmate/pure-admin-core`).

## Rules

| Kind | keen | svelte | Examples |
|---|---|---|---|
| Boolean flag | `is_*` | `is*` | `is_striped` / `isStriped`, `is_vertical` / `isVertical` |
| Show / hide an optional part | `has_*` | `has*` | `has_toggle` / `hasToggle`, `has_tick_labels` / `hasTickLabels` |
| Behaviour (what it should DO) | `should_*` | `should*` | `should_close_on_escape` / `shouldCloseOnEscape`, `should_snap_to_ticks` / `shouldSnapToTicks` |
| Role colour (primary / success / danger …) | `variant` | `variant` | button, alert, badge, card, modal, toast, loader, stat, split-button item |
| Theme colour slot 1–9 | `theme_color` | `themeColor` | badge, button, input, fields, table-card … |
| Several options that exclude each other | one enum named for what it controls | same | banded `label_width` (narrow / wide), modal `placement`, fields `layout`, `copy_mode` |
| Predefined kind / design of the component | `type` | `type` | loader, kpi, tabs (`pills` / `boxed`), ordered-list (`roman` / `alpha`), range `handle_type` |
| Arrangement of the children | `layout` | `layout` | stat, kpi-bento, checkbox-list, fields |
| Spacing density | `density` | `density` | fields (`compact` / `relaxed`), list, document, sheet |
| Plain-text value | `*_text` | `*Text` | `title_text` / `titleText`, `label_text` / `labelText`, `count_text` / `countText` |
| Rich content (slot / snippet) | bare name | bare name | `:title` / `title` snippet, `:description` / `description` |
| Icon by name | `icon_name` | `iconName` | `icon_name="fas fa-home"` — always rendered through the Icon component, so every configured provider resolves it |
| Icon as rich content | `:icon` | `icon` snippet | an emoji, inline SVG or any custom markup |
| One actions area | `:actions` | `actions` | alert, toast, detail panel, filter card, table card |
| Actions in header AND footer (card) | `:header_actions` / `:footer_actions` | `headerActions` / `footerActions` | card; collapsed fallback `:header_actions_collapsed` / `headerActionsCollapsed` |

`*_text` vs a bare name is what tells a plain string from a slot/snippet of the
same concept (`title_text` vs `:title`), so both can exist side by side. The same
goes for `icon_name` vs `:icon`.

**`*_text` holds even when the string lands in a native attribute.** button's
hover title is `title_text` / `titleText` (rendered as `title="…"`), not a bare
`title` — the bare name stays reserved for a rich slot, as everywhere else.

**Every boolean follows `is_` / `has_` / `should_`, native attributes included.**
`is_disabled` / `isDisabled`, `is_readonly`, `is_required`, `is_checked`
(`bind:isChecked`), `is_multiple`, `should_autofocus` — the component renders the
native attribute itself. keen does NOT also pass the bare native name through
`:rest`, so there is one way to write it.

**`style` is only ever the native inline-style string** (`style="--x: 1"`). A
choice between predefined designs is `type`; the arrangement of children is
`layout`; the role colour is `variant`.

## Framework idioms (accepted differences)

| keen | svelte | Why |
|---|---|---|
| `inner_block` | `children` | each framework's default slot |
| `end_`, `footer_` | `end`, `footer` | trailing `_` dodges an Elixir reserved word / clash |
| `on_first` (phx event name) | `onfirst` (callback) | LiveView event string vs Svelte 5 lowercase event callback |
| splitter `<:pane>` slots | `<SplitterPane>` children | same DOM; each framework's natural way to author repeated children |
| split-button `<:item>` slots | `menu` snippet of `<SplitButtonItem>` | same DOM; slots vs child components |
| range-group `<:row>` slots | `rows={[…]}` data array | same DOM; slots vs a config array |
| kpi-terminal: tabs on when `<:pane>` slots exist | `hasTabs` | svelte panes register after they render, but SSR must pick the wrapper DOM (tab strip vs grid) up front |
| — | svelte-only client state: split-button `isOpen`, range-group `values` / querystring / `mode` / `debounce`, kpi-terminal `activePaneId` (all bindable) | keen keeps that state on the server (events / hooks) |

Anything else that differs is a bug in one wrapper — rename it (pre-release, no
back-compat aliases) and record the rename in that wrapper's CHANGELOG.

## Layout props are named after the CSS property they drive

| Prop | CSS | Used by |
|---|---|---|
| `justify` | `justify-content` | grid, button, tabs, pager, load-more |
| `align` | `align-items` | grid, button-group, desc-table / banded (`center`) |
| `text_align` / `textAlign` | `text-align` | paragraph, popover; desc-table / banded `label_text_align` / `value_text_align` |
| `placement` | — (floating element side, as in Floating UI / Bootstrap) | tooltip, popover, popconfirm, modal, toast, split-button menu, card `*_tooltip_placement`; core JS `placement` option (dialogs, toasts) |

Never reuse a CSS property name for something that isn't that property: timeline's "all items on
one side" is `side`, not `align`; command-palette's mode is `display_style`, not `display`.
