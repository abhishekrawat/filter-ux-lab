import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import Overview from "@/pages/Overview"
import InlineAutoApply from "@/pages/InlineAutoApply"
import FilterDrawer from "@/pages/FilterDrawer"
import ProgressiveDisclosure from "@/pages/ProgressiveDisclosure"
import FilterChips from "@/pages/FilterChips"
import CommandPalette from "@/pages/CommandPalette"
import FilterModal from "@/pages/FilterModal"

// Matches Vite's base so routes work under the GitHub Pages subpath
// (/filter-ux-lab) in production and at root during local dev.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/"

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/inline" element={<InlineAutoApply />} />
          <Route path="/drawer" element={<FilterDrawer />} />
          <Route path="/progressive" element={<ProgressiveDisclosure />} />
          <Route path="/chips" element={<FilterChips />} />
          <Route path="/command" element={<CommandPalette />} />
          <Route path="/modal" element={<FilterModal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
