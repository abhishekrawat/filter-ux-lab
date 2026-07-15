import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface PatternCard {
  to: string
  name: string
  model: string
  bestFor: string
  watchOut: string
  /** interaction cost — steps/effort to run a filter, now that all commit on Apply */
  effort: "Low" | "Medium" | "High"
}

const PATTERNS: PatternCard[] = [
  {
    to: "/inline",
    name: "1 · Inline Filters + Apply",
    model: "All controls inline in the toolbar; edits stage, Apply commits.",
    bestFor:
      "The default. Everything visible at once, one Apply to run — fastest to compose a simple query without a per-change server hit.",
    watchOut:
      "A wide toolbar gets crowded as facets multiply; no home for a long tail of rarely-used filters.",
    effort: "Low",
  },
  {
    to: "/drawer",
    name: "2 · Filter Drawer + Apply",
    model: "Facets staged in a right Sheet, committed on Apply.",
    bestFor:
      "Complex multi-field queries and many facets. Draft result count de-risks the Apply click; toolbar stays uncluttered.",
    watchOut:
      "Two extra interactions (open, apply). Controls hide behind the trigger, so applied state is echoed twice: a count badge and a removable chip per value.",
    effort: "Medium",
  },
  {
    to: "/progressive",
    name: "3 · Progressive Disclosure",
    model: "Primary filters inline, long tail behind “More filters”; Apply commits.",
    bestFor:
      "Usage heavily skewed to 2–3 filters (typical for ops logs). Calm default, everything ≤ 1 click deep.",
    watchOut:
      "Staged values hidden in the collapsed section are easy to forget — the count badge on the toggle is load-bearing, not decoration.",
    effort: "Low",
  },
  {
    to: "/chips",
    name: "4 · Filter Chips + Summary Bar",
    model: "Inline facets stage; a chip per APPLIED value sits below the toolbar.",
    bestFor:
      "Transparency and undo: the chip bar always answers “what's filtering now?”, and each value is one click to remove.",
    watchOut:
      "Two layers of state (draft on triggers, applied on chips) to learn; the bar consumes vertical space above a dense table.",
    effort: "Low",
  },
  {
    to: "/command",
    name: "5 · Command Multi-Select",
    model:
      "The reference faceted filter — the searchable multi-select combobox every pattern shares.",
    bestFor:
      "Triage queries (“Pending OR Submitted”) and long option lists, since each list is searchable. Per-option counts guide the choice.",
    watchOut:
      "Facet counts need one aggregate query per facet on a real backend — cache or drop them if that's too costly.",
    effort: "Low",
  },
  {
    to: "/modal",
    name: "6 · Filter Modal + Apply",
    model:
      "Same staged model as the drawer, but filters open in a centered modal — facets in a 2-column grid.",
    bestFor:
      "Composing a query as a deliberate, focused step: the dimmed backdrop and extra width suit a larger facet set better than a narrow side panel.",
    watchOut:
      "A modal fully blocks the table while open (no glancing at results behind it), and overlaps heavily with pattern 2 — the choice is mostly placement.",
    effort: "Medium",
  },
]

const effortStyle: Record<PatternCard["effort"], string> = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
}

export default function Overview() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Data Table Filter UX Lab
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Six functional prototypes for finding records in a wide, massive
          authorization transaction log (18 columns, 150 mock rows standing in
          for millions). Because filtering a table this size is an expensive
          server query, <em>every</em> pattern stages edits and commits on an
          explicit <strong>Apply</strong> — one request per Apply, never one per
          keystroke. What varies is how filters are <em>composed and surfaced</em>,
          so usability tests compare patterns, not implementations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PATTERNS.map((p) => (
          <Link
            key={p.to}
            to={p.to}
            className="group flex flex-col gap-2 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-medium">{p.name}</h2>
              <Badge variant="outline" className={effortStyle[p.effort]}>
                {p.effort} interaction cost
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{p.model}</p>
            <p className="text-xs leading-relaxed">
              <span className="font-medium text-emerald-700">Best for:</span>{" "}
              {p.bestFor}
            </p>
            <p className="text-xs leading-relaxed">
              <span className="font-medium text-amber-700">Watch out:</span>{" "}
              {p.watchOut}
            </p>
            <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary opacity-70 group-hover:opacity-100">
              Open prototype <ArrowRight className="size-3" />
            </span>
          </Link>
        ))}
      </div>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          UX research grounding (what the literature says)
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">
              Batch (Apply) filtering by necessity (NN/g):
            </span>{" "}
            instant/interactive filtering is only appropriate when results
            return fast; when each query is slow or expensive — or users compose
            several criteria before looking — batch behind an Apply button. This
            log is firmly in the second case, so all six patterns commit on
            Apply and preview the result count before running.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Show pending vs. applied state:
            </span>{" "}
            with staged filters the controls (draft) can differ from what's on
            screen (applied). Every page signals this — a lit Apply button with a
            preview count, a “pending changes” hint by the result count, and an
            amber dot on drawer triggers — so users are never unsure whether
            their edits took effect.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Keep applied filters visible:
            </span>{" "}
            users abandon or mistrust result sets when they can't see why rows
            are excluded. Removable chips (patterns 2, 4, 6) and value badges +
            counts on every trigger are the standard mitigations.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Progressive disclosure:
            </span>{" "}
            filter usage is Zipf-distributed — 2–3 filters get ~80% of use.
            Showing everything at once slows everyone to serve the rare case;
            hiding everything (drawer) taxes the common case. Pattern 3 splits
            the difference.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Show result counts before commitment:
            </span>{" "}
            the Apply button's live “N results” preview and per-option facet
            counts prevent dead-end (zero-result) filter states — a top cause of
            filter abandonment.
          </li>
        </ul>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Performance &amp; server-side notes
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This prototype filters 150 rows client-side; the real log will not
          fit in the browser. The shared <code className="rounded bg-muted px-1 py-0.5 text-xs">Filters</code>{" "}
          object is deliberately shaped like a server contract — it serializes
          directly to query params. For production:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">One query per Apply:</span>{" "}
            staging is what makes this affordable — the committed{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">applied</code>{" "}
            filter set fires a single request
            (<code className="rounded bg-muted px-1 py-0.5 text-xs">GET /authorizations?status=Pending&amp;from=2026-06-01&amp;page=2</code>);
            the in-progress <code className="rounded bg-muted px-1 py-0.5 text-xs">draft</code> never hits the network.
          </li>
          <li>
            <span className="font-medium text-foreground">Cancel stale requests:</span>{" "}
            even one-per-Apply, a fast second Apply can overtake the first — use
            AbortController / TanStack Query so the latest response always wins.
          </li>
          <li>
            <span className="font-medium text-foreground">Keyset pagination:</span>{" "}
            OFFSET degrades linearly on deep pages; paginate on
            <code className="rounded bg-muted px-1 py-0.5 text-xs">(submitted_at, request_id)</code>{" "}
            instead. Numbered pagination then becomes prev/next — worth
            validating with users whether jumping to page 7 actually matters.
          </li>
          <li>
            <span className="font-medium text-foreground">Cheap counts:</span>{" "}
            the Apply preview count and per-option facet counts each cost a query.
            Use estimated counts (“~12,400 results”) or a cap (“10,000+”), and
            cache or drop facet counts if the backend can't afford one aggregate
            per facet.
          </li>
          <li>
            <span className="font-medium text-foreground">Filters in the URL:</span>{" "}
            serialize the <em>applied</em> filters to search params so views are
            shareable/bookmarkable and survive refresh — disproportionately
            valuable for support/ops teams handing cases to each other.
          </li>
          <li>
            <span className="font-medium text-foreground">Virtualize only if needed:</span>{" "}
            at 25–50 rows per page, plain DOM rendering is fine. Row
            virtualization (TanStack Virtual) only pays off if a “load more /
            infinite” model replaces pagination.
          </li>
        </ul>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Suggested usability test plan</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Tasks:</span> (a) find a
            specific request by partial ID; (b) “all Rejected cancellations
            from last month”; (c) “Pending or Submitted for payer INS-2048”;
            (d) undo one criterion without losing the rest.
          </li>
          <li>
            <span className="font-medium text-foreground">Measures:</span>{" "}
            time-on-task, error/dead-end (zero-result) rate, and confidence
            (“how sure are you the list shows what you asked for?”). Watch
            specifically whether users notice the Apply step and the pending-vs-
            applied distinction — the main risk the staged model introduces.
          </li>
          <li>
            <span className="font-medium text-foreground">Working hypothesis:</span>{" "}
            a hybrid wins — inline Status + Date (pattern 1/3) + chips for
            applied state (4), with the drawer (2/6) reserved for the full facet
            set. Test to confirm which pieces earn their complexity.
          </li>
        </ol>
      </section>
    </div>
  )
}
