import { NavLink, Outlet, useLocation } from "react-router-dom"
import {
  Columns3,
  Command,
  LayoutDashboard,
  ListFilter,
  PanelRight,
  Rows3,
  SquareStack,
  Tags,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const NAV = [
  {
    label: "Start here",
    items: [{ to: "/", title: "Overview & findings", icon: LayoutDashboard }],
  },
  {
    label: "Filter patterns",
    items: [
      { to: "/inline", title: "1 · Inline + Apply", icon: ListFilter },
      { to: "/drawer", title: "2 · Filter Drawer + Apply", icon: PanelRight },
      { to: "/progressive", title: "3 · Progressive Disclosure", icon: Rows3 },
      { to: "/chips", title: "4 · Chips + Summary Bar", icon: Tags },
      { to: "/command", title: "5 · Command Multi-Select", icon: Command },
      { to: "/modal", title: "6 · Filter Modal + Apply", icon: SquareStack },
    ],
  },
]

export function AppLayout() {
  const location = useLocation()
  const current = NAV.flatMap((g) => g.items).find(
    (i) => i.to === location.pathname
  )

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Columns3 className="size-5" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">Filter UX Lab</p>
              <p className="text-xs text-muted-foreground">
                Authorization log · prototype
              </p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {NAV.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.to}
                      >
                        <NavLink to={item.to}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">
            {current?.title ?? "Filter UX Lab"}
          </span>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
