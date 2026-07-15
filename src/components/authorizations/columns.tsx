import type { ReactNode } from "react"
import { FileCode2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatDateTime,
  type Authorization,
} from "@/data/mockAuthorizations"
import { StatusBadge } from "./StatusBadge"
import { RowActions } from "./RowActions"

export interface ColumnDef {
  key: string
  label: string
  minWidth: number
  sticky?: boolean
  hideable: boolean
  render: (row: Authorization) => ReactNode
}

function XmlLink({ file }: { file: string | null }) {
  if (!file) return <span className="text-muted-foreground">—</span>
  return (
    <Button
      variant="link"
      size="sm"
      className="h-auto gap-1.5 p-0 text-xs font-normal"
      title={`Download ${file}`}
    >
      <FileCode2 className="size-3.5" />
      XML
    </Button>
  )
}

export const COLUMNS: ColumnDef[] = [
  {
    key: "requestId",
    label: "Request ID",
    minWidth: 220,
    sticky: true,
    hideable: false,
    render: (row) => (
      <span className="font-mono text-xs font-medium">{row.requestId}</span>
    ),
  },
  {
    key: "senderId",
    label: "Sender ID",
    minWidth: 110,
    hideable: true,
    render: (row) => <span className="font-mono text-xs">{row.senderId}</span>,
  },
  {
    key: "receiverId",
    label: "Receiver ID",
    minWidth: 110,
    hideable: true,
    render: (row) => <span className="font-mono text-xs">{row.receiverId}</span>,
  },
  {
    key: "payerId",
    label: "Payer ID",
    minWidth: 110,
    hideable: true,
    render: (row) => <span className="font-mono text-xs">{row.payerId}</span>,
  },
  {
    key: "memberId",
    label: "Member ID",
    minWidth: 150,
    hideable: true,
    render: (row) => <span className="font-mono text-xs">{row.memberId}</span>,
  },
  {
    key: "entityId",
    label: "Entity ID",
    minWidth: 100,
    hideable: true,
    render: (row) => <span className="font-mono text-xs">{row.entityId}</span>,
  },
  {
    key: "type",
    label: "Type",
    minWidth: 150,
    hideable: true,
    render: (row) => <span className="text-xs">{row.type}</span>,
  },
  {
    key: "fileName",
    label: "File Name",
    minWidth: 230,
    hideable: true,
    render: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.fileName}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    minWidth: 120,
    hideable: true,
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "submittedAt",
    label: "Submitted",
    minWidth: 170,
    hideable: true,
    render: (row) => (
      <span className="whitespace-nowrap text-xs">
        {formatDateTime(row.submittedAt)}
      </span>
    ),
  },
  {
    key: "respondedAt",
    label: "Responded",
    minWidth: 170,
    hideable: true,
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(row.respondedAt)}
      </span>
    ),
  },
  {
    key: "cancelledAt",
    label: "Cancellation",
    minWidth: 170,
    hideable: true,
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(row.cancelledAt)}
      </span>
    ),
  },
  {
    key: "statusEnquiryAt",
    label: "Status enquiry",
    minWidth: 170,
    hideable: true,
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(row.statusEnquiryAt)}
      </span>
    ),
  },
  {
    key: "extension",
    label: "Extension",
    minWidth: 100,
    hideable: true,
    render: (row) =>
      row.extension ? (
        <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
          Yes
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">No</span>
      ),
  },
  {
    key: "requestXml",
    label: "Request XML",
    minWidth: 110,
    hideable: true,
    render: (row) => <XmlLink file={row.requestXml} />,
  },
  {
    key: "responseId",
    label: "Response ID",
    minWidth: 210,
    hideable: true,
    render: (row) =>
      row.responseId ? (
        <span className="font-mono text-xs">{row.responseId}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "responseXml",
    label: "Response XML",
    minWidth: 120,
    hideable: true,
    render: (row) => <XmlLink file={row.responseXml} />,
  },
  {
    key: "actions",
    label: "Actions",
    minWidth: 70,
    hideable: false,
    render: (row) => <RowActions row={row} />,
  },
]

export type ColumnVisibility = Record<string, boolean>

export const DEFAULT_VISIBILITY: ColumnVisibility = Object.fromEntries(
  COLUMNS.map((c) => [c.key, true])
)
