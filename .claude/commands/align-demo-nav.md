---
description: Audit & align demo sidebar routes across pure-admin, keen, svelte — every page pathed by its sidebar group, /components retired to overview-only, respecting intentional per-framework exceptions
argument-hint: check|fix
---

# /align-demo-nav — cross-repo demo navigation/route consistency

Keep the three demo sites' **sidebar structure and URL paths** aligned, so a page's
path mirrors the sidebar group it lives in, and the three stay consistent — **without**
flattening the deliberate per-framework differences.

The three demos:
- **pure-admin** (this repo) — Express. Routes: `demo/server.js` (`app.get('/path', …)`);
  sidebar: `demo/views/partials/sidebar.mustache` (`<a href="/path">`); cross-links in
  other `demo/views/**/*.mustache` + `demo/js/**/*.js`.
- **keen-pure-admin** (`../keen-pure-admin`) — Phoenix LiveView. Routes:
  `demo/lib/demo_web/router.ex` (`live("/path", Mod, :index)`); sidebar + navbar:
  `demo/lib/demo_web/components/layouts/app.html.heex`; cross-links in `demo/lib/**/*.ex`.
- **svelte-pure-admin** (`../svelte-pure-admin`) — SvelteKit. Routes are **folders** under
  `docs/src/routes/<path>/+page.svelte`; sidebar: `docs/src/routes/+layout.svelte`;
  page index for search/palette: `docs/src/lib/pages.ts`.

## Argument

**$ARGUMENTS** — `check` (default) or `fix`.
- `check` — audit only: report every page whose path doesn't match its group, every
  same-page label/order mismatch across repos, and the open content diffs. Change nothing.
- `fix` — apply the alignment (after showing the plan). Then run the verification gates.

If the arg is missing, do `check`.

## The canonical scheme

A page's path = `/<group-namespace>/<page-slug>`. **Keep each page's existing slug** — only
prefix it with its group namespace; never rename a slug to "match" another repo (a
similarly-named page in another repo may be a *different* page).

| Sidebar group | Namespace | Eponymous page = group index |
|---|---|---|
| (Components catalog overview) | `/components` | the overview page IS `/components` |
| Design | `/design` | — (Icons, Colors, Theme Variables, Typography, Helpers, **Layouts**) |
| Layout & responsivity | `/layout` | none → `/layout` is a bare namespace (grid, sizing, fit-to-size, container-breakpoint, responsivity, overflow, responsive-form) |
| Forms & inputs | `/forms` | **Forms** page = `/forms`; inputs=`/forms/inputs`, etc. |
| Buttons & actions | `/buttons` | **Buttons** page = `/buttons`; pagers=`/buttons/pagers` |
| Surfaces | `/surfaces` | — (cards, tabs, modals, modal-dialogs, detail-panel, splitter) |
| Data display | `/data-display` | **Data Display** page = `/data-display`; v2=`/data-display/data-display-2`; lists/code/document/sheet/stats/data-grid/svelte-treeview nest |
| Data visualization | `/data-viz` | the single Data Visualization page IS `/data-viz` |
| KPI | `/kpi` | — (terminal-grid, sparkline-list, …) |
| Feedback | `/feedback` | — (alerts, callouts, toasts, notifications, tooltips, loaders) |
| Timeline | `/timeline` | — (simple, block, feed, advanced) |
| Interactive & misc | `/interactive` | — (badges, command-palette) |
| Tables | `/tables` | — (Standard Tables = `/tables/standard`; sizing, responsive, filters, multi-select, comparison, smart-filters) |
| Practical / Examples / Showcases | `/showcases` | — (kpi-dashboard, movies, movies/detail, movies-panel) |
| Virtual Scroll | `/virtual-scroll` | — |
| Tools (pure-admin only) | `/tools` | — |

Top-level, un-grouped (keep bare): `/` (Dashboard), `/getting-started`, `/changelog`
(pure), `/search`, `/audit` (internal).

## INTENTIONAL EXCEPTIONS — leave these be

These are NOT drift to fix. Respect them every run:

1. **Per-framework showcase groups stay per-repo and are NOT unified.** svelte has a
   **"Svelte"** group at **`/svelte/*`** (icon-component, validation, form-demo, batch-rpc,
   i18n, auto-theme, events-callbacks); keen has a **"Phoenix / LiveView"** group at
   **`/phoenix/*`** (core-components, flash, form-demo, icons[=Icon Components],
   command-palette). Each demonstrates how something is done in *that* technology. Do not
   rename `/svelte`↔`/phoenix`, do not try to make these two groups match, and pure-admin
   (vanilla) has no such group — that's correct.
2. **Never add or delete pages to make repos match.** Only re-path / re-label pages that
   already exist. If a page exists in one repo but not another (e.g. svelte lacks
   sizing/overflow/notifications/stats/document/sheet/date-picker/multiselect/
   file-selector/responsive-form; keen has timeline/advanced + kpi/dashboard-in-KPI +
   virtual-scroll; pure has tools/* + data-grid + svelte-treeview + smart-filters), that's
   a **content** difference — report it in a matrix, don't act on it.
3. **Bare group roots 404 by design.** `/surfaces`, `/feedback`, `/interactive`,
   `/layout`, `/tables` have no eponymous index page, so their root 404s. Leave it; don't
   add an overview or redirect unless explicitly asked.
4. **`/components` is overview-only** (the catalog landing) — plain `/components` in all
   three. The individual component pages do NOT live under `/components/*` anymore.
5. **Layouts lives in the Design group at `/design/layouts`** in all three (not in the
   Layout group).
6. **Already-correct namespaces** — `/design/*`, `/tables/*`, `/kpi/*`, `/timeline/*`,
   `/virtual-scroll/*`, `/tools/*`, `/showcases/*` — leave untouched.
7. **Eponymous-page slugs** differ where the underlying page differs. E.g. svelte's
   "Fit to Size" page is `/layout/container-breakpoint`; keen has BOTH a `fit-to-size`
   AND a `container-breakpoint` page. Don't collapse them — different pages.

## Audit (both `check` and `fix` start here)

1. Extract each repo's sidebar groups + items + hrefs and each repo's route list:
   - pure: `grep` hrefs in `sidebar.mustache`; `app.get(` paths in `server.js`.
   - keen: `sidebar_item`/`sidebar_submenu` in `app.html.heex`; `live(` paths in `router.ex`.
   - svelte: `SidebarItem`/`labelText` in `+layout.svelte`; `find docs/src/routes -name +page.svelte`.
2. For each page, check its path matches its group's namespace (table above). List
   violators.
3. Compare the three for **same-page label or order** mismatches (group order + item
   label). Group order should be identical for shared groups; labels should match. (The
   framework group and any repo-only trailing group are expected to differ — see
   exceptions.)
4. Build the **open content-diff matrix** (which shared-ish pages exist in which repos).

Output the audit. If arg is `check`, stop here.

## Fix (arg `fix`)

Show the move/rename plan, then apply per repo. **Boundary-safe path rewrite** (protects
template names, `currentPage`/`isX` flags, code-comment file paths, and `{…}` HEEx exprs):

```
perl -i -pe 's/(["'"'"'`])\Q$OLD\E(?=["'"'"'`\/?#])/$1$NEW/g'   # run per pair, longest-first
```

- **pure-admin** — rewrite path strings in `server.js` + `views/**/*.mustache` + `js/**/*.js`.
  No file moves. Keep `/components/overview`→`/components` if it ever regresses. Verify:
  `node --check demo/server.js`.
- **keen** — rewrite path strings in `router.ex` + `app.html.heex` (hrefs **and**
  `is_active` **and** the `is_open={@current_path in [ … ]}` explicit lists) + any
  hardcoded links in `demo/lib/**/*.ex` (overview cards, search, getting-started).
  No file moves. Verify: `cd demo && mix compile` (exit 0).
- **svelte** — routes are folders, so **move folders**, then rewrite references. Use the
  **contents-move** to dodge Windows/Vite dir-locks (whole-dir `mv` can fail
  "Permission denied"): `mkdir -p DST && mv SRC/* DST/ && rmdir SRC`. For an eponymous
  index page, move `SRC/+page.*` into the group dir itself. Then one perl pass over
  `docs/src/**/*.svelte` + `*.ts` updates hrefs, `pages.ts` `path:`, `$page.url.pathname
  === '…'` active checks, command-palette values, favorites. Verify: `npx svelte-check
  --threshold error` — a baseline of pre-existing `dist/`+`movies` errors (~55) is OK;
  ensure **0 new** and none in changed routes; `grep` no leftover old paths.

### Gotchas (seen in practice)

- **Cascade trap.** A key that's a prefix of another key's *output* re-matches its own
  output because the lookahead allows `/` — e.g. `/tables`→`/tables/standard` then the
  `/tables` rule fires again on `/tables/sizing` → `/tables/standard/sizing`. Fix with a
  targeted follow-up (`s{/tables/standard/}{/tables/}`), or drop `/` from that one key's
  lookahead. Also: a path may be flat in one file (`/tables-sizing` in the sidebar) but
  already-nested in another (`/tables/sizing` in `pages.ts`) — audit both.
- **Code-comment file paths** like `lib/my_app_web/components/layouts/app.html.heex` must
  survive — the quote-boundary requirement already protects them (not quote-preceded).
- **HEEx `{name}`** in text is parsed as an expression → escape literal braces as
  `&#123;name&#125;` in any code sample you author.
- **svelte `CodeBlock` `language`** union is `javascript|json|html|css|bash|sql|python`
  (no `svelte`/`typescript`).

## Report

Summarize per repo: paths moved/renamed, labels/order fixed, and the **open content-diff
matrix** (missing/extra pages per repo) — which you must NOT auto-resolve; surface it for
the user to decide. Note all changes are demo/docs-only; **commit only when asked**, never
push, never publish.
