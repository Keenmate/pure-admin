---
description: Audit & align one pa-* component's emitted markup across core (oracle), svelte-pure-admin, and keen-pure-admin — run the fidelity harness, classify every divergence, resolve the common questions against the core snippet/SCSS BEFORE asking, fix the odd wrapper out
argument-hint: <component> [check|fix]
---

# /align-component — cross-repo markup alignment for one component

Bring one component's **emitted DOM** into agreement across the three repos, with
**core as the oracle**. The core snippet + SCSS + fidelity fixture define the one
blessed shape; the two wrappers (svelte, keen) must render it identically.

The whole point of this command: **don't re-ask the user the common questions.**
Most "which shape is right?" questions are already answered by the core snippet,
the SCSS, or the Card precedent. Resolve them there first. Only escalate a decision
to the user when core genuinely doesn't bless a shape AND both wrapper behaviours
are defensible AND it's a public-API semantics call with backward-compat impact —
and even then, arrive with a recommendation, not an open question.

The three repos:
- **core** (this repo, `packages/core`) — the oracle. SCSS source, HTML snippets,
  and the markup-fidelity fixtures + comparator.
- **svelte-pure-admin** (`../svelte-pure-admin`) — Svelte 5 wrapper. Components under
  `packages/svelte-pure-admin/src/lib/**`.
- **keen-pure-admin** (`../keen-pure-admin`) — Phoenix LiveView wrapper. Components
  under `lib/keen_pure_admin/components/**`.

## Argument

**$ARGUMENTS** — `<component> [check|fix]`.
- `<component>` — the component key, e.g. `modal`, `card`, `badge`, `tabs`. This is
  the fixture key (`packages/core/fidelity/fixtures/<component>.json`) and the key the
  dumpers take. Required — if missing, list the available fixture keys and stop.
- mode — `check` (default) or `fix`:
  - `check` — audit + classify divergences, resolve each against core, report. Change nothing.
  - `fix` — same audit, then apply the alignment to the odd-wrapper-out and re-verify.

## The oracle — what to read, in this order

1. **Fixture** `packages/core/fidelity/fixtures/<component>.json` — read it WHOLE,
   especially:
   - `goldenConventions` — the prose that enumerates **already-accepted, intentional
     divergences** (e.g. for modal: static class, close-under-static, body-always-vs-
     conditional, close `--light` keying). These are NOT drift. Do not churn them.
   - `features` — the feature→class contract (`produces`); `produces: null` = a
     native/structural attr, not a `pa-*` modifier.
   - `cssStateClasses` — JS-toggled classes never in SSR markup (`pa-modal--show` etc.).
   - `scenarios` — the golden per scenario (what the harness actually checks).
2. **Snippet** — the single blessed markup. Usually `packages/core/snippets/<component>s.html`
   (often plural: `modal`→`modals.html`) but **not always 1:1** — shared-file components
   map elsewhere (navbar/sidebar→`layout.html`). Confirm the file via
   `packages/core/components.json` (the `snippet` field per component). Read its
   `COMPONENT REFERENCE` / `STRUCTURE PATTERNS` block too — that's core's own spec prose.
3. **SCSS** `packages/core/src/scss/core-components/_<component>.scss` — confirms what
   classes/elements actually exist (vs invented), and how variants cascade (e.g. a
   `--variant` colouring the header via a **descendant** selector, with no
   `__header--variant` class). Settles "does this class exist / is it styled?".
4. **Card precedent** — `cards.html` / `Card.svelte` / `card.ex`. Card is the reference
   implementation of the "one canonical structure per component" rule (see CLAUDE.md).
   Consult it for slot-taxonomy questions (e.g. `header` full-override vs `title` content).

Then read both wrappers:
- svelte: the `.svelte` file — find it in the `REGISTRY` map at the top of
  `../svelte-pure-admin/scripts/fidelity/dump.mjs`; its neutral→props map is
  `../svelte-pure-admin/scripts/fidelity/<component>.map.json`.
- keen: `../keen-pure-admin/lib/keen_pure_admin/components/<component>.ex`.

## Step 1 — run the harness (ground truth on COVERED scenarios)

The harness is authoritative for everything a fixture scenario exercises. Run both:

```
# svelte
cd ../svelte-pure-admin
node scripts/fidelity/dump.mjs <component>
node ../pure-admin/packages/core/fidelity/compare-all.mjs --wrapper svelte   # grep the <component> line + summary

# keen
cd ../keen-pure-admin
mix pa.fidelity.dump <component>
node ../pure-admin/packages/core/fidelity/compare-all.mjs --wrapper keen
```

A green `✓ <component>  <wrapper> N/N` means the covered surface is aligned. A `✗`
with a diff means a wrapper's SSR markup drifted from the golden — that's a concrete
bug: fix that wrapper to match the golden (the golden is core's blessed shape).

If the component has **no fixture**, say so: the harness can't help and the whole audit
is manual against snippet + SCSS. (Optionally propose adding a fixture.)

## Step 2 — classify EVERY divergence into three buckets

Read the three sources and diff them in your head against the oracle. Bucket each
difference:

- **(a) Harness-covered** — a fixture scenario exercises it. Authority = pass/fail.
  If failing, fix the failing wrapper. If passing, it's aligned — move on.
- **(b) Fixture-accepted** — the `goldenConventions`/feature notes explicitly bless it
  as an intentional, principled divergence. **Leave it. Do not churn.** (Report it so
  the user knows it was considered, but don't touch it.)
- **(c) Uncovered** — slots, behavioural-only flags (`isStatic`), prop combinations, or
  element shapes NO scenario exercises. **This is the real work of this command** — the
  harness is blind here, so these are where latent divergences hide.

## Step 3 — resolve each (c) against CORE, not the user

For every uncovered divergence, find the blessed shape in this order; stop at the first
that answers it:

1. **Snippet** — does it show exactly one shape for this slot/element? If yes, that is
   canonical. Align both wrappers to it. **Do not ask the user.**
2. **SCSS** — does the class/element exist? Is it styled? Settles "real vs invented" and
   "is there a `__x--variant` knob or does it cascade from the root?".
3. **Snippet's COMPONENT REFERENCE / STRUCTURE PATTERNS** prose.
4. **Card precedent** for slot taxonomy (full-override `header` rendered raw vs `title`
   content wrapped in the blessed element).
5. **Rigidity principle** (CLAUDE.md): when still choosing, prefer the shape that keeps
   the **wrapper owning the canonical element** (so a code generator emits one tree), and
   that the snippet actually shows. Flexibility that lets a consumer step outside the one
   blessed shape loses.

**Escalate to the user ONLY if** none of 1–5 settles it — i.e. core blesses no shape,
both wrapper behaviours are defensible, and it's a public-API semantics change with
two-way backward-compat risk. Present it as a single focused choice WITH a recommendation
grounded in the above, not an open-ended survey. (Check the demos first:
`../svelte-pure-admin/docs/src/routes/**` and `../keen-pure-admin/lib/**` — if neither
demo uses the feature, there are no internal consumers to break, which lowers the stakes
and usually means you can just pick the core-consistent shape and note it.)

### Worked example (this is the canonical illustration — the modal `header` slot)

core's `modals.html` blesses exactly ONE title shape: `<h3 class="pa-modal__title">`
(optionally with a leading `pa-icon--*` span inside it); there is no "custom header
markup" concept anywhere in the snippet or SCSS. keen wrapped its `:header` slot in that
`<h3>`; svelte rendered the `header` snippet raw. → Snippet answers it: the wrapper owns
the `<h3>`. Align svelte → keen (wrap the snippet), update the prop doc to say "supply
title content, don't wrap your own `<h3>`." No user question needed — core settled it.

## Step 4 — apply fixes (mode `fix`)

- Edit the odd-wrapper-out to emit the core-blessed shape. Keep class names/prop names
  stable where possible (wrappers' public APIs).
- Update the prop/slot **doc comment** to state the contract (what the slot renders into),
  so the next reader doesn't re-derive it.
- Never bless two shapes. If an old shape must keep rendering for back-compat, it's legacy
  tolerance — not a second documented option.
- svelte reactivity/markup only; no core SCSS change unless the audit finds core itself
  wrong (rare — if so, that's a core edit + `npm run build` + catalog + themes rebuild,
  and flag it loudly, it's a bigger blast radius).

## Step 5 — re-verify

- Re-dump + compare BOTH wrappers (Step 1). Covered scenarios must stay green.
  **Note:** a fix to an UNCOVERED slot/flag is invisible to the harness (no scenario hits
  it) — verify those by reading the diff and matching the known-good wrapper's output.
  Consider proposing a NEW fixture scenario so the harness guards it next time.
- svelte: `npm run check:lib` — must introduce **0 new** errors. A pre-existing baseline
  of **5 `DataVizVariant` errors** (Progress/ProgressRing/Gauge/DataBar/Sparkline) is
  known/unrelated — ignore those, fail on anything else.
- keen: `cd ../keen-pure-admin && mix compile` — exit 0.

## Gotchas (seen in practice)

- **Close-button i18n keys differ but aren't a divergence.** svelte resolves
  `pureAdmin.buttons.close`, keen `pureAdmin.a11y.close`; both render the literal
  `Close`. The normalizer/goldens treat them as equal. Don't "fix" this.
- **keen emits some inert classes by design.** e.g. `pa-modal--static` — core has no such
  CSS rule and keen's own JS doesn't read it, but the fixture blesses keen emitting it
  while svelte omits it. Bucket (b): leave it.
- **Body/children gating differs by framework.** keen `inner_block` is `required` (always
  renders `__body`); svelte renders `__body` only when `children` exist. Fixtures sidestep
  this by always supplying a body. Bucket (b).
- **Snippet ≠ component name 1:1.** Plurals (`modals.html`) and shared files
  (navbar/sidebar→`layout.html`). Always confirm via `components.json`.
- **Dump commands differ.** svelte = `node scripts/fidelity/dump.mjs <c>`; keen =
  `mix pa.fidelity.dump <c>`. Both repos also have `make fidelity` (dump --all + compare).

## Report

Lay out the three buckets explicitly:
- **(a) covered** — N/N per wrapper; any failing scenario fixed (what changed).
- **(b) accepted** — the intentional divergences left alone (one line each, cite the
  fixture note).
- **(c) uncovered** — each one, how core resolved it (snippet/SCSS/Card), which wrapper
  was changed, and any you had to escalate (with your recommendation).

Close with: which file(s) changed per repo, the re-verify results, and whether a new
fixture scenario is worth adding to cover a previously-blind divergence. Standing rules:
**commit only when asked, never push, never publish** (core/themes/svelte/keen).
