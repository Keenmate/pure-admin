# Wrapper naming conventions

svelte-pure-admin and keen-pure-admin expose the **same props under the same
names**: keen spells them `snake_case`, svelte `camelCase`, and that is the only
difference. `naming.mjs` enforces it over every feature both capability maps
declare (`npm run fidelity:naming -w @keenmate/pure-admin-core`).

## Rules

| Kind | keen | svelte | Examples |
|---|---|---|---|
| Boolean flag | `is_*` | `is*` | `is_striped` / `isStriped`, `is_vertical` / `isVertical` |
| Show / hide an optional part | `has_*` | `has*` | `has_toggle` / `hasToggle`, `has_clear` / `hasClear` |
| Behaviour (what it should DO) | `should_*` | `should*` | `should_close_on_escape` / `shouldCloseOnEscape`, `should_truncate_text` / `shouldTruncateText` |
| Role colour (primary / success / danger …) | `variant` | `variant` | button, alert, badge, card, modal, toast, loader, stat |
| Theme colour slot 1–9 | `theme_color` | `themeColor` | badge, button, input, fields, table-card … |
| Several options that exclude each other | one enum named for what it controls | same | banded `label_width` (narrow / wide), modal `placement` |
| Plain-text value | `*_text` | `*Text` | `title_text` / `titleText`, `label_text` / `labelText`, `unit_text` / `unitText` |
| Rich content (slot / snippet) | bare name | bare name | `:title` / `title` snippet, `:description` / `description` |
| One actions area | `:actions` | `actions` | alert, toast, detail panel, filter card, table card |
| Actions in header AND footer (card) | `:header_actions` / `:footer_actions` | `headerActions` / `footerActions` | card; collapsed fallback `:header_actions_collapsed` / `headerActionsCollapsed` |

`*_text` vs a bare name is what tells a plain string from a slot/snippet of the
same concept (`title_text` vs `:title`), so both can exist side by side.

## Framework idioms (accepted differences)

| keen | svelte | Why |
|---|---|---|
| `inner_block` | `children` | each framework's default slot |
| `end_`, `footer_` | `end`, `footer` | trailing `_` dodges an Elixir reserved word / clash |
| `on_first` (phx event name) | `onfirst` (callback) | LiveView event string vs Svelte 5 lowercase event callback |

Anything else that differs is a bug in one wrapper — rename it (pre-release, no
back-compat aliases) and record the rename in that wrapper's CHANGELOG.

## Layout props are named after the CSS property they drive

| Prop | CSS | Used by |
|---|---|---|
| `justify` | `justify-content` | grid, button, tabs, pager, load-more |
| `align` | `align-items` | grid, button-group |
| `text_align` / `textAlign` | `text-align` | paragraph, popover |
| `placement` | — (floating element side, as in Floating UI / Bootstrap) | tooltip, popover, popconfirm, card `*_tooltip_placement` |

Never reuse a CSS property name for something that isn't that property: timeline's "all items on
one side" is `side`, not `align`; command-palette's mode is `display_style`, not `display`.
