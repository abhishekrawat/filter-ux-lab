# Filter UX Lab

A React + Vite + shadcn/ui prototype that explores **six data-table filter UX patterns side by side**, against a shared mock "authorization transaction log" (18 columns, 150 deterministic rows). Built to run task-based usability tests and pick the right pattern (or hybrid) for a production log viewer backed by a large server-side dataset.

Because filtering a table this size is an expensive server query, **every pattern stages edits and commits on an explicit Apply** — one request per Apply, never one per keystroke. The patterns differ in how filters are composed and how applied state is surfaced, not in commit timing.

## Run it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173.

## The six patterns

| Route | Pattern | Interaction model |
|---|---|---|
| `/inline` | Inline Filters + Apply | All controls inline in the toolbar; edits stage and commit on Apply (or Enter in search) |
| `/drawer` | Filter Drawer + Apply | Facets staged in a right Sheet, committed on Apply with a live draft result count (batch filtering); applied values echoed as removable chips + a count badge on the trigger |
| `/progressive` | Progressive Disclosure | Status + Date inline; Type/Payer/Entity behind "More filters" with a hidden-applied-value count badge |
| `/chips` | Chips + Summary Bar | Inline facets stage and commit on Apply; every applied value echoed as its own removable chip, with Clear all |
| `/command` | Command Multi-Select | The reference faceted filter: searchable Command-in-Popover multi-select with checkmarks and per-option result counts |
| `/modal` | Filter Modal + Apply | Same staged multi-select model as the drawer, but filters open in a centered modal (dimmed backdrop) with facets in a two-column grid; committed on Apply, applied values echoed as removable chips |

`/` is an overview page with the research grounding (interactive vs. batch filtering, filter visibility, progressive disclosure), a server-side/performance plan, and a suggested usability test protocol.

## What's shared vs. what varies

All filters are **searchable multi-select comboboxes** (`FacetedFilter`) or checkbox groups, all editing a **staged draft** committed on Apply (`useStagedFilters`). Applied state is always visible: value badges + counts on every trigger, a lit Apply button previewing the result count, a "pending changes" hint by the count, and an `AppliedFiltersBar` of per-value removable chips wherever controls can hide (drawer patterns) or as the pattern itself (chips page). Deliberately, only the **filter interaction model** varies per page. Everything else is shared so tests compare patterns, not implementations:

- `src/data/mockAuthorizations.ts` — seeded-PRNG dataset (stable across reloads), plus `formatDateTime`
- `src/lib/filters.ts` — one `Filters` model + `applyFilters()` used by all pages (shaped like a server query contract), the `useStagedFilters()` draft/applied hook, `filtersEqual()`, and shared `facetCounts()` for per-option result counts
- `src/components/authorizations/` — table (sticky first column, sticky header, horizontal scroll, empty state, pagination with page-size select), toolbar controls (search, selects, date-range with presets + range calendar, faceted multi-select), Columns visibility menu (hidden columns are unmounted, not css-hidden), row actions menu, shared `PageShell`

## Production notes (when this meets a real backend)

- Move filtering/sorting/pagination server-side; `Filters` serializes to query params as-is
- Every pattern already batches to one query per Apply; still cancel stale in-flight requests (AbortController / TanStack Query) so the latest Apply wins
- Prefer keyset pagination over OFFSET for deep pages; consider estimated/capped result counts
- The Apply preview count and per-option facet counts each cost a query — use estimated/capped counts and cache or drop facet counts if expensive
- Put applied filters in the URL for shareable views

## shadcndesign.com pro blocks

The `@shadcndesign` registry is configured in `components.json`; it authenticates with the `X-License-Key` header interpolated from the `LICENCSE_KEY` variable in `.env` (git-ignored — add your own key). An earlier drawer variant used pro blocks from it; that pattern has since been replaced by the centered-modal one, and the licensed block source is not checked in (so this repo can be public). The registry stays wired up so blocks can be pulled in on demand — browse and add with:

```bash
pnpm dlx shadcn@latest search @shadcndesign --query "table"
pnpm dlx shadcn@latest add @shadcndesign/<block-name>
```

## Not in scope for this pass

Real API/XML handling, auth, mobile layouts.
