import { useMemo, useState } from "react"
import type {
  Authorization,
  AuthStatus,
  AuthType,
} from "@/data/mockAuthorizations"

// One shared filter model across all six UX patterns — the patterns differ in
// how filters are set (inline, staged drawer, chips, palette), never in what
// they do. This mirrors a server contract: the same object would serialize to
// query params for a server-side implementation.
export interface Filters {
  q: string
  statuses: AuthStatus[]
  types: AuthType[]
  payerIds: string[]
  entityIds: string[]
  dateFrom: Date | null
  dateTo: Date | null
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  statuses: [],
  types: [],
  payerIds: [],
  entityIds: [],
  dateFrom: null,
  dateTo: null,
}

const SEARCHED_FIELDS: (keyof Authorization)[] = [
  "requestId",
  "senderId",
  "receiverId",
  "payerId",
  "memberId",
  "entityId",
  "fileName",
  "responseId",
]

export function applyFilters(
  rows: Authorization[],
  filters: Filters
): Authorization[] {
  const q = filters.q.trim().toLowerCase()
  const from = filters.dateFrom ? startOfDay(filters.dateFrom).getTime() : null
  const to = filters.dateTo ? endOfDay(filters.dateTo).getTime() : null

  return rows.filter((row) => {
    if (filters.statuses.length && !filters.statuses.includes(row.status))
      return false
    if (filters.types.length && !filters.types.includes(row.type)) return false
    if (filters.payerIds.length && !filters.payerIds.includes(row.payerId))
      return false
    if (filters.entityIds.length && !filters.entityIds.includes(row.entityId))
      return false

    const submitted = row.submittedAt.getTime()
    if (from !== null && submitted < from) return false
    if (to !== null && submitted > to) return false

    if (q) {
      const hit = SEARCHED_FIELDS.some((field) => {
        const value = row[field]
        return typeof value === "string" && value.toLowerCase().includes(q)
      })
      if (!hit) return false
    }
    return true
  })
}

// Total applied criteria, counting each selected value once (a date range
// counts as one). Drives the "N" indicators on filter triggers.
export function countSelectedValues(filters: Filters): number {
  return (
    filters.statuses.length +
    filters.types.length +
    filters.payerIds.length +
    filters.entityIds.length +
    (filters.dateFrom || filters.dateTo ? 1 : 0)
  )
}

// Per-option result counts for one facet, computed against rows filtered by
// every OTHER facet - so options never show 0 just because a sibling value
// in the same facet is selected.
export function facetCounts(
  data: Authorization[],
  filters: Filters,
  exclude: "statuses" | "types" | "payerIds" | "entityIds",
  key: (row: Authorization) => string
): Map<string, number> {
  const base = applyFilters(data, { ...filters, [exclude]: [] })
  const counts = new Map<string, number>()
  for (const row of base) {
    const k = key(row)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return counts
}

function startOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v) => b.includes(v))
}

function sameDate(a: Date | null, b: Date | null): boolean {
  return (a?.getTime() ?? null) === (b?.getTime() ?? null)
}

export function filtersEqual(a: Filters, b: Filters): boolean {
  return (
    a.q.trim() === b.q.trim() &&
    sameSet(a.statuses, b.statuses) &&
    sameSet(a.types, b.types) &&
    sameSet(a.payerIds, b.payerIds) &&
    sameSet(a.entityIds, b.entityIds) &&
    sameDate(a.dateFrom, b.dateFrom) &&
    sameDate(a.dateTo, b.dateTo)
  )
}

// Staged filtering shared by every pattern. Because filtering hits the server
// on a large table, nothing runs on each control change: edits accumulate in
// `draft`, and only `apply()` commits draft → applied (one query per Apply).
// The table reads `applied`; controls bind to `draft`; `isDirty` + `draftCount`
// drive the Apply button so the user previews the outcome before committing.
export interface StagedFilters {
  draft: Filters
  applied: Filters
  isDirty: boolean
  appliedRows: Authorization[]
  draftCount: number
  /** stage one field of the draft */
  setField: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  /** replace the whole draft (e.g. drawer "clear all", or restage) */
  setDraft: (filters: Filters) => void
  /** commit draft → applied */
  apply: () => void
  /** clear draft only (staged; nothing filters until Apply) */
  clearDraft: () => void
  /** immediate change to BOTH draft and applied — for removing an applied
   *  chip or "clear all", where the intent is to un-apply now */
  patchApplied: (partial: Partial<Filters>) => void
}

export function useStagedFilters(data: Authorization[]): StagedFilters {
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)
  const [draft, setDraftState] = useState<Filters>(EMPTY_FILTERS)

  const isDirty = useMemo(() => !filtersEqual(draft, applied), [draft, applied])
  const appliedRows = useMemo(() => applyFilters(data, applied), [data, applied])
  const draftCount = useMemo(
    () => applyFilters(data, draft).length,
    [data, draft]
  )

  return {
    draft,
    applied,
    isDirty,
    appliedRows,
    draftCount,
    setField: (key, value) => setDraftState((d) => ({ ...d, [key]: value })),
    setDraft: (filters) => setDraftState(filters),
    apply: () => setApplied(draft),
    clearDraft: () => setDraftState(EMPTY_FILTERS),
    patchApplied: (partial) => {
      setApplied((a) => ({ ...a, ...partial }))
      setDraftState((d) => ({ ...d, ...partial }))
    },
  }
}

