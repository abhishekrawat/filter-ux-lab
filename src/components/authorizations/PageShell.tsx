import { useState, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DEFAULT_VISIBILITY,
  type ColumnVisibility,
} from "./columns"
import { ColumnsMenu } from "./ColumnsMenu"

interface PageShellProps {
  title: string
  description: string
  toolbar: ReactNode
  /** Rendered between toolbar and table — chips row, expanded filters, etc. */
  subToolbar?: ReactNode
  resultCount: number
  totalCount: number
  /** true when staged edits haven't been applied — shows a "stale" hint */
  pending?: boolean
  children: (visibility: ColumnVisibility) => ReactNode
}

// Shared page scaffold: heading, toolbar row (pattern-specific filter zone +
// shared CTA and Columns menu), result count, and the table.
export function PageShell({
  title,
  description,
  toolbar,
  subToolbar,
  resultCount,
  totalCount,
  pending,
  children,
}: PageShellProps) {
  const [visibility, setVisibility] =
    useState<ColumnVisibility>(DEFAULT_VISIBILITY)

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {toolbar}
        <div className="ml-auto flex items-center gap-2">
          <ColumnsMenu
            visibility={visibility}
            onToggle={(key, visible) =>
              setVisibility((v) => ({ ...v, [key]: visible }))
            }
          />
          <Button>
            <Plus className="size-4" />
            New Authorization
          </Button>
        </div>
      </div>

      {subToolbar}

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {resultCount === totalCount
          ? `Showing all ${totalCount} requests`
          : `${resultCount} of ${totalCount} requests match`}
        {pending && (
          <span className="ml-2 font-medium text-amber-600">
            · pending changes — Apply to update the table
          </span>
        )}
      </p>

      {children(visibility)}
    </div>
  )
}
