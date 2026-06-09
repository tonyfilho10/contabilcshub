"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Tags,
  MessageSquare,
  Building2,
  ChevronRight,
  User,
  Calculator,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/* ─── Definição dos módulos ────────────────────────────────── */
const modulos = [
  {
    id: "contabil",
    label: "Contábil",
    icon: Calculator,
    items: [
      { title: "Dashboard",    url: "/dashboard",    icon: LayoutDashboard },
      { title: "POPs",         url: "/pops",         icon: BookOpen },
      { title: "Novo POP",     url: "/pops/novo",    icon: FileText },
      { title: "Tags",         url: "/tags",         icon: Tags },
      { title: "Comentários",  url: "/comentarios",  icon: MessageSquare },
    ],
  },
  // Novos módulos entram aqui
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">

      {/* ── Logo ────────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm tracking-wide text-sidebar-foreground">CSHUB</span>
                <span className="text-[11px] text-sidebar-foreground/60">Plataforma Contábil</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Módulos ─────────────────────────────────────────── */}
      <SidebarContent className="py-2">
        {modulos.map((modulo) => {
          const isModuloActive = modulo.items.some(
            (i) => pathname === i.url || pathname.startsWith(i.url + "/")
          )

          return (
            <SidebarGroup key={modulo.id} className="px-1">
              <SidebarMenu>
                <Collapsible defaultOpen={isModuloActive || true} className="group/collapsible">
                  <SidebarMenuItem>
                    {/* Cabeçalho do módulo */}
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={modulo.label}
                          className={cn(
                            "font-semibold text-sidebar-foreground/80 hover:text-sidebar-foreground",
                            isModuloActive && "text-sidebar-primary"
                          )}
                        />
                      }
                    >
                      <modulo.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{modulo.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 shrink-0" />
                    </CollapsibleTrigger>

                    {/* Sub-itens do módulo */}
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {modulo.items.map((item) => {
                          const active =
                            pathname === item.url ||
                            (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"))
                          return (
                            <SidebarMenuSubItem key={item.url}>
                              <SidebarMenuSubButton
                                render={<Link href={item.url} />}
                                isActive={active}
                              >
                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{item.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      {/* ── Rodapé: perfil + tema ────────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border pt-2 pb-2 space-y-1">
        <SidebarMenu>
          {/* Perfil */}
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/perfil" />}
              tooltip="Meu Perfil"
              isActive={pathname === "/perfil"}
              className="gap-2.5"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold">
                  US
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-sm font-medium truncate text-sidebar-foreground">Usuário</span>
                <span className="text-[11px] text-sidebar-foreground/60 truncate">Meu perfil</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Tema */}
          <SidebarMenuItem>
            <div className={cn("flex items-center gap-2 px-2 py-1", collapsed && "justify-center")}>
              <ThemeToggle />
              {!collapsed && (
                <span className="text-xs text-sidebar-foreground/60">Tema</span>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
