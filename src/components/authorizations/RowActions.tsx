import { Ban, Download, Eye, MoreHorizontal, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Authorization } from "@/data/mockAuthorizations"

export function RowActions({ row }: { row: Authorization }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions for {row.requestId}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {row.requestId}
        </DropdownMenuLabel>
        <DropdownMenuItem>
          <Eye className="size-4" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="size-4" /> Download files
        </DropdownMenuItem>
        <DropdownMenuItem>
          <RefreshCw className="size-4" /> Resend
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Ban className="size-4" /> Cancel request
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
