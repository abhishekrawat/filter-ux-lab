import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  AUTH_STATUSES,
  AUTH_TYPES,
  mockAuthorizations,
} from "@/data/mockAuthorizations"
import { facetCounts, useStagedFilters } from "@/lib/filters"
import { ApplyButton } from "@/components/authorizations/ApplyButton"
import { AuthTable } from "@/components/authorizations/AuthTable"
import { DateRangeFilter } from "@/components/authorizations/DateRangeFilter"
import { FacetedFilter } from "@/components/authorizations/FacetedFilter"
import { PageShell } from "@/components/authorizations/PageShell"
import { SearchInput } from "@/components/authorizations/SearchInput"

// Pattern 1 — inline filters with an explicit Apply. All controls sit in the
// toolbar; edits stage into the draft and commit only on Apply (or Enter in
// search), so filtering hits the server once per Apply, not once per change.
// The triggers show the draft selection; the Apply button previews the count.
export default function InlineAutoApply() {
  const sf = useStagedFilters(mockAuthorizations)

  const statusCounts = useMemo(
    () => facetCounts(mockAuthorizations, sf.draft, "statuses", (r) => r.status),
    [sf.draft]
  )
  const typeCounts = useMemo(
    () => facetCounts(mockAuthorizations, sf.draft, "types", (r) => r.type),
    [sf.draft]
  )

  const draftSelected = sf.draft.statuses.length + sf.draft.types.length

  return (
    <PageShell
      title="Inline Filters + Apply"
      description="All filter controls sit inline in the toolbar, but nothing runs until you Apply — the right model when each query is an expensive server call. Triggers show what you've staged; the Apply button previews the result count and lights up only when there are pending changes."
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
          {draftSelected > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={sf.clearDraft}
            >
              Clear
            </Button>
          )}
        </>
      }
    >
      {(visibility) => (
        <AuthTable rows={sf.appliedRows} visibility={visibility} />
      )}
    </PageShell>
  )
}
