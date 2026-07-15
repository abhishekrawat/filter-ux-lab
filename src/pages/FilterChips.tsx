import { useMemo } from "react"
import {
  AUTH_STATUSES,
  AUTH_TYPES,
  mockAuthorizations,
} from "@/data/mockAuthorizations"
import { EMPTY_FILTERS, facetCounts, useStagedFilters } from "@/lib/filters"
import {
  AppliedFiltersBar,
  type FilterChip,
} from "@/components/authorizations/AppliedFiltersBar"
import { ApplyButton } from "@/components/authorizations/ApplyButton"
import { AuthTable } from "@/components/authorizations/AuthTable"
import {
  DateRangeFilter,
  rangeLabel,
} from "@/components/authorizations/DateRangeFilter"
import { FacetedFilter } from "@/components/authorizations/FacetedFilter"
import { PageShell } from "@/components/authorizations/PageShell"
import { SearchInput } from "@/components/authorizations/SearchInput"

// Pattern 4 — chips + summary bar with Apply. Controls stage into the draft
// and commit on Apply; the chip bar reflects the APPLIED state (what's
// filtering now), so the two layers answer different questions: triggers show
// what you're about to apply, chips show what's already applied. Removing a
// chip un-applies that value immediately.
export default function FilterChips() {
  const sf = useStagedFilters(mockAuthorizations)

  const statusCounts = useMemo(
    () => facetCounts(mockAuthorizations, sf.draft, "statuses", (r) => r.status),
    [sf.draft]
  )
  const typeCounts = useMemo(
    () => facetCounts(mockAuthorizations, sf.draft, "types", (r) => r.type),
    [sf.draft]
  )

  const { applied } = sf
  const chips: FilterChip[] = []
  if (applied.q.trim())
    chips.push({
      key: "q",
      label: "Search",
      value: `“${applied.q.trim()}”`,
      onRemove: () => sf.patchApplied({ q: "" }),
    })
  chips.push(
    ...applied.statuses.map((v) => ({
      key: `status-${v}`,
      label: "Status",
      value: v,
      onRemove: () =>
        sf.patchApplied({ statuses: applied.statuses.filter((x) => x !== v) }),
    })),
    ...applied.types.map((v) => ({
      key: `type-${v}`,
      label: "Type",
      value: v,
      onRemove: () =>
        sf.patchApplied({ types: applied.types.filter((x) => x !== v) }),
    }))
  )
  const dateLabel = rangeLabel({ from: applied.dateFrom, to: applied.dateTo })
  if (dateLabel)
    chips.push({
      key: "date",
      label: "Submitted",
      value: dateLabel,
      onRemove: () => sf.patchApplied({ dateFrom: null, dateTo: null }),
    })

  return (
    <PageShell
      title="Filter Chips + Summary Bar"
      description="Multi-select facets stage into a draft and commit on Apply. The chip bar echoes every APPLIED value (search, statuses, types, date) as its own removable chip — so it always answers “what's filtering the table right now?”, while the triggers show what you've staged but not yet applied."
      resultCount={sf.appliedRows.length}
      totalCount={mockAuthorizations.length}
      pending={sf.isDirty}
      toolbar={
        <>
          <SearchInput
            value={sf.draft.q}
            onChange={(v) => sf.setField("q", v)}
            onSubmit={sf.apply}
            className="w-72"
          />
          <FacetedFilter
            title="Status"
            options={AUTH_STATUSES}
            selected={sf.draft.statuses}
            onChange={(v) => sf.setField("statuses", v as typeof sf.draft.statuses)}
            counts={statusCounts}
          />
          <FacetedFilter
            title="Type"
            options={AUTH_TYPES}
            selected={sf.draft.types}
            onChange={(v) => sf.setField("types", v as typeof sf.draft.types)}
            counts={typeCounts}
          />
          <DateRangeFilter
            value={{ from: sf.draft.dateFrom, to: sf.draft.dateTo }}
            onChange={(r) => {
              sf.setField("dateFrom", r.from)
              sf.setField("dateTo", r.to)
            }}
          />
          <ApplyButton
            dirty={sf.isDirty}
            draftCount={sf.draftCount}
            onApply={sf.apply}
          />
        </>
      }
      subToolbar={
        <AppliedFiltersBar
          chips={chips}
          onClearAll={() => sf.patchApplied(EMPTY_FILTERS)}
        />
      }
    >
      {(visibility) => (
        <AuthTable rows={sf.appliedRows} visibility={visibility} />
      )}
    </PageShell>
  )
}
