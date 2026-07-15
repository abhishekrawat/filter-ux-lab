import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { COLUMNS, type ColumnVisibility } from "./columns"

interface ColumnsMenuProps {
  visibility: ColumnVisibility
  onToggle: (key: string, visible: boolean) => void
}

export function ColumnsMenu({ visibility, onToggle }: ColumnsMenuProps) {
  const hiddenCount = COLUMNS.filter((c) => visibility[c.key] === false).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Settings2 className="size-4" />
          Columns
          {hiddenCount > 0 && (
            <span className="text-xs text-muted-foreground">
              ({COLUMNS.length - hiddenCount}/{COLUMNS.length})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-56 overflow-y-auto">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {COLUMNS.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={visibility[col.key] !== false}
            disabled={!col.hideable}
            onCheckedChange={(checked) => onToggle(col.key, checked)}
            onSelect={(e) => e.preventDefault()}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
