import { useEffect, useMemo, useState } from "react"
import { SearchX } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Authorization } from "@/data/mockAuthorizations"
import { COLUMNS, type ColumnVisibility } from "./columns"

interface AuthTableProps {
  rows: Authorization[]
  visibility: ColumnVisibility
}

// Numbered pagination with an ellipsis window: 1 … 4 [5] 6 … 12
function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const out: (number | "…")[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push("…")
    out.push(p)
    prev = p
  }
  return out
}

export function AuthTable({ rows, visibility }: AuthTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Filters changed → new rows array → snap back to page 1 so users never
  // land on a page that no longer exists.
  useEffect(() => {
    setPage(1)
  }, [rows])

  const visibleColumns = useMemo(
    () => COLUMNS.filter((c) => visibility[c.key] !== false),
    [visibility]
  )

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  )
  const firstRow = rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const lastRow = Math.min(safePage * pageSize, rows.length)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-h-[calc(100vh-360px)] min-h-[280px] overflow-auto rounded-lg border">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  style={{ minWidth: col.minWidth }}
                  className={cn(
                    "sticky top-0 z-20 border-b bg-muted px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-muted-foreground",
                    col.sticky && "left-0 z-30 border-r"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-3 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <SearchX className="size-8" />
                    <p className="font-medium text-foreground">
                      No matching requests
                    </p>
                    <p className="text-xs">
                      Try broadening the date range or clearing a filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={row.requestId} className="group/row">
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "border-b px-3 py-2 align-middle whitespace-nowrap group-hover/row:bg-muted",
                        col.sticky
                          ? "sticky left-0 z-10 border-r bg-background"
                          : "bg-background"
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {rows.length === 0
              ? "0 results"
              : `${firstRow}–${lastRow} of ${rows.length}`}
            {" · "}Page {safePage} of {totalPages}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger size="sm" className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={safePage <= 1}
                className={cn(safePage <= 1 && "pointer-events-none opacity-50")}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
              />
            </PaginationItem>
            {pageWindow(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <PaginationItem key={`e-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === safePage}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={safePage >= totalPages}
                className={cn(
                  safePage >= totalPages && "pointer-events-none opacity-50"
                )}
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.min(totalPages, p + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
