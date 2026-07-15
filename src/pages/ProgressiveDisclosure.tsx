import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AUTH_STATUSES,
  AUTH_TYPES,
  ENTITY_IDS,
  mockAuthorizations,
} from "@/data/mockAuthorizations"
import { facetCounts, useStagedFilters } from "@/lib/filters"
import { ApplyButton } from "@/components/authorizations/ApplyButton"
import { AuthTable } from "@/components/authorizations/AuthTable"
import { DateRangeFilter } from "@/components/authorizations/DateRangeFilter"
import { FacetedFilter } from "@/components/authorizations/FacetedFilter"
import { PageShell } from "@/components/authorizations/PageShell"
import { SearchInput } from "@/components/authorizations/SearchInput"

const PAYERS = ["INS-1024", "INS-2048", "INS-3072", "INS-4096", "INS-5120"]

// Pattern 3 — progressive disclosure with Apply. The two most-used filters
// (Status, Date) stay inline; the long tail (Type, Payer, Entity) sits behind
// "More filters". All are searchable multi-selects that stage into the draft
// and commit on Apply. The badge on the collapsed toggle counts staged values
// hidden inside, so nothing is composed invisibly.
export default function ProgressiveDisclosure() {
  const sf = useStagedFilters(mockAuthorizations)
  const [expanded, setExpanded] = useState(false)

  const counts = useMemo(
    () => ({
      status: facetCounts(mockAuthorizations, sf.draft, "statuses", (r) => r.status),
      type: facetCounts(mockAuthorizations, sf.draft, "types", (r) => r.type),
      payer: facetCounts(mockAuthorizations, sf.draft, "payerIds", (r) => r.payerId),
      entity: facetCounts(mockAuthorizations, sf.draft, "entityIds", (r) => r.entityId),
    }),
    [sf.draft]
  )

  const hiddenStaged =
    sf.draft.types.length + sf.draft.payerIds.length + sf.draft.entityIds.length

  return (
    <PageShell
      title="Progressive Disclosure"
      description="The two filters used most often (Status, Date range) are always visible; the long tail sits behind “More filters”. All facets are searchable multi-selects that stage into a draft and commit on Apply. The badge on the collapsed toggle counts staged values hidden inside, so nothing filters — or waits to filter — invisibly."
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
            counts={counts.status}
          />
          <DateRangeFilter
            value={{ from: sf.draft.dateFrom, to: sf.draft.dateTo }}
            onChange={(r) => {
              sf.setField("dateFrom", r.from)
              sf.setField("dateTo", r.to)
            }}
          />
          <Button variant="ghost" onClick={() => setExpanded((e) => !e)}>
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            More filters
            {!expanded && hiddenStaged > 0 && (
              <Badge variant="secondary" className="rounded-sm px-1.5">
                {hiddenStaged}
              </Badge>
            )}
          </Button>
          <ApplyButton
            dirty={sf.isDirty}
            draftCount={sf.draftCount}
            onApply={sf.apply}
          />
        </>
      }
      subToolbar={
        expanded ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3">
            <FacetedFilter
              title="Type"
              options={AUTH_TYPES}
              selected={sf.draft.types}
              onChange={(v) => sf.setField("types", v as typeof sf.draft.types)}
              counts={counts.type}
            />
            <FacetedFilter
              title="Payer"
              options={PAYERS}
              selected={sf.draft.payerIds}
              onChange={(v) => sf.setField("payerIds", v)}
              counts={counts.payer}
            />
            <FacetedFilter
              title="Entity"
              options={ENTITY_IDS}
              selected={sf.draft.entityIds}
              onChange={(v) => sf.setField("entityIds", v)}
              counts={counts.entity}
            />
            {hiddenStaged > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  sf.setField("types", [])
                  sf.setField("payerIds", [])
                  sf.setField("entityIds", [])
                }}
              >
                Reset advanced ({hiddenStaged})
              </Button>
            )}
          </div>
        ) : null
      }
    >
      {(visibility) => (
        <AuthTable rows={sf.appliedRows} visibility={visibility} />
      )}
    </PageShell>
  )
}
