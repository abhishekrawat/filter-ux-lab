import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface DateRangeValue {
  from: Date | null
  to: Date | null
}

interface DateRangeFilterProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  className?: string
}

// "Today" is pinned to the dataset's last day so presets always hit data.
const TODAY = new Date(2026, 6, 14)

const PRESETS: { label: string; days: number }[] = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 180 days", days: 180 },
]

function formatShort(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function rangeLabel(value: DateRangeValue): string | null {
  const preset = PRESETS.find((p) => {
    if (!value.from || !value.to) return false
    const from = new Date(TODAY)
    from.setDate(from.getDate() - p.days + 1)
    return (
      value.from.toDateString() === from.toDateString() &&
      value.to.toDateString() === TODAY.toDateString()
    )
  })
  if (preset) return preset.label
  if (value.from && value.to)
    return `${formatShort(value.from)} – ${formatShort(value.to)}`
  if (value.from) return `From ${formatShort(value.from)}`
  if (value.to) return `Until ${formatShort(value.to)}`
  return null
}

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const label = rangeLabel(value)
  const hasValue = Boolean(value.from || value.to)

  const applyPreset = (days: number) => {
    const from = new Date(TODAY)
    from.setDate(from.getDate() - days + 1)
    onChange({ from, to: new Date(TODAY) })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start font-normal",
            !hasValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {label ?? "Date range"}
          {hasValue && (
            <X
              className="ml-1 size-3.5 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ from: null, to: null })
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-auto p-0">
        <div className="flex flex-col gap-1 border-r p-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() => applyPreset(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
          <Separator className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="justify-start font-normal text-muted-foreground"
            onClick={() => {
              onChange({ from: null, to: null })
              setOpen(false)
            }}
          >
            Any time
          </Button>
        </div>
        <Calendar
          mode="range"
          defaultMonth={value.from ?? new Date(2026, 5, 1)}
          numberOfMonths={2}
          selected={
            value.from || value.to
              ? ({ from: value.from ?? undefined, to: value.to ?? undefined } as DateRange)
              : undefined
          }
          onSelect={(range: DateRange | undefined) =>
            onChange({ from: range?.from ?? null, to: range?.to ?? null })
          }
        />
      </PopoverContent>
    </Popover>
  )
}
