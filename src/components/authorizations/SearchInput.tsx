import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  /** Fired on Enter — used to commit staged filters (Apply) from the search box. */
  onSubmit?: () => void
}

export function SearchInput({
  value,
  onChange,
  className,
  placeholder = "Search ID, member, payer, file…",
  onSubmit,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.()
        }}
        placeholder={placeholder}
        className="pl-8"
        aria-label="Search authorizations"
      />
    </div>
  )
}
