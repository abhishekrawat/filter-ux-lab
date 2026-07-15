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

// Pattern 5 — the reference faceted filter: searchable Command-in-Popover
// multi-selects with checkmarks and per-option counts. Selections stage into
// the draft and commit on Apply, so composing an OR query ("Pending or
// Submitted") is a single server round-trip when you confirm.
export default function CommandPalette() {
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
      title="Command Palette Multi-Select"
      description="Searchable multi-select comboboxes (Command in a Popover) with checkmarks and per-option result counts — the control the other patterns share. Selections stage; the in-list search keeps long option lists workable, and Apply commits the whole set in one query."
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
              Reset
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
