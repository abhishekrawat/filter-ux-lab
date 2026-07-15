import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ApplyButtonProps {
  /** draft differs from what's currently applied */
  dirty: boolean
  /** how many rows the draft WOULD return, previewed before committing */
  draftCount: number
  onApply: () => void
  className?: string
}

// Shared commit control. Because filtering is server-side and expensive, every
// pattern stages edits and commits here. When there are pending changes the
// button lights up and previews the result count ("Apply · 42 results"); with
// nothing staged it's disabled, which doubles as the "you're up to date"
// signal.
export function ApplyButton({
  dirty,
  draftCount,
  onApply,
  className,
}: ApplyButtonProps) {
  return (
    <Button
      onClick={onApply}
      disabled={!dirty}
      className={className}
      aria-live="polite"
    >
      <Check className="size-4" />
      {dirty
        ? `Apply · ${draftCount} result${draftCount === 1 ? "" : "s"}`
        : "Apply"}
    </Button>
  )
}
