import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// One removable chip per applied value. With multi-select facets a single
// trigger can hold many values, so this bar is the canonical answer to
// "which filters are applied?" — every value is visible and individually
// removable, regardless of which control set it.
export interface FilterChip {
  key: string
  label: string
  value: string
  onRemove: () => void
}

interface AppliedFiltersBarProps {
  chips: FilterChip[]
  onClearAll: () => void
}

export function AppliedFiltersBar({ chips, onClearAll }: AppliedFiltersBarProps) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">
        Active filters
      </span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 rounded-md py-1 pr-1 pl-2.5"
        >
          <span className="font-normal text-muted-foreground">
            {chip.label}:
          </span>
          <span className="font-medium">{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} ${chip.value} filter`}
            className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-muted-foreground"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  )
}
