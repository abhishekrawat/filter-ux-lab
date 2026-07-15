import { useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AUTH_STATUSES,
  AUTH_TYPES,
  ENTITY_IDS,
  mockAuthorizations,
} from "@/data/mockAuthorizations"
import {
  countSelectedValues,
  EMPTY_FILTERS,
  facetCounts,
  useStagedFilters,
} from "@/lib/filters"
import {
  AppliedFiltersBar,
  type FilterChip,
} from "@/components/authorizations/AppliedFiltersBar"
import { AuthTable } from "@/components/authorizations/AuthTable"
import {
  DateRangeFilter,
  rangeLabel,
} from "@/components/authorizations/DateRangeFilter"
import { FacetedFilter } from "@/components/authorizations/FacetedFilter"
import { PageShell } from "@/components/authorizations/PageShell"
import { SearchInput } from "@/components/authorizations/SearchInput"

const PAYERS = ["INS-1024", "INS-2048", "INS-3072", "INS-4096", "INS-5120"]

// Pattern 2 — batch filtering in a right-side drawer. Multi-select facets are
// staged in the Sheet and committed on Apply (the classic "compose then run"
// model, ideal when each query is expensive). Because the controls hide behind
// the trigger, applied state surfaces twice: a value-count badge on the Filters
// button, and a removable chip per applied value below the toolbar.
export default function FilterDrawer() {
  const sf = useStagedFilters(mockAuthorizations)
  const [open, setOpen] = useState(false)

  const draftCounts = useMemo(
    () => ({
      status: facetCounts(mockAuthorizations, sf.draft, "statuses", (r) => r.status),
      type: facetCounts(mockAuthorizations, sf.draft, "types", (r) => r.type),
      payer: facetCounts(mockAuthorizations, sf.draft, "payerIds", (r) => r.payerId),
      entity: facetCounts(mockAuthorizations, sf.draft, "entityIds", (r) => r.entityId),
    }),
    [sf.draft]
  )

  const activeCount = countSelectedValues(sf.applied)
  const { applied } = sf

  const chips: FilterChip[] = [
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
    })),
    ...applied.payerIds.map((v) => ({
      key: `payer-${v}`,
      label: "Payer",
      value: v,
      onRemove: () =>
        sf.patchApplied({ payerIds: applied.payerIds.filter((x) => x !== v) }),
    })),
    ...applied.entityIds.map((v) => ({
      key: `entity-${v}`,
      label: "Entity",
      value: v,
      onRemove: () =>
        sf.patchApplied({ entityIds: applied.entityIds.filter((x) => x !== v) }),
    })),
  ]
  if (applied.q.trim())
    chips.unshift({
      key: "q",
      label: "Search",
      value: `“${applied.q.trim()}”`,
      onRemove: () => sf.patchApplied({ q: "" }),
    })
  const dateLabel = rangeLabel({ from: applied.dateFrom, to: applied.dateTo })
  if (dateLabel)
    chips.push({
      key: "date",
      label: "Submitted",
      value: dateLabel,
      onRemove: () => sf.patchApplied({ dateFrom: null, dateTo: null }),
    })

  const facetFields = [
    { key: "statuses" as const, label: "Status", options: AUTH_STATUSES, counts: draftCounts.status },
    { key: "types" as const, label: "Type", options: AUTH_TYPES, counts: draftCounts.type },
    { key: "payerIds" as const, label: "Payer ID", options: PAYERS, counts: draftCounts.payer },
    { key: "entityIds" as const, label: "Entity ID", options: ENTITY_IDS, counts: draftCounts.entity },
  ]

  return (
    <PageShell
      title="Filter Drawer with Apply"
      description="Multi-select facets staged in a right-side drawer, committed only on Apply — one server query per Apply, not one per change. The Filters button carries the applied-value count, and every applied value is echoed as a removable chip so state is never hidden behind the trigger."
      resultCount={sf.appliedRows.length}
      totalCount={mockAuthorizations.length}
      pending={sf.isDirty}
      toolbar={
        <>
          <SearchInput
            value={sf.draft.q}
            onChange={(v) => sf.setField("q", v)}
            onSubmit={sf.apply}
            className="w-80"
          />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="size-4" />
                Filters
                {activeCount > 0 && (
                  <Badge variant="secondary" className="rounded-sm px-1.5">
                    {activeCount}
                  </Badge>
                )}
                {sf.isDirty && (
                  <span
                    className="size-1.5 rounded-full bg-amber-500"
                    aria-label="pending changes"
                  />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:max-w-[380px]">
              <SheetHeader>
                <SheetTitle>Filter requests</SheetTitle>
                <SheetDescription>
                  Changes preview below and apply only when you confirm.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-5 overflow-y-auto px-4">
                {facetFields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-2">
                    <Label>{field.label}</Label>
                    <FacetedFilter
                      title={field.label}
                      options={field.options}
                      selected={sf.draft[field.key]}
                      onChange={(next) => sf.setField(field.key, next as never)}
                      counts={field.counts}
                      className="w-full justify-start"
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <Label>Submitted between</Label>
                  <DateRangeFilter
                    value={{ from: sf.draft.dateFrom, to: sf.draft.dateTo }}
                    onChange={(r) => {
                      sf.setField("dateFrom", r.from)
                      sf.setField("dateTo", r.to)
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              <SheetFooter className="flex-row gap-2 border-t">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={sf.clearDraft}
                >
                  Clear all
                </Button>
                <Button
                  className="flex-1"
                  disabled={!sf.isDirty}
                  onClick={() => {
                    sf.apply()
                    setOpen(false)
                  }}
                >
                  Show {sf.draftCount} request{sf.draftCount === 1 ? "" : "s"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
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
