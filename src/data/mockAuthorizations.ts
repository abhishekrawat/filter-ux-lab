// Shared mock dataset: authorization transaction log.
// Deterministic (seeded PRNG) so rows are stable across reloads and pattern pages.

export const AUTH_STATUSES = [
  "Submitted",
  "Pending",
  "Approved",
  "Rejected",
  "Responded",
  "Expired",
] as const
export type AuthStatus = (typeof AUTH_STATUSES)[number]

export const AUTH_TYPES = [
  "New Authorization",
  "Cancellation",
  "Status enquiry",
] as const
export type AuthType = (typeof AUTH_TYPES)[number]

export interface Authorization {
  requestId: string
  senderId: string
  receiverId: string
  payerId: string
  memberId: string
  entityId: string
  type: AuthType
  fileName: string
  status: AuthStatus
  submittedAt: Date
  respondedAt: Date | null
  cancelledAt: Date | null
  statusEnquiryAt: Date | null
  extension: boolean
  requestXml: string
  responseId: string | null
  responseXml: string | null
}

// mulberry32 — tiny seeded PRNG, keeps the dataset identical on every load
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260714)

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]
}

function pickWeighted<T>(items: readonly [T, number][]): T {
  const total = items.reduce((sum, [, w]) => sum + w, 0)
  let roll = rand() * total
  for (const [item, weight] of items) {
    roll -= weight
    if (roll <= 0) return item
  }
  return items[items.length - 1][0]
}

const CITIES = ["AD", "AA", "DF"] as const
const SENDERS = ["MF4521", "MF1187", "MF3306", "MF7742", "MF2159", "MF6018"]
const RECEIVERS = ["DOH-AD01", "A001", "A025", "D001", "E001"]
const PAYERS = ["INS-1024", "INS-2048", "INS-3072", "INS-4096", "INS-5120"]
export const ENTITY_IDS = ["01509", "20520", "32420", "65720", "80720", "89020"]

const DATASET_START = new Date(2026, 0, 15) // 15 Jan 2026
const DATASET_END = new Date(2026, 6, 14) // 14 Jul 2026 ("today" for the prototype)
const RANGE_MS = DATASET_END.getTime() - DATASET_START.getTime()

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0")
}

function ymd(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}`
}

function randomBusinessTime(base: Date): Date {
  const d = new Date(base)
  d.setHours(7 + Math.floor(rand() * 12), Math.floor(rand() * 60), 0, 0)
  return d
}

function hoursLater(from: Date, minHours: number, maxHours: number): Date {
  const span = (minHours + rand() * (maxHours - minHours)) * 3_600_000
  return new Date(from.getTime() + span)
}

function maskedMemberId(): string {
  const tail = pad(Math.floor(rand() * 10000), 4)
  return `784-****-***${tail}`
}

function buildRow(index: number): Authorization {
  const city = pick(CITIES)
  const submittedDay = new Date(DATASET_START.getTime() + rand() * RANGE_MS)
  const submittedAt = randomBusinessTime(submittedDay)
  const seq = pad(index + 1, 4)

  const type = pickWeighted<AuthType>([
    ["New Authorization", 70],
    ["Cancellation", 15],
    ["Status enquiry", 15],
  ])

  const status = pickWeighted<AuthStatus>([
    ["Submitted", 12],
    ["Pending", 18],
    ["Approved", 30],
    ["Rejected", 14],
    ["Responded", 18],
    ["Expired", 8],
  ])

  const hasResponse = ["Approved", "Rejected", "Responded"].includes(status)
  const respondedAt = hasResponse ? hoursLater(submittedAt, 1, 96) : null

  // Cancellations always carry a cancellation timestamp; ~12% of other rows do too
  const cancelledAt =
    type === "Cancellation" || rand() < 0.12
      ? hoursLater(respondedAt ?? submittedAt, 2, 120)
      : null

  // Status enquiries always carry an enquiry timestamp; ~20% of other rows do too
  const statusEnquiryAt =
    type === "Status enquiry" || rand() < 0.2
      ? hoursLater(submittedAt, 4, 144)
      : null

  const fileExt = rand() < 0.6 ? "zip" : "xml"
  const fileSeq = pad((index % 999) + 1, 3)
  const dateStamp = ymd(submittedAt)

  return {
    requestId: `AUTH_${city}_${dateStamp}_${seq}`,
    senderId: pick(SENDERS),
    receiverId: pick(RECEIVERS),
    payerId: pick(PAYERS),
    memberId: maskedMemberId(),
    entityId: pick(ENTITY_IDS),
    type,
    fileName: `AUTHREQ_${city}_${dateStamp}_${fileSeq}.${fileExt}`,
    status,
    submittedAt,
    respondedAt,
    cancelledAt,
    statusEnquiryAt,
    extension: rand() < 0.15,
    requestXml: `AUTHREQ_${city}_${dateStamp}_${fileSeq}.xml`,
    responseId: hasResponse ? `RESP_${city}_${ymd(respondedAt!)}_${seq}` : null,
    responseXml: hasResponse
      ? `AUTHRSP_${city}_${ymd(respondedAt!)}_${fileSeq}.xml`
      : null,
  }
}

export const mockAuthorizations: Authorization[] = Array.from(
  { length: 150 },
  (_, i) => buildRow(i)
).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())

export function formatDateTime(d: Date | null): string {
  if (!d) return "—"
  const day = d.getDate()
  const month = d.toLocaleString("en-GB", { month: "short" })
  const year = d.getFullYear()
  let hours = d.getHours()
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${day} ${month} ${year}, ${hours}:${pad(d.getMinutes(), 2)} ${ampm}`
}
