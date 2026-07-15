import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AuthStatus } from "@/data/mockAuthorizations"

const STATUS_STYLES: Record<AuthStatus, string> = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Responded: "bg-violet-50 text-violet-700 border-violet-200",
  Expired: "bg-neutral-100 text-neutral-500 border-neutral-200",
}

export function StatusBadge({ status }: { status: AuthStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status])}>
      {status}
    </Badge>
  )
}
