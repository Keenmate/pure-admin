# Pure Admin — Component Catalog

> **Auto-generated** by `scripts/build-components-catalog.mjs` from the core SCSS.
> Do not edit by hand — re-run the generator after changing any `pa-*` class.
> Machine-readable form: [`components.json`](./components.json).

Framework version **3.3.0-rc06** · **60** components · **145** blocks · **1375** class selectors.

This catalog is the checklist for validating generated markup in the svelte / phoenix wrapper libraries and for auditing snippet coverage. A ✗ in the *Snippet* column marks a component with **no** `snippets/*.html` reference — a documentation gap.

## Coverage summary

> ⚠ **1 experimental component(s)** — contract not yet stable, marked ⚠ below. Not ready for wrapper-fidelity work or production use; pin an exact version if you build on them.

| Component | Block | Category | Status | Snippet | Demo |
|---|---|---|:--:|:--:|:--:|
| Scroll lock | `pa-scroll-lock` | Layout & shell | ✓ | ✗ | ✗ |
| Card | `pa-card` | Surfaces | ✓ | ✓ | ✓ |
| Section | `pa-section` | Surfaces | ✓ | ✓ | ✗ |
| Splitter | `pa-splitter` | Surfaces | ✓ | ✓ | ✓ |
| Modal | `pa-modal` | Surfaces | ✓ | ✓ | ✓ |
| Tabs | `pa-tabs` | Surfaces | ✓ | ✓ | ✓ |
| Detail panel | `pa-detail-panel-resize` | Surfaces | ✓ | ✓ | ✓ |
| Profile panel | `pa-profile-panel` | Surfaces | ✓ | ✓ | ✗ |
| Settings panel | `pa-settings-panel` | Surfaces | ✓ | ✗ | ✗ |
| Table card | `pa-table-card` | Surfaces | ✓ | ✓ | ✗ |
| Form layout | `pa-form` | Forms | ✓ | ✓ | ✓ |
| Text input | `pa-input` | Forms | ✓ | ✓ | ✓ |
| Textarea | `pa-textarea` | Forms | ✓ | ✓ | ✗ |
| Select | `pa-select` | Forms | ✓ | ✓ | ✗ |
| Input group | `pa-input-group` | Forms | ✓ | ✓ | ✗ |
| Input wrapper / token field | `pa-input-wrapper` | Forms | ✓ | ✓ | ✓ |
| Checkbox | `pa-checkbox` | Forms | ✓ | ✓ | ✓ |
| Radio | `pa-radio` | Forms | ✓ | ✓ | ✗ |
| Checkbox list | `pa-checkbox-list` | Forms | ✓ | ✓ | ✓ |
| Range slider | `pa-range` | Forms | ✓ | ✓ | ✓ |
| Range group | `pa-range-group` | Forms | ✓ | ✓ | ✓ |
| Inline query editor | `pa-inline-query-autocomplete` | Forms | ✓ | ✓ | ✓ |
| Filter card | `pa-filter-card` | Forms | ✓ | ✓ | ✗ |
| Button | `pa-btn` | Buttons & actions | ✓ | ✓ | ✓ |
| Pager | `pa-load-more` | Buttons & actions | ✓ | ✓ | ✓ |
| Popconfirm | `pa-popconfirm` | Buttons & actions | ✓ | ✓ | ✓ |
| Table | `pa-table` | Data display | ✓ | ✓ | ✓ |
| Comparison table | `pa-comparison-table` | Data display | ✓ | ✓ | ✓ |
| List | `pa-list` | Data display | ✓ | ✓ | ✓ |
| Document | `pa-document` | Data display | ✓ | ✓ | ✓ |
| Sheet (printable document) | `pa-sheet` | Data display | ⚠ exp | ✓ | ✓ |
| Code block | `pa-code` | Data display | ✓ | ✓ | ✓ |
| Data display (field lists) | `pa-accent-grid` | Data display | ✓ | ✓ | ✓ |
| Statistics / stat cards | `pa-kpi-grid` | Data display | ✓ | ✓ | ✓ |
| Data-viz primitives | `pa-bar-list` | Data visualization | ✓ | ✗ | ✓ |
| KPI showcase — shared base | `pa-kpi-detail` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — terminal | `pa-kpi-tile` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — sparkline list | `pa-kpi-spark-dot` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — comparison gauges | `pa-kpi-gauge` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — hero + supporting | `pa-kpi-hero-list` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — bento | `pa-kpi-bento` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — numeric strip | `pa-kpi-strip` | Data visualization | ✓ | ✓ | ✓ |
| KPI showcase — editorial minimal | `pa-kpi-edit` | Data visualization | ✓ | ✓ | ✓ |
| Alert | `pa-alert` | Feedback | ✓ | ✓ | ✓ |
| Callout | `pa-callout` | Feedback | ✓ | ✓ | ✓ |
| Toast | `pa-toast` | Feedback | ✓ | ✓ | ✓ |
| Notifications | `pa-notifications` | Feedback | ✓ | ✓ | ✓ |
| Tooltip | `pa-tooltip` | Feedback | ✓ | ✓ | ✓ |
| Popover | `pa-popover` | Feedback | ✓ | ✓ | ✗ |
| Loaders / spinners | `pa-loader-bars` | Feedback | ✓ | ✓ | ✓ |
| Timeline | `pa-timeline` | Feedback | ✓ | ✓ | ✓ |
| Badge | `pa-badge` | Interactive & misc | ✓ | ✓ | ✓ |
| Label | `pa-label` | Interactive & misc | ✓ | ✓ | ✗ |
| Composite badge | `pa-composite-badge` | Interactive & misc | ✓ | ✓ | ✗ |
| Command palette | `pa-command-palette` | Interactive & misc | ✓ | ✓ | ✓ |
| Search results | `pa-search-results` | Interactive & misc | ✓ | ✓ | ✓ |
| Logic tree | `pa-logic-tree` | Interactive & misc | ✓ | ✗ | ✗ |
| File selector | `pa-file-dropzone` | Interactive & misc | ✓ | ✗ | ✓ |
| Icon | `pa-icon` | Interactive & misc | ✓ | ✓ | ✓ |
| Utilities & state hooks | `pa-font-responsive` | Utilities & state hooks | ✓ | ✓ | ✗ |

## Layout & shell

### Scroll lock — `pa-scroll-lock`

Body hook (utility) that locks background scroll while a drawer/overlay is open.

- **Blocks:** `pa-scroll-lock`
- **SCSS:** `core-components/_utilities.scss`
- **Snippet:** ✗ none
- **Demo:** ✗ none

## Surfaces

### Card — `pa-card`

Primary content surface. Canonical header = pa-card__title (icon optional) + pa-card__description; pa-card__actions is the one actions slot in header and footer.

- **Blocks:** `pa-card`
- **Elements:** `pa-card__actions`, `pa-card__actions-collapsed`, `pa-card__actions-full`, `pa-card__body`, `pa-card__description`, `pa-card__footer`, `pa-card__header`, `pa-card__meta`, `pa-card__tab`, `pa-card__tab-content`, `pa-card__tabs`, `pa-card__title`, `pa-card__title-icon`, `pa-card__title-text`
- **Modifiers / states:** `pa-card--danger`, `pa-card--ghost`, `pa-card--live-down`, `pa-card--live-neutral`, `pa-card--live-up`, `pa-card--primary`, `pa-card--stat`, `pa-card--success`, `pa-card--warning`, `pa-card__actions--overflow`, `pa-card__actions--responsive`, `pa-card__body--no-padding`, `pa-card__header--underline-danger`, `pa-card__header--underline-info`, `pa-card__header--underline-success`, `pa-card__header--underline-warning`, `pa-card__header--underlined`, `pa-card__header--wrap`, `pa-card__tab--active`, `pa-card__tab-content--active`, `pa-card__tabs--inline`
- **SCSS:** `core-components/_cards.scss`
- **Snippet:** `cards.html`
- **Demo:** `cards.mustache`

### Section — `pa-section`

Lightweight titled content grouping used inside cards/panels.

- **Blocks:** `pa-section`, `pa-section-title`
- **SCSS:** `core-components/_cards.scss`
- **Snippet:** `cards.html`
- **Demo:** ✗ none

### Splitter — `pa-splitter`

Resizable two-pane split with a draggable gutter and minimize-to-rail behaviour.

- **Blocks:** `pa-splitter`
- **Elements:** `pa-splitter__gutter`, `pa-splitter__pane`
- **Modifiers / states:** `pa-splitter--dragging`, `pa-splitter--horizontal`, `pa-splitter--minimize-mirror`, `pa-splitter--vertical`, `pa-splitter__gutter--active`, `pa-splitter__pane--end`, `pa-splitter__pane--minimized`, `pa-splitter__pane--start`
- **SCSS:** `core-components/_splitter.scss`
- **Snippet:** `splitter.html`
- **Demo:** `splitter.mustache`

### Modal — `pa-modal`

Dialog with backdrop, header/body/footer, size + severity + banded variants, scrollable body.

- **Blocks:** `pa-modal`
- **Elements:** `pa-modal__backdrop`, `pa-modal__body`, `pa-modal__container`, `pa-modal__footer`, `pa-modal__header`, `pa-modal__title`
- **Modifiers / states:** `pa-modal--banded`, `pa-modal--danger`, `pa-modal--info`, `pa-modal--primary`, `pa-modal--show`, `pa-modal--success`, `pa-modal--top`, `pa-modal--warning`, `pa-modal__body--scrollable`, `pa-modal__container--fw`, `pa-modal__container--lg`, `pa-modal__container--sm`, `pa-modal__container--xl`, `pa-modal__container--xxl`
- **SCSS:** `core-components/_modals.scss`
- **Snippet:** `modal-dialogs.html`, `modals.html`
- **Demo:** `modal-dialogs.mustache`, `modals.mustache`

### Tabs — `pa-tabs`

Tabbed panels with vertical, scrollable and overflow-menu overflow handling, plus opt-in multi-line wrap-labels.

- **Blocks:** `pa-tabs`
- **Elements:** `pa-tabs__container`, `pa-tabs__content`, `pa-tabs__item`, `pa-tabs__overflow`, `pa-tabs__overflow-menu`, `pa-tabs__overflow-toggle`, `pa-tabs__panel`, `pa-tabs__scroll-btn`, `pa-tabs__scroll-container`, `pa-tabs__vertical-layout`
- **Modifiers / states:** `pa-tabs--border-top`, `pa-tabs--boxed`, `pa-tabs--centered`, `pa-tabs--collapse`, `pa-tabs--full`, `pa-tabs--lg`, `pa-tabs--nowrap`, `pa-tabs--pills`, `pa-tabs--scrollable`, `pa-tabs--sm`, `pa-tabs--vertical`, `pa-tabs--wrap-labels`, `pa-tabs__container--bordered`, `pa-tabs__container--card`, `pa-tabs__item--active`, `pa-tabs__overflow-menu--open`, `pa-tabs__overflow-toggle--has-active`, `pa-tabs__panel--active`, `pa-tabs__scroll-btn--end`, `pa-tabs__scroll-btn--start`, `pa-tabs__scroll-btn--visible`, `pa-tabs__vertical-layout--bordered`
- **SCSS:** `core-components/_profile.scss`, `core-components/_tabs.scss`
- **Snippet:** `tabs.html`
- **Demo:** `tabs.mustache`

### Detail panel — `pa-detail-panel-resize`

Slide-in / docked detail panel (with mobile overlay + drag-resize) and its detail-view master/panel layout.

- **Blocks:** `pa-detail-panel-resize`, `pa-detail-panel-resizing`, `pa-detail-view`
- **Elements:** `pa-detail-panel__body`, `pa-detail-panel__close`, `pa-detail-panel__content`, `pa-detail-panel__footer`, `pa-detail-panel__header`, `pa-detail-panel__overlay`, `pa-detail-panel__tabs`, `pa-detail-panel__title`, `pa-detail-view__main`, `pa-detail-view__overlay`, `pa-detail-view__panel`
- **Modifiers / states:** `pa-detail-panel--mobile-overlay`, `pa-detail-panel--open`, `pa-detail-panel--overlay`, `pa-detail-panel-resize--active`, `pa-detail-panel__content--bordered`, `pa-detail-view--overlay`, `pa-detail-view__overlay--visible`, `pa-detail-view__panel--open`
- **SCSS:** `core-components/_detail-panel.scss`, `core-components/_tables.scss`
- **Snippet:** `detail-panel.html`
- **Demo:** `detail-panel.mustache`

### Profile panel — `pa-profile-panel`

User profile slide-over with avatar, tabs, and overlay.

- **Blocks:** `pa-profile-panel`
- **Elements:** `pa-profile-panel__actions`, `pa-profile-panel__avatar`, `pa-profile-panel__avatar-icon`, `pa-profile-panel__body`, `pa-profile-panel__close`, `pa-profile-panel__content`, `pa-profile-panel__email`, `pa-profile-panel__favorite-icon`, `pa-profile-panel__favorite-item`, `pa-profile-panel__favorite-label`, `pa-profile-panel__favorite-remove`, `pa-profile-panel__favorites`, `pa-profile-panel__favorites-add`, `pa-profile-panel__footer`, `pa-profile-panel__header`, `pa-profile-panel__info`, `pa-profile-panel__name`, `pa-profile-panel__nav`, `pa-profile-panel__nav-icon`, `pa-profile-panel__nav-item`, `pa-profile-panel__overlay`, `pa-profile-panel__tab-text`, `pa-profile-panel__tabs`
- **Modifiers / states:** `pa-profile-panel--open`, `pa-profile-panel__header--no-avatar`, `pa-profile-panel__tabs--icon-only`
- **SCSS:** `core-components/_print.scss`, `core-components/_profile.scss`
- **Snippet:** `profile.html`
- **Demo:** ✗ none

### Settings panel — `pa-settings-panel`

Settings drawer with a toggle trigger.

- **Blocks:** `pa-settings-panel`
- **Elements:** `pa-settings-panel__checkbox`, `pa-settings-panel__checkbox-group`, `pa-settings-panel__content`, `pa-settings-panel__hint`, `pa-settings-panel__label`, `pa-settings-panel__section`, `pa-settings-panel__select`, `pa-settings-panel__title`, `pa-settings-panel__toggle`
- **Modifiers / states:** `pa-settings-panel--open`
- **SCSS:** `core-components/_print.scss`, `core-components/_settings-panel.scss`
- **Snippet:** ✗ none
- **Demo:** ✗ none

### Table card — `pa-table-card`

Card wrapper specialised for tables: header/actions/body/footer chrome around a data table.

- **Blocks:** `pa-table-card`
- **Elements:** `pa-table-card__actions`, `pa-table-card__body`, `pa-table-card__description`, `pa-table-card__footer`, `pa-table-card__header`, `pa-table-card__title`, `pa-table-card__title-text`
- **Modifiers / states:** `pa-table-card--danger`, `pa-table-card--plain`, `pa-table-card--primary`, `pa-table-card--success`, `pa-table-card--warning`, `pa-table-card__body--scrollable`
- **SCSS:** `core-components/_tables.scss`
- **Snippet:** `tables.html`
- **Demo:** ✗ none

## Forms

### Form layout — `pa-form`

Form grouping/layout: groups, horizontal layout, validation state, help text, actions row.

- **Blocks:** `pa-form`, `pa-form-actions`, `pa-form-group`, `pa-form-help`
- **Modifiers / states:** `pa-form-group--error`, `pa-form-group--horizontal`, `pa-form-group--required`, `pa-form-group--success`, `pa-form-group--warning`, `pa-form-help--error`, `pa-form-help--success`, `pa-form-help--warning`
- **SCSS:** `core-components/_utilities.scss`, `core-components/forms/_form-layout.scss`, `core-components/forms/_form-states.scss`
- **Snippet:** `forms.html`
- **Demo:** `form-demo.mustache`, `forms.mustache`

### Text input — `pa-input`

Single-line text input with size (xs–xl) and validation-colour variants.

- **Blocks:** `pa-input`
- **Modifiers / states:** `pa-input--error`, `pa-input--lg`, `pa-input--sm`, `pa-input--success`, `pa-input--warning`, `pa-input--xl`, `pa-input--xs`
- **SCSS:** `core-components/forms/_form-inputs.scss`, `core-components/forms/_form-states.scss`, `core-components/forms/_input-groups.scss`, `core-components/forms/_input-wrapper.scss`
- **Snippet:** `forms.html`
- **Demo:** `inputs.mustache`

### Textarea — `pa-textarea`

Multi-line text input with size variants.

- **Blocks:** `pa-textarea`
- **Modifiers / states:** `pa-textarea--lg`, `pa-textarea--sm`, `pa-textarea--xl`, `pa-textarea--xs`
- **SCSS:** `core-components/forms/_form-inputs.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Select — `pa-select`

Native select styled with size + validation-colour variants.

- **Blocks:** `pa-select`
- **Modifiers / states:** `pa-select--error`, `pa-select--lg`, `pa-select--sm`, `pa-select--success`, `pa-select--warning`, `pa-select--xl`, `pa-select--xs`
- **SCSS:** `core-components/forms/_form-inputs.scss`, `core-components/forms/_form-states.scss`, `core-components/forms/_input-wrapper.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Input group — `pa-input-group`

Input with prepend/append addons.

- **Blocks:** `pa-input-group`
- **Elements:** `pa-input-group__append`, `pa-input-group__button`, `pa-input-group__prepend`
- **Modifiers / states:** `pa-input-group--lg`, `pa-input-group--sm`, `pa-input-group--xl`, `pa-input-group--xs`
- **SCSS:** `core-components/forms/_input-groups.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Input wrapper / token field — `pa-input-wrapper`

Wrapper enabling token/tag inputs and virtual-scroll textboxes (search token chips + remove).

- **Blocks:** `pa-input-wrapper`, `pa-search-token-group`, `pa-search-token-remove`, `pa-search-tokens`, `pa-virtual-textbox`
- **Elements:** `pa-input-wrapper__clear`
- **Modifiers / states:** `pa-input-wrapper__clear--hidden`
- **SCSS:** `core-components/forms/_input-wrapper.scss`, `core-components/forms/_query-editor.scss`
- **Snippet:** `forms.html`
- **Demo:** `search.mustache`

### Checkbox — `pa-checkbox`

Custom-styled checkbox (box + label) and checkbox group.

- **Blocks:** `pa-checkbox`, `pa-checkbox-group`
- **Elements:** `pa-checkbox__box`, `pa-checkbox__label`
- **Modifiers / states:** `pa-checkbox--disabled`, `pa-checkbox--label-end`, `pa-checkbox--label-start`, `pa-checkbox--label-top`, `pa-checkbox--lg`, `pa-checkbox--sm`, `pa-checkbox--x`, `pa-checkbox--xl`, `pa-checkbox--xs`, `pa-checkbox-group--2col`, `pa-checkbox-group--3col`, `pa-checkbox-group--grid`, `pa-checkbox-group--horizontal`
- **SCSS:** `core-components/_checkbox-lists.scss`, `core-components/forms/_checkboxes-radios.scss`
- **Snippet:** `checkbox-lists.html`
- **Demo:** `checkbox-lists.mustache`

### Radio — `pa-radio`

Custom-styled radio and radio group.

- **Blocks:** `pa-radio`, `pa-radio-group`
- **Elements:** `pa-radio__label`
- **Modifiers / states:** `pa-radio--label-end`, `pa-radio--label-start`, `pa-radio--label-top`, `pa-radio--lg`, `pa-radio--sm`, `pa-radio--xl`, `pa-radio--xs`, `pa-radio-group--2col`, `pa-radio-group--3col`, `pa-radio-group--grid`, `pa-radio-group--horizontal`
- **SCSS:** `core-components/forms/_checkboxes-radios.scss`
- **Snippet:** `forms.html`
- **Demo:** ✗ none

### Checkbox list — `pa-checkbox-list`

Selectable list of checkbox items with grid/columns/compact/striped/bordered layouts and per-item disabled/locked/selected states.

- **Blocks:** `pa-checkbox-list`
- **Elements:** `pa-checkbox-list__actions`, `pa-checkbox-list__checkbox`, `pa-checkbox-list__description`, `pa-checkbox-list__item`, `pa-checkbox-list__label`, `pa-checkbox-list__text`
- **Modifiers / states:** `pa-checkbox-list--2col`, `pa-checkbox-list--3col`, `pa-checkbox-list--bordered`, `pa-checkbox-list--compact`, `pa-checkbox-list--grid`, `pa-checkbox-list--inline`, `pa-checkbox-list--striped`, `pa-checkbox-list__item--disabled`, `pa-checkbox-list__item--locked`, `pa-checkbox-list__item--selected`
- **SCSS:** `core-components/_checkbox-lists.scss`
- **Snippet:** `checkbox-lists.html`
- **Demo:** `checkbox-lists.mustache`

### Range slider — `pa-range`

Single/dual-thumb range slider with configurable handle styles, ticks and labels.

- **Blocks:** `pa-range`
- **Elements:** `pa-range__fill`, `pa-range__rail`, `pa-range__thumb`, `pa-range__tick`, `pa-range__tick-label`, `pa-range__tick-labels`, `pa-range__ticks`, `pa-range__track`
- **Modifiers / states:** `pa-range--disabled`, `pa-range--handle-arrow`, `pa-range--handle-bar`, `pa-range--handle-needle`, `pa-range--handle-rect`, `pa-range--single`, `pa-range--ticks-labeled`, `pa-range__thumb--grabbing`, `pa-range__thumb--min`, `pa-range__tick--major`
- **SCSS:** `core-components/_range-group.scss`
- **Snippet:** `range-group.html`
- **Demo:** `range-group.mustache`

### Range group — `pa-range-group`

Popover panel grouping multiple range sliders with a summary row.

- **Blocks:** `pa-range-group`
- **Elements:** `pa-range-group__actions`, `pa-range-group__caret`, `pa-range-group__panel`, `pa-range-group__row`, `pa-range-group__row-head`, `pa-range-group__row-label`, `pa-range-group__row-value`, `pa-range-group__seg-label`, `pa-range-group__seg-sep`, `pa-range-group__seg-value`, `pa-range-group__summary`, `pa-range-group__toggle`
- **Modifiers / states:** `pa-range-group--open`, `pa-range-group__panel--open`, `pa-range-group__row-value--empty`, `pa-range-group__seg-value--empty`
- **SCSS:** `core-components/_range-group.scss`
- **Snippet:** `range-group.html`
- **Demo:** `range-group.mustache`

### Inline query editor — `pa-inline-query-autocomplete`

Tokenised inline query/filter editor with autocomplete and match highlighting.

- **Blocks:** `pa-inline-query-autocomplete`, `pa-inline-query-editor`, `pa-inline-query-token`, `pa-search-highlight`
- **Elements:** `pa-inline-query-autocomplete__item`, `pa-inline-query-autocomplete__item-badge`, `pa-inline-query-autocomplete__item-content`, `pa-inline-query-autocomplete__item-icon`, `pa-inline-query-autocomplete__item-name`, `pa-inline-query-autocomplete__item-type`, `pa-inline-query-editor__highlights`, `pa-inline-query-editor__input`, `pa-inline-query-editor__layers`, `pa-search-highlight__field`, `pa-search-highlight__input`, `pa-search-highlight__operator`, `pa-search-highlight__overlay`
- **Modifiers / states:** `pa-inline-query-autocomplete__item--active`, `pa-inline-query-token--field`, `pa-inline-query-token--invalid`, `pa-inline-query-token--keyword`, `pa-inline-query-token--operator`, `pa-inline-query-token--value`
- **SCSS:** `core-components/forms/_query-editor.scss`
- **Snippet:** `forms.html`
- **Demo:** `search.mustache`

### Filter card — `pa-filter-card`

Card of filter controls with advanced/collapsed rows and loading/disabled states.

- **Blocks:** —
- **Elements:** `pa-filter-card__actions`, `pa-filter-card__advanced`, `pa-filter-card__advanced-actions`, `pa-filter-card__filters`, `pa-filter-card__row`
- **Modifiers / states:** `pa-filter-card--disabled`, `pa-filter-card--loading`
- **SCSS:** `core-components/_filter-card.scss`
- **Snippet:** `filter-card.html`
- **Demo:** ✗ none

## Buttons & actions

### Button — `pa-btn`

Buttons (icon/label/spinner, xs–xl, ripple), button groups, split buttons with menus, and the priority-overflow trigger.

- **Blocks:** `pa-btn`, `pa-btn-group`, `pa-btn-split`, `pa-overflow`
- **Elements:** `pa-btn-split__chevron`, `pa-btn-split__group-label`, `pa-btn-split__item`, `pa-btn-split__item-icon`, `pa-btn-split__item-row`, `pa-btn-split__menu`, `pa-btn-split__menu-inner`, `pa-btn-split__toggle`, `pa-btn__icon`, `pa-btn__label`, `pa-btn__spinner`
- **Modifiers / states:** `pa-btn--align-center`, `pa-btn--align-end`, `pa-btn--align-justify`, `pa-btn--align-start`, `pa-btn--block`, `pa-btn--danger`, `pa-btn--dark`, `pa-btn--disabled`, `pa-btn--ghost`, `pa-btn--icon-only`, `pa-btn--info`, `pa-btn--lg`, `pa-btn--light`, `pa-btn--loading`, `pa-btn--outline-danger`, `pa-btn--outline-info`, `pa-btn--outline-primary`, `pa-btn--outline-secondary`, `pa-btn--outline-success`, `pa-btn--outline-warning`, `pa-btn--primary`, `pa-btn--ripple`, `pa-btn--ripple-active`, `pa-btn--secondary`, `pa-btn--sm`, `pa-btn--success`, `pa-btn--warning`, `pa-btn--xl`, `pa-btn--xs`, `pa-btn-group--nowrap`, `pa-btn-group--vertical`, `pa-btn-split--in-overflow`, `pa-btn-split--open`, `pa-btn-split__item--danger`, `pa-btn-split__menu--open`
- **SCSS:** `core-components/_buttons.scss`, `core-components/_cards.scss`, `core-components/_icons.scss`, `core-components/_overflow.scss`, `core-components/_popconfirm.scss`, `core-components/_tables.scss`
- **Snippet:** `buttons.html`
- **Demo:** `buttons.mustache`, `overflow.mustache`

### Pager — `pa-load-more`

Pagination controls and a load-more button with spinner.

- **Blocks:** `pa-load-more`, `pa-pager`
- **Elements:** `pa-load-more__button`, `pa-load-more__count`, `pa-load-more__spinner`, `pa-load-more__text`, `pa-pager__container`, `pa-pager__controls`, `pa-pager__info`, `pa-pager__input`, `pa-pager__text`
- **Modifiers / states:** `pa-load-more--center`, `pa-load-more--end`, `pa-load-more--start`, `pa-load-more__button--loading`, `pa-pager--center`, `pa-pager--end`, `pa-pager--start`
- **SCSS:** `core-components/_pagers.scss`
- **Snippet:** `tables.html`
- **Demo:** `pagers.mustache`

### Popconfirm — `pa-popconfirm`

Inline confirmation popover anchored to an action, with placement + compact variants.

- **Blocks:** `pa-popconfirm`
- **Elements:** `pa-popconfirm__actions`, `pa-popconfirm__arrow`, `pa-popconfirm__content`, `pa-popconfirm__icon`, `pa-popconfirm__message`
- **Modifiers / states:** `pa-popconfirm--bottom`, `pa-popconfirm--compact`, `pa-popconfirm--end`, `pa-popconfirm--start`, `pa-popconfirm--top`, `pa-popconfirm__icon--danger`, `pa-popconfirm__icon--info`, `pa-popconfirm__icon--warning`
- **SCSS:** `core-components/_popconfirm.scss`
- **Snippet:** `popconfirm.html`
- **Demo:** `popconfirm.mustache`

## Data display

### Table — `pa-table`

Data tables: striped, responsive (stacked + grid), row selection, checkbox column, container/panel chrome, and virtual-scroll table.

- **Blocks:** `pa-table`, `pa-table-container`, `pa-virtual-table`
- **Elements:** `pa-table-container__actions`, `pa-table-container__header`, `pa-table-container__title`, `pa-table__checkbox-col`, `pa-table__item-desc`, `pa-table__item-title`, `pa-virtual-table__body`, `pa-virtual-table__cell`, `pa-virtual-table__header`, `pa-virtual-table__header-cell`, `pa-virtual-table__row`
- **Modifiers / states:** `pa-table--bordered`, `pa-table--lg`, `pa-table--plain`, `pa-table--responsive`, `pa-table--responsive-grid`, `pa-table--sm`, `pa-table--striped`, `pa-table--xl`, `pa-table--xs`, `pa-table-container--panel`, `pa-table__row--selected`
- **SCSS:** `core-components/_checkbox-lists.scss`, `core-components/_detail-panel.scss`, `core-components/_document.scss`, `core-components/_sheet.scss`, `core-components/_tables.scss`, `core-components/_utilities.scss`
- **Snippet:** `tables.html`, `virtual-scroll.html`
- **Demo:** `table-filters.mustache`, `table-multi-select.mustache`, `tables.mustache`

### Comparison table — `pa-comparison-table`

Side-by-side feature/plan comparison table.

- **Blocks:** `pa-comparison-table`
- **Elements:** `pa-comparison-table__changed`, `pa-comparison-table__conflict`, `pa-comparison-table__copy`, `pa-comparison-table__label`, `pa-comparison-table__section`, `pa-comparison-table__value`
- **Modifiers / states:** `pa-comparison-table__changed--solid`, `pa-comparison-table__conflict--solid`
- **SCSS:** `core-components/_comparison.scss`
- **Snippet:** `comparison.html`
- **Demo:** `comparison.mustache`

### List — `pa-list`

Styled basic / ordered / definition lists with severity variants.

- **Blocks:** `pa-list`, `pa-list-basic`, `pa-list-definition`, `pa-list-ordered`
- **Elements:** `pa-list__avatar`, `pa-list__content`, `pa-list__item`, `pa-list__meta`, `pa-list__subtitle`, `pa-list__title`
- **Modifiers / states:** `pa-list-basic--bordered`, `pa-list-basic--compact`, `pa-list-basic--danger`, `pa-list-basic--icon`, `pa-list-basic--info`, `pa-list-basic--inline`, `pa-list-basic--spacious`, `pa-list-basic--striped`, `pa-list-basic--unstyled`, `pa-list-basic--warning`, `pa-list-definition--inline`, `pa-list-ordered--alpha`, `pa-list-ordered--roman`
- **SCSS:** `core-components/_lists.scss`
- **Snippet:** `lists.html`
- **Demo:** `lists.mustache`

### Document — `pa-document`

Word-style hierarchical, auto-numbered sections (1, 1.1, 1.1.1 …): a heading plus body text, sections nested directly to build the outline. Numbers are generated by per-depth CSS counters; a --manual modifier switches to author-written numbers.

- **Blocks:** `pa-document`
- **Elements:** `pa-document__heading`, `pa-document__number`, `pa-document__section`, `pa-document__text`
- **Modifiers / states:** `pa-document--compact`, `pa-document--flush`, `pa-document--spacious`
- **SCSS:** `core-components/_document.scss`
- **Snippet:** `document.html`
- **Demo:** `document.mustache`

### Sheet (printable document) — `pa-sheet`

> ⚠ **Experimental.** Class names, modifiers and markup shape are still stabilising and may change in upcoming releases — pin an exact version if you build on it. Covers pa-sheet and the form primitives shown with it (pc-grid, pa-table--plain, print colour modes, rotation / vertical-text utilities).

Printable A4 "paper" shell for invoices, orders, quotes, receipts and payment reminders. A centred white page with a screen-only shadow and a built-in @media print layer (+ @page A4), plus invoice-shaped regions — masthead, parties, meta, totals, notes, footer/signatures, legal. Line items reuse pa-table; label/value metadata reuse pa-fields / pa-desc-table.

- **Blocks:** `pa-sheet`
- **Elements:** `pa-sheet__barcode`, `pa-sheet__brand`, `pa-sheet__docmeta`, `pa-sheet__doctitle`, `pa-sheet__footer`, `pa-sheet__legal`, `pa-sheet__logo`, `pa-sheet__masthead`, `pa-sheet__meta`, `pa-sheet__meta-label`, `pa-sheet__meta-value`, `pa-sheet__notes`, `pa-sheet__pageno`, `pa-sheet__parties`, `pa-sheet__party`, `pa-sheet__party-body`, `pa-sheet__party-label`, `pa-sheet__party-name`, `pa-sheet__qr`, `pa-sheet__qr-label`, `pa-sheet__sign`, `pa-sheet__signatures`, `pa-sheet__title`, `pa-sheet__total-label`, `pa-sheet__total-row`, `pa-sheet__total-value`, `pa-sheet__totals`
- **Modifiers / states:** `pa-sheet--compact`, `pa-sheet--fill`, `pa-sheet--fluid`, `pa-sheet--framed`, `pa-sheet--landscape`, `pa-sheet--print-color`, `pa-sheet--print-grayscale`, `pa-sheet--spacious`, `pa-sheet__masthead--ruled`, `pa-sheet__meta--boxed`, `pa-sheet__parties--cols-3`, `pa-sheet__party--boxed`, `pa-sheet__party--strong`, `pa-sheet__total-row--grand`, `pa-sheet__totals--start`
- **SCSS:** `core-components/_sheet.scss`
- **Snippet:** `sheet.html`
- **Demo:** `sheet.mustache`

### Code block — `pa-code`

Inline + block code with syntax-token classes (keyword/string/number/function/property/comment).

- **Blocks:** `pa-code`, `pa-code-block`, `pa-code-comment`, `pa-code-function`, `pa-code-keyword`, `pa-code-number`, `pa-code-property`, `pa-code-string`
- **Elements:** `pa-code-block__body`, `pa-code-block__header`, `pa-code-block__title`
- **Modifiers / states:** `pa-code--bash`, `pa-code--compact`, `pa-code--css`, `pa-code--html`, `pa-code--javascript`, `pa-code--json`, `pa-code--numbered`, `pa-code--python`, `pa-code--sql`
- **SCSS:** `core-components/_code.scss`
- **Snippet:** `code.html`
- **Demo:** `code.mustache`

### Data display (field lists) — `pa-accent-grid`

Label/value field lists, description tables, dot-leader rows, property cards, accent grids and banded containers.

- **Blocks:** `pa-accent-grid`, `pa-banded`, `pa-banded-container`, `pa-desc-container`, `pa-desc-table`, `pa-dot-leaders`, `pa-field`, `pa-field-group`, `pa-fields`, `pa-fields-container`, `pa-prop-card`
- **Elements:** `pa-accent-grid__copy`, `pa-accent-grid__item`, `pa-accent-grid__label`, `pa-accent-grid__value`, `pa-banded__copy`, `pa-banded__label`, `pa-banded__row`, `pa-banded__value`, `pa-desc-table__copy`, `pa-desc-table__label`, `pa-desc-table__value`, `pa-dot-leaders__item`, `pa-dot-leaders__label`, `pa-dot-leaders__leader`, `pa-dot-leaders__value`, `pa-field-group__title`, `pa-field__copy`, `pa-field__label`, `pa-field__value`, `pa-prop-card__copy`, `pa-prop-card__header`, `pa-prop-card__label`, `pa-prop-card__row`, `pa-prop-card__value`
- **Modifiers / states:** `pa-accent-grid__item--copied`, `pa-accent-grid__item--copy-btn`, `pa-accent-grid__item--copy-click`, `pa-accent-grid__item--copy-hover`, `pa-accent-grid__item--danger`, `pa-accent-grid__item--info`, `pa-accent-grid__item--success`, `pa-accent-grid__item--warning`, `pa-banded--label-center`, `pa-banded--label-end`, `pa-banded--middle`, `pa-banded--narrow`, `pa-banded--truncate`, `pa-banded--value-center`, `pa-banded--value-end`, `pa-banded--wide`, `pa-banded__row--copied`, `pa-banded__row--copy-btn`, `pa-banded__row--copy-click`, `pa-banded__row--copy-hover`, `pa-desc-table--cols-2`, `pa-desc-table--fixed`, `pa-desc-table--label-center`, `pa-desc-table--label-end`, `pa-desc-table--middle`, `pa-desc-table--truncate`, `pa-desc-table--value-center`, `pa-desc-table--value-end`, `pa-desc-table__value--copied`, `pa-desc-table__value--copy-btn`, `pa-desc-table__value--copy-click`, `pa-desc-table__value--copy-hover`, `pa-desc-table__value--full`, `pa-dot-leaders__item--total`, `pa-field--copied`, `pa-field--copy-btn`, `pa-field--copy-click`, `pa-field--copy-hover`, `pa-field--full`, `pa-field__value--danger`, `pa-field__value--info`, `pa-field__value--success`, `pa-field__value--warning`, `pa-fields--bordered`, `pa-fields--chips`, `pa-fields--cols-2`, `pa-fields--cols-3`, `pa-fields--cols-4`, `pa-fields--compact`, `pa-fields--filled`, `pa-fields--horizontal`, `pa-fields--inline`, `pa-fields--linear`, `pa-fields--no-border`, `pa-fields--relaxed`, `pa-fields--row`, `pa-fields--striped`, `pa-fields--table`, `pa-prop-card__row--copy-btn`, `pa-prop-card__row--copy-click`, `pa-prop-card__row--copy-hover`, `pa-prop-card__value--bold`
- **SCSS:** `core-components/_data-display.scss`
- **Snippet:** `data-display.html`
- **Demo:** `data-display.mustache`, `data-display-2.mustache`

### Statistics / stat cards — `pa-kpi-grid`

Stat blocks (value/label/change/context, severity variants, fit sizing) and the KPI grid layout.

- **Blocks:** `pa-kpi-grid`, `pa-stat`
- **Elements:** `pa-stat__change`, `pa-stat__content`, `pa-stat__context`, `pa-stat__group`, `pa-stat__icon`, `pa-stat__label`, `pa-stat__meta`, `pa-stat__number`, `pa-stat__slot`, `pa-stat__symbol`, `pa-stat__value`
- **Modifiers / states:** `pa-stat--danger`, `pa-stat--fit-wide`, `pa-stat--hero`, `pa-stat--hero-compact`, `pa-stat--info`, `pa-stat--primary`, `pa-stat--secondary`, `pa-stat--square`, `pa-stat--success`, `pa-stat--warning`, `pa-stat__change--negative`, `pa-stat__change--neutral`, `pa-stat__change--positive`, `pa-stat__change--very-negative`, `pa-stat__change--very-positive`, `pa-stat__icon--danger`, `pa-stat__icon--info`, `pa-stat__icon--primary`, `pa-stat__icon--success`, `pa-stat__icon--warning`
- **SCSS:** `core-components/_statistics.scss`
- **Snippet:** `kpi.html`, `statistics.html`
- **Demo:** `stat-fit-lab.mustache`

## Data visualization

### Data-viz primitives — `pa-bar-list`

Inline chart primitives: bar list, data bar, gauge, heatmap, progress (bar/group/ring), sparkline, stacked bar.

- **Blocks:** `pa-bar-list`, `pa-data-bar`, `pa-gauge`, `pa-heatmap`, `pa-progress`, `pa-progress-group`, `pa-progress-ring`, `pa-sparkline`, `pa-stacked-bar`
- **Elements:** `pa-bar-list__bar`, `pa-bar-list__header`, `pa-bar-list__item`, `pa-bar-list__label`, `pa-bar-list__value`, `pa-data-bar__fill`, `pa-data-bar__track`, `pa-data-bar__value`, `pa-gauge__inner`, `pa-gauge__label`, `pa-gauge__max`, `pa-gauge__min`, `pa-gauge__value`, `pa-heatmap__cell`, `pa-heatmap__legend`, `pa-heatmap__legend-cell`, `pa-progress-ring__inner`, `pa-progress-ring__label`, `pa-progress-ring__value`, `pa-progress__fill`, `pa-progress__label`, `pa-progress__label-value`, `pa-sparkline__bar`, `pa-stacked-bar__legend`, `pa-stacked-bar__legend-item`, `pa-stacked-bar__legend-swatch`, `pa-stacked-bar__segment`
- **Modifiers / states:** `pa-bar-list--compact`, `pa-bar-list--danger`, `pa-bar-list--info`, `pa-bar-list--success`, `pa-bar-list--warning`, `pa-data-bar--danger`, `pa-data-bar--info`, `pa-data-bar--negative`, `pa-data-bar--success`, `pa-data-bar--warning`, `pa-gauge--danger`, `pa-gauge--info`, `pa-gauge--success`, `pa-gauge--warning`, `pa-gauge--zones`, `pa-heatmap--compact`, `pa-heatmap--danger`, `pa-heatmap--success`, `pa-progress--animated`, `pa-progress--danger`, `pa-progress--info`, `pa-progress--lg`, `pa-progress--rounded`, `pa-progress--sm`, `pa-progress--striped`, `pa-progress--success`, `pa-progress--warning`, `pa-progress--xs`, `pa-progress-ring--danger`, `pa-progress-ring--info`, `pa-progress-ring--lg`, `pa-progress-ring--sm`, `pa-progress-ring--success`, `pa-progress-ring--warning`, `pa-sparkline--danger`, `pa-sparkline--info`, `pa-sparkline--lg`, `pa-sparkline--sm`, `pa-sparkline--success`, `pa-sparkline--warning`, `pa-stacked-bar--lg`, `pa-stacked-bar--rounded`, `pa-stacked-bar--sm`, `pa-stacked-bar__legend-swatch--danger`, `pa-stacked-bar__legend-swatch--info`, `pa-stacked-bar__legend-swatch--primary`, `pa-stacked-bar__legend-swatch--secondary`, `pa-stacked-bar__legend-swatch--success`, `pa-stacked-bar__legend-swatch--warning`, `pa-stacked-bar__segment--danger`, `pa-stacked-bar__segment--info`, `pa-stacked-bar__segment--secondary`, `pa-stacked-bar__segment--success`, `pa-stacked-bar__segment--warning`
- **SCSS:** `core-components/_data-viz.scss`
- **Snippet:** ✗ none
- **Demo:** `data-visualization.mustache`

### KPI showcase — shared base — `pa-kpi-detail`

Shared KPI chrome (header/footer/detail/live/section head) used across the seven KPI showcase designs.

- **Blocks:** `pa-kpi-detail`, `pa-kpi-footer`, `pa-kpi-header`, `pa-kpi-live`, `pa-kpi-sectionhead`
- **Elements:** `pa-kpi-detail__title`, `pa-kpi-live__dot`
- **SCSS:** `core-components/_kpi-base.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-dashboard.mustache`

### KPI showcase — terminal — `pa-kpi-tile`

Terminal-style KPI grid with tiles.

- **Blocks:** `pa-kpi-tile`
- **Elements:** `pa-kpi-terminal__body`, `pa-kpi-terminal__controls`, `pa-kpi-terminal__grid`, `pa-kpi-terminal__pane`, `pa-kpi-terminal__tab`, `pa-kpi-terminal__tabs`, `pa-kpi-tile__delta`, `pa-kpi-tile__head`, `pa-kpi-tile__id`, `pa-kpi-tile__label`, `pa-kpi-tile__num`, `pa-kpi-tile__prev`, `pa-kpi-tile__spark`, `pa-kpi-tile__status`, `pa-kpi-tile__unit`, `pa-kpi-tile__value`, `pa-kpi-tile__values`
- **Modifiers / states:** `pa-kpi-terminal__grid--2col`, `pa-kpi-tile--down`, `pa-kpi-tile--down-strong`, `pa-kpi-tile--flat`, `pa-kpi-tile--standalone`, `pa-kpi-tile--up`, `pa-kpi-tile--up-strong`, `pa-kpi-tile__delta--negative`, `pa-kpi-tile__delta--neutral`, `pa-kpi-tile__delta--positive`, `pa-kpi-tile__delta--very-negative`, `pa-kpi-tile__delta--very-positive`, `pa-kpi-tile__status--good`, `pa-kpi-tile__status--neutral`, `pa-kpi-tile__status--warn`, `pa-kpi-tile__value--negative`, `pa-kpi-tile__value--neutral`, `pa-kpi-tile__value--positive`, `pa-kpi-tile__value--very-negative`, `pa-kpi-tile__value--very-positive`
- **SCSS:** `core-components/_kpi-terminal.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-terminal-grid.mustache`

### KPI showcase — sparkline list — `pa-kpi-spark-dot`

KPI rows each with a sparkline, delta and value.

- **Blocks:** `pa-kpi-spark-dot`, `pa-kpi-spark-list`, `pa-kpi-spark-row`, `pa-kpi-spark-wrap`
- **Elements:** `pa-kpi-spark-list__body`, `pa-kpi-spark-row__chart`, `pa-kpi-spark-row__delta`, `pa-kpi-spark-row__label`, `pa-kpi-spark-row__num`, `pa-kpi-spark-row__unit`, `pa-kpi-spark-row__value`
- **Modifiers / states:** `pa-kpi-spark-list--chart-first`, `pa-kpi-spark-list--no-delta`, `pa-kpi-spark-row--down`, `pa-kpi-spark-row--down-strong`, `pa-kpi-spark-row--flat`, `pa-kpi-spark-row--up`, `pa-kpi-spark-row--up-strong`, `pa-kpi-spark-row__delta--negative`, `pa-kpi-spark-row__delta--neutral`, `pa-kpi-spark-row__delta--positive`, `pa-kpi-spark-row__delta--very-negative`, `pa-kpi-spark-row__delta--very-positive`
- **SCSS:** `core-components/_kpi-base.scss`, `core-components/_kpi-sparkline-list.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-sparkline-list.mustache`

### KPI showcase — comparison gauges — `pa-kpi-gauge`

KPI gauges laid out for comparison.

- **Blocks:** `pa-kpi-gauge`
- **Elements:** `pa-kpi-gauge-list__body`, `pa-kpi-gauge-list__grid`, `pa-kpi-gauge__bar`, `pa-kpi-gauge__fill`, `pa-kpi-gauge__head`, `pa-kpi-gauge__label`, `pa-kpi-gauge__num`, `pa-kpi-gauge__scale`, `pa-kpi-gauge__unit`, `pa-kpi-gauge__value`
- **Modifiers / states:** `pa-kpi-gauge--negative`, `pa-kpi-gauge--neutral`, `pa-kpi-gauge--positive`, `pa-kpi-gauge--warning`, `pa-kpi-gauge-list__grid--2col`, `pa-kpi-gauge-list__grid--max-2`, `pa-kpi-gauge-list__grid--max-3`, `pa-kpi-gauge-list__grid--max-4`, `pa-kpi-gauge-list__grid--max-5`, `pa-kpi-gauge-list__grid--max-6`
- **SCSS:** `core-components/_kpi-comparison-gauges.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-comparison-gauges.mustache`

### KPI showcase — hero + supporting — `pa-kpi-hero-list`

One hero KPI with a supporting rail of secondary KPIs.

- **Blocks:** `pa-kpi-hero-list`, `pa-kpi-hero-main`, `pa-kpi-hero-side`
- **Elements:** `pa-kpi-hero-list__body`, `pa-kpi-hero-list__layout`, `pa-kpi-hero-list__rail`, `pa-kpi-hero-main__chart`, `pa-kpi-hero-main__chart-svg`, `pa-kpi-hero-main__delta`, `pa-kpi-hero-main__label`, `pa-kpi-hero-main__meta`, `pa-kpi-hero-main__num`, `pa-kpi-hero-main__period`, `pa-kpi-hero-main__target`, `pa-kpi-hero-main__unit`, `pa-kpi-hero-main__value`, `pa-kpi-hero-side__delta`, `pa-kpi-hero-side__label`, `pa-kpi-hero-side__num`, `pa-kpi-hero-side__unit`, `pa-kpi-hero-side__value`
- **Modifiers / states:** `pa-kpi-hero-list__layout--hero-2-3`, `pa-kpi-hero-list__layout--hero-3-4`, `pa-kpi-hero-main--negative`, `pa-kpi-hero-main--neutral`, `pa-kpi-hero-main--positive`, `pa-kpi-hero-main--up-strong`, `pa-kpi-hero-side--negative`, `pa-kpi-hero-side--neutral`, `pa-kpi-hero-side--positive`, `pa-kpi-hero-side--up-strong`
- **SCSS:** `core-components/_kpi-hero-supporting.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-hero-supporting.mustache`

### KPI showcase — bento — `pa-kpi-bento`

Bento-grid arrangement of KPI tiles with a hero tile.

- **Blocks:** `pa-kpi-bento`, `pa-kpi-bento-tile`
- **Elements:** `pa-kpi-bento-tile__chart`, `pa-kpi-bento-tile__chart-svg`, `pa-kpi-bento-tile__delta`, `pa-kpi-bento-tile__label`, `pa-kpi-bento-tile__num`, `pa-kpi-bento-tile__unit`, `pa-kpi-bento-tile__value`, `pa-kpi-bento__body`, `pa-kpi-bento__grid`
- **Modifiers / states:** `pa-kpi-bento-tile--down-strong`, `pa-kpi-bento-tile--hero`, `pa-kpi-bento-tile--negative`, `pa-kpi-bento-tile--neutral`, `pa-kpi-bento-tile--positive`, `pa-kpi-bento-tile--up-strong`, `pa-kpi-bento__grid--5-tile`, `pa-kpi-bento__grid--hero-right`
- **SCSS:** `core-components/_kpi-bento.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-bento.mustache`

### KPI showcase — numeric strip — `pa-kpi-strip`

Dense horizontal strip of numeric KPIs with prev/target/delta.

- **Blocks:** —
- **Elements:** `pa-kpi-strip__bar`, `pa-kpi-strip__bar-pct`, `pa-kpi-strip__body`, `pa-kpi-strip__delta`, `pa-kpi-strip__fill`, `pa-kpi-strip__head`, `pa-kpi-strip__head-row`, `pa-kpi-strip__metric`, `pa-kpi-strip__now`, `pa-kpi-strip__num`, `pa-kpi-strip__prev`, `pa-kpi-strip__row`, `pa-kpi-strip__target`, `pa-kpi-strip__unit`
- **Modifiers / states:** `pa-kpi-strip--no-delta`, `pa-kpi-strip--no-prev`, `pa-kpi-strip--no-target`, `pa-kpi-strip__delta--down-strong`, `pa-kpi-strip__delta--negative`, `pa-kpi-strip__delta--neutral`, `pa-kpi-strip__delta--positive`, `pa-kpi-strip__delta--up-strong`, `pa-kpi-strip__head--delta`, `pa-kpi-strip__head--num`, `pa-kpi-strip__head--prev`, `pa-kpi-strip__head--target`
- **SCSS:** `core-components/_kpi-numeric-strip.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-numeric-strip.mustache`

### KPI showcase — editorial minimal — `pa-kpi-edit`

Minimal editorial KPI grid, sizeable to N columns.

- **Blocks:** —
- **Elements:** `pa-kpi-edit__body`, `pa-kpi-edit__delta`, `pa-kpi-edit__grid`, `pa-kpi-edit__label`, `pa-kpi-edit__meta`, `pa-kpi-edit__num`, `pa-kpi-edit__target`, `pa-kpi-edit__tile`, `pa-kpi-edit__unit`, `pa-kpi-edit__value`
- **Modifiers / states:** `pa-kpi-edit__delta--down-strong`, `pa-kpi-edit__delta--negative`, `pa-kpi-edit__delta--neutral`, `pa-kpi-edit__delta--positive`, `pa-kpi-edit__delta--up-strong`, `pa-kpi-edit__grid--2col`, `pa-kpi-edit__grid--max-2`, `pa-kpi-edit__grid--max-3`, `pa-kpi-edit__grid--max-4`, `pa-kpi-edit__grid--max-5`, `pa-kpi-edit__grid--max-6`
- **SCSS:** `core-components/_kpi-editorial-minimal.scss`
- **Snippet:** `kpi.html`
- **Demo:** `kpi-editorial-minimal.mustache`

## Feedback

### Alert — `pa-alert`

Inline severity alert with optional multiline content.

- **Blocks:** `pa-alert`
- **Elements:** `pa-alert__actions`, `pa-alert__close`, `pa-alert__content`, `pa-alert__heading`, `pa-alert__icon`, `pa-alert__list`
- **Modifiers / states:** `pa-alert--danger`, `pa-alert--dark`, `pa-alert--dismissible`, `pa-alert--info`, `pa-alert--lg`, `pa-alert--light`, `pa-alert--multiline`, `pa-alert--outline-danger`, `pa-alert--outline-info`, `pa-alert--outline-primary`, `pa-alert--outline-success`, `pa-alert--outline-warning`, `pa-alert--primary`, `pa-alert--secondary`, `pa-alert--sm`, `pa-alert--success`, `pa-alert--warning`, `pa-alert__heading--lg`
- **SCSS:** `core-components/_alerts.scss`
- **Snippet:** `alerts.html`
- **Demo:** `alerts.mustache`

### Callout — `pa-callout`

Bordered callout box for asides / notes.

- **Blocks:** `pa-callout`
- **Elements:** `pa-callout__content`, `pa-callout__heading`, `pa-callout__icon`
- **Modifiers / states:** `pa-callout--danger`, `pa-callout--info`, `pa-callout--lg`, `pa-callout--primary`, `pa-callout--secondary`, `pa-callout--sm`, `pa-callout--success`, `pa-callout--warning`
- **SCSS:** `core-components/_callouts.scss`
- **Snippet:** `callouts.html`
- **Demo:** `callouts.mustache`

### Toast — `pa-toast`

Transient toast notifications with severity + filled variants, progress bar, and logical-position container.

- **Blocks:** `pa-toast`, `pa-toast-container`
- **Elements:** `pa-toast__actions`, `pa-toast__close`, `pa-toast__content`, `pa-toast__icon`, `pa-toast__message`, `pa-toast__progress`, `pa-toast__title`
- **Modifiers / states:** `pa-toast--danger`, `pa-toast--filled-danger`, `pa-toast--filled-info`, `pa-toast--filled-primary`, `pa-toast--filled-success`, `pa-toast--filled-warning`, `pa-toast--hide`, `pa-toast--info`, `pa-toast--primary`, `pa-toast--show`, `pa-toast--success`, `pa-toast--warning`, `pa-toast-container--bottom-center`, `pa-toast-container--bottom-end`, `pa-toast-container--bottom-start`, `pa-toast-container--top-center`, `pa-toast-container--top-end`, `pa-toast-container--top-start`
- **SCSS:** `core-components/_print.scss`, `core-components/_toasts.scss`
- **Snippet:** `toasts.html`
- **Demo:** `toasts.mustache`

### Notifications — `pa-notifications`

Notification centre: bell badge, dropdown panel and full-page list of notification items.

- **Blocks:** `pa-notifications`
- **Elements:** `pa-notifications__actions`, `pa-notifications__badge`, `pa-notifications__btn`, `pa-notifications__content`, `pa-notifications__footer`, `pa-notifications__header`, `pa-notifications__icon`, `pa-notifications__icon-wrapper`, `pa-notifications__item`, `pa-notifications__list`, `pa-notifications__mark-read`, `pa-notifications__panel`, `pa-notifications__time`
- **Modifiers / states:** `pa-notifications__icon-wrapper--danger`, `pa-notifications__icon-wrapper--primary`, `pa-notifications__icon-wrapper--secondary`, `pa-notifications__icon-wrapper--success`, `pa-notifications__icon-wrapper--warning`, `pa-notifications__item--unread`, `pa-notifications__list--page`
- **SCSS:** `core-components/_notifications.scss`
- **Snippet:** `notifications.html`
- **Demo:** `notifications.mustache`

### Tooltip — `pa-tooltip`

CSS + floating tooltips with placement, severity and multiline variants.

- **Blocks:** `pa-tooltip`, `pa-tooltip-floating`
- **Modifiers / states:** `pa-tooltip--auto-flip-bottom`, `pa-tooltip--auto-flip-end`, `pa-tooltip--auto-flip-start`, `pa-tooltip--auto-flip-top`, `pa-tooltip--bottom`, `pa-tooltip--danger`, `pa-tooltip--end`, `pa-tooltip--floating`, `pa-tooltip--help`, `pa-tooltip--keyword`, `pa-tooltip--multiline`, `pa-tooltip--primary`, `pa-tooltip--start`, `pa-tooltip--success`, `pa-tooltip--warning`
- **SCSS:** `core-components/_tooltips.scss`
- **Snippet:** `tooltips.html`
- **Demo:** `tooltips.mustache`

### Popover — `pa-popover`

Generic anchored popover surface.

- **Blocks:** `pa-popover`
- **Elements:** `pa-popover__body`, `pa-popover__close`, `pa-popover__content`, `pa-popover__header`, `pa-popover__trigger`
- **Modifiers / states:** `pa-popover--center`, `pa-popover--end`, `pa-popover--lg`, `pa-popover--sm`
- **SCSS:** `core-components/_tooltips.scss`
- **Snippet:** `tooltips.html`
- **Demo:** ✗ none

### Loaders / spinners — `pa-loader-bars`

Loading indicators: ring, dots, bars, pulse, wave, centered + overlay wrappers, and a generic spinner.

- **Blocks:** `pa-loader-bars`, `pa-loader-center`, `pa-loader-dots`, `pa-loader-overlay`, `pa-loader-pulse`, `pa-loader-ring`, `pa-loader-wave`, `pa-spinner`
- **Modifiers / states:** `pa-loader-bars--lg`, `pa-loader-dots--lg`, `pa-loader-pulse--lg`, `pa-loader-ring--lg`, `pa-loader-wave--lg`, `pa-spinner--danger`, `pa-spinner--info`, `pa-spinner--primary`, `pa-spinner--secondary`, `pa-spinner--success`, `pa-spinner--warning`, `pa-spinner--xs`
- **SCSS:** `core-components/_command-palette.scss`, `core-components/_loaders.scss`
- **Snippet:** `loaders.html`
- **Demo:** `loaders.mustache`

### Timeline — `pa-timeline`

Vertical/columned activity timeline with dated items, severity dots, avatars and comments.

- **Blocks:** `pa-timeline`
- **Elements:** `pa-timeline__avatar`, `pa-timeline__comment`, `pa-timeline__content`, `pa-timeline__date`, `pa-timeline__date-icon`, `pa-timeline__date-label`, `pa-timeline__icon`, `pa-timeline__item`, `pa-timeline__load-more-wrapper`, `pa-timeline__loader`, `pa-timeline__loader-text`, `pa-timeline__scroll-container`, `pa-timeline__time`
- **Modifiers / states:** `pa-timeline--alternating`, `pa-timeline--end`, `pa-timeline--feed`, `pa-timeline--keep-layout`, `pa-timeline--simple`, `pa-timeline--single-column`, `pa-timeline--start`, `pa-timeline__item--danger`, `pa-timeline__item--date-header`, `pa-timeline__item--filled`, `pa-timeline__item--info`, `pa-timeline__item--primary`, `pa-timeline__item--secondary`, `pa-timeline__item--success`, `pa-timeline__item--warning`
- **SCSS:** `core-components/_timeline.scss`
- **Snippet:** `timeline.html`
- **Demo:** `timeline.mustache`, `timeline-block.mustache`, `timeline-simple.mustache`

## Interactive & misc

### Badge — `pa-badge`

Status/count badges and badge groups.

- **Blocks:** `pa-badge`, `pa-badge-group`
- **Elements:** `pa-badge__icon`, `pa-badge__remove`
- **Modifiers / states:** `pa-badge--danger`, `pa-badge--dark`, `pa-badge--ellipsis-start`, `pa-badge--info`, `pa-badge--lg`, `pa-badge--light`, `pa-badge--pill`, `pa-badge--primary`, `pa-badge--secondary`, `pa-badge--sm`, `pa-badge--success`, `pa-badge--warning`, `pa-badge--xl`, `pa-badge--xs`, `pa-badge-group--show-all`
- **SCSS:** `core-components/_command-palette.scss`, `core-components/badges/_badge-base.scss`, `core-components/badges/_badge-group.scss`, `core-components/forms/_input-wrapper.scss`, `core-components/forms/_query-editor.scss`
- **Snippet:** `badges.html`
- **Demo:** `badges.mustache`

### Label — `pa-label`

Text labels/tags with an outline variant.

- **Blocks:** `pa-label`
- **Modifiers / states:** `pa-label--danger`, `pa-label--info`, `pa-label--lg`, `pa-label--outline`, `pa-label--primary`, `pa-label--secondary`, `pa-label--sm`, `pa-label--success`, `pa-label--warning`, `pa-label--xl`, `pa-label--xs`
- **SCSS:** `core-components/badges/_labels.scss`
- **Snippet:** `badges.html`
- **Demo:** ✗ none

### Composite badge — `pa-composite-badge`

Two-part badge (icon segment + label segment), optionally a button.

- **Blocks:** `pa-composite-badge`
- **Elements:** `pa-composite-badge__button`, `pa-composite-badge__icon`, `pa-composite-badge__label`
- **SCSS:** `core-components/badges/_composite-badge-variants.scss`, `core-components/badges/_composite-badge.scss`
- **Snippet:** `badges.html`
- **Demo:** ✗ none

### Command palette — `pa-command-palette`

Cmd-K command palette with search, results, footer, fullscreen mobile mode, autocomplete and a keyboard-shortcut help list.

- **Blocks:** `pa-command-palette`, `pa-search-autocomplete`, `pa-shortcut-help`
- **Elements:** `pa-command-palette__backdrop`, `pa-command-palette__close`, `pa-command-palette__container`, `pa-command-palette__context`, `pa-command-palette__empty`, `pa-command-palette__footer`, `pa-command-palette__fullscreen-bar`, `pa-command-palette__fullscreen-title`, `pa-command-palette__hint`, `pa-command-palette__home`, `pa-command-palette__home-heading`, `pa-command-palette__home-section`, `pa-command-palette__input`, `pa-command-palette__input-wrapper`, `pa-command-palette__item`, `pa-command-palette__item-content`, `pa-command-palette__item-icon`, `pa-command-palette__item-meta`, `pa-command-palette__item-title`, `pa-command-palette__key`, `pa-command-palette__loader`, `pa-command-palette__pagination`, `pa-command-palette__results`, `pa-command-palette__search`, `pa-command-palette__section`, `pa-command-palette__shortcut`, `pa-command-palette__token-prompt`, `pa-command-palette__tokens`, `pa-search-autocomplete__empty`, `pa-search-autocomplete__item`, `pa-search-autocomplete__item-icon`, `pa-search-autocomplete__item-name`, `pa-search-autocomplete__item-type`, `pa-search-autocomplete__section`, `pa-shortcut-help__category`, `pa-shortcut-help__category-title`, `pa-shortcut-help__description`, `pa-shortcut-help__empty`, `pa-shortcut-help__item`, `pa-shortcut-help__key`, `pa-shortcut-help__keys`, `pa-shortcut-help__list`, `pa-shortcut-help__separator`
- **Modifiers / states:** `pa-command-palette--active`, `pa-command-palette--fullscreen`, `pa-command-palette--lg`, `pa-command-palette--sm`, `pa-command-palette--xl`, `pa-command-palette__context--visible`, `pa-command-palette__item--active`, `pa-command-palette__results--loading`, `pa-search-autocomplete__item--active`
- **SCSS:** `core-components/_command-palette.scss`, `core-components/_print.scss`, `core-components/forms/_query-editor.scss`
- **Snippet:** `command-palette.html`
- **Demo:** `command-palette.mustache`, `search.mustache`

### Search results — `pa-search-results`

Search results list with compact/detailed/cards/grouped layouts.

- **Blocks:** `pa-search-results`
- **Elements:** `pa-search-results__content`, `pa-search-results__group`, `pa-search-results__group-title`, `pa-search-results__icon`, `pa-search-results__item`, `pa-search-results__mark`, `pa-search-results__meta`, `pa-search-results__meta-item`, `pa-search-results__snippet`, `pa-search-results__title`, `pa-search-results__type`
- **Modifiers / states:** `pa-search-results--cards`, `pa-search-results--compact`, `pa-search-results--detailed`, `pa-search-results--grouped`, `pa-search-results__item--active`
- **SCSS:** `core-components/_search-results.scss`
- **Snippet:** `search-results.html`
- **Demo:** `search.mustache`

### Logic tree — `pa-logic-tree`

Nested boolean logic tree (AND/OR blocks, nodes, logical tokens).

- **Blocks:** `pa-logic-tree`
- **Elements:** `pa-logic-tree__block`, `pa-logic-tree__block-content`, `pa-logic-tree__empty`, `pa-logic-tree__empty-branch`, `pa-logic-tree__group-content`, `pa-logic-tree__group-label`, `pa-logic-tree__node`, `pa-logic-tree__token`, `pa-logic-tree__tree-branch`, `pa-logic-tree__tree-operator`, `pa-logic-tree__tree-structure`
- **Modifiers / states:** `pa-logic-tree--animated`, `pa-logic-tree__block--and`, `pa-logic-tree__block--condition`, `pa-logic-tree__block--group`, `pa-logic-tree__block--logical`, `pa-logic-tree__block--or`, `pa-logic-tree__token--field`, `pa-logic-tree__token--logical`, `pa-logic-tree__token--operator`, `pa-logic-tree__token--paren`, `pa-logic-tree__token--value`, `pa-logic-tree__tree-branch--left`, `pa-logic-tree__tree-branch--right`
- **SCSS:** `core-components/_logic-tree.scss`
- **Snippet:** ✗ none
- **Demo:** ✗ none

### File selector — `pa-file-dropzone`

File dropzone + file list/items with icons, previews, popover and per-file progress.

- **Blocks:** `pa-file-dropzone`, `pa-file-dropzone-overlay`, `pa-file-icon`, `pa-file-input`, `pa-file-item`, `pa-file-list`, `pa-file-popover`, `pa-file-preview`, `pa-file-preview-grid`, `pa-file-progress`
- **Elements:** `pa-file-dropzone-overlay__content`, `pa-file-dropzone-overlay__icon`, `pa-file-dropzone-overlay__text`, `pa-file-dropzone__content`, `pa-file-dropzone__drop-prompt`, `pa-file-dropzone__drop-prompt-icon`, `pa-file-dropzone__file-card`, `pa-file-dropzone__file-card-icon`, `pa-file-dropzone__file-card-name`, `pa-file-dropzone__file-card-remove`, `pa-file-dropzone__file-card-size`, `pa-file-dropzone__files-grid`, `pa-file-dropzone__hint`, `pa-file-dropzone__icon`, `pa-file-dropzone__image-card`, `pa-file-dropzone__image-card-remove`, `pa-file-dropzone__input`, `pa-file-dropzone__summary`, `pa-file-dropzone__summary-count`, `pa-file-dropzone__summary-current`, `pa-file-dropzone__summary-icon`, `pa-file-dropzone__summary-line`, `pa-file-dropzone__summary-progress`, `pa-file-dropzone__summary-size`, `pa-file-dropzone__text`, `pa-file-input__button`, `pa-file-input__filename`, `pa-file-input__native`, `pa-file-item__icon`, `pa-file-item__info`, `pa-file-item__meta`, `pa-file-item__name`, `pa-file-item__remove`, `pa-file-popover__arrow`, `pa-file-popover__body`, `pa-file-popover__close`, `pa-file-popover__file-name`, `pa-file-popover__file-size`, `pa-file-popover__header`, `pa-file-popover__progress-bar`, `pa-file-popover__progress-cell`, `pa-file-popover__progress-fill`, `pa-file-popover__progress-text`, `pa-file-popover__remove-btn`, `pa-file-popover__remove-cell`, `pa-file-popover__status`, `pa-file-popover__table`, `pa-file-popover__title`, `pa-file-preview__image`, `pa-file-preview__overlay`, `pa-file-preview__remove`, `pa-file-progress__bar`, `pa-file-progress__fill`, `pa-file-progress__status`, `pa-file-progress__text`
- **Modifiers / states:** `pa-file-dropzone--active`, `pa-file-icon--audio`, `pa-file-icon--default`, `pa-file-icon--doc`, `pa-file-icon--docx`, `pa-file-icon--image`, `pa-file-icon--pdf`, `pa-file-icon--rar`, `pa-file-icon--txt`, `pa-file-icon--video`, `pa-file-icon--xls`, `pa-file-icon--xlsx`, `pa-file-icon--zip`, `pa-file-list--detailed`, `pa-file-popover__status--complete`, `pa-file-popover__status--error`, `pa-file-popover__status--pending`, `pa-file-popover__status--uploading`, `pa-file-progress__status--complete`, `pa-file-progress__status--error`
- **SCSS:** `core-components/_file-selector.scss`
- **Snippet:** ✗ none
- **Demo:** `file-selector.mustache`

### Icon — `pa-icon`

Mask-based icon element (pa-icon--x etc.).

- **Blocks:** `pa-icon`
- **Modifiers / states:** `pa-icon--add`, `pa-icon--bell`, `pa-icon--caret`, `pa-icon--caret-down`, `pa-icon--caret-up`, `pa-icon--check`, `pa-icon--chevron`, `pa-icon--chevron-down`, `pa-icon--chevron-left`, `pa-icon--chevron-right`, `pa-icon--chevron-up`, `pa-icon--clear`, `pa-icon--collapse`, `pa-icon--copy`, `pa-icon--danger`, `pa-icon--delete`, `pa-icon--download`, `pa-icon--edit`, `pa-icon--ellipsis`, `pa-icon--ellipsis-vertical`, `pa-icon--expand`, `pa-icon--external-link`, `pa-icon--favorites`, `pa-icon--filter`, `pa-icon--help`, `pa-icon--info`, `pa-icon--link`, `pa-icon--lock`, `pa-icon--logout`, `pa-icon--refresh`, `pa-icon--remove`, `pa-icon--save`, `pa-icon--search`, `pa-icon--settings`, `pa-icon--success`, `pa-icon--user`, `pa-icon--warning`, `pa-icon--x`
- **SCSS:** `core-components/_icons.scss`, `core-components/_modals.scss`
- **Snippet:** `icon.html`
- **Demo:** `icons.mustache`

## Utilities & state hooks

### Utilities & state hooks — `pa-font-responsive`

Standalone helper classes (not components): link helpers, responsive font hooks. The palette colour helpers are now unprefixed (text-color-N / bg-color-N / border-color-N / text-on-color-N / surface-color-N) and live outside the pa- namespace. See utilities.scss for the full utility set (spacing, sizing, pc-col-* percentages, logical margins, etc.).

- **Blocks:** `pa-font-responsive`, `pa-link`
- **SCSS:** `core-components/_utilities.scss`
- **Snippet:** `utilities.html`
- **Demo:** ✗ none
