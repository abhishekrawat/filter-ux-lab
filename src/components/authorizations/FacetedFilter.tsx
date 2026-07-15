import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface FacetedFilterProps {
  title: string
  options: readonly string[]
  selected: string[]
  onChange: (selected: string[]) => void
  counts?: Map<string, number>
  searchable?: boolean
  className?: string
}

// Command-in-Popover multi-select ("faceted filter"): checkmarks, count badge
// on the trigger, optional per-option result counts, and a clear action.
export function FacetedFilter({
  title,
  options,
  selected,
  onChange,
  counts,
  searchable = true,
  className,
}: FacetedFilterProps) {
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("border-dashed", className)}>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          {title}
          {selected.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4" />
              {selected.length > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1.5">
                  {selected.length} selected
                </Badge>
              ) : (
                selected.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-sm px-1.5">
                    {s}
                  </Badge>
                ))
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          {searchable && <CommandInput placeholder={`Filter ${title.toLowerCase()}…`} />}
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option)
                const count = counts?.get(option) ?? 0
                return (
                  <CommandItem key={option} onSelect={() => toggle(option)}>
                    <div
                      className={cn(
                        "flex size-4 items-center justify-center rounded-[4px] border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-3" />
                    </div>
                    <span className="flex-1">{option}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {count}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className="justify-center text-center text-muted-foreground"
                    onSelect={() => onChange([])}
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
