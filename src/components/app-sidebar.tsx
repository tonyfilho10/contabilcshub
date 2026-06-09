"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, BookOpen } from "lucide-react"

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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/* Módulos principais — cada um corresponde a uma seção do sistema */
const modulos = [
  {
    id: "pops",
    label: "POPs",
    icon: BookOpen,
    match: ["/dashboard", "/pops", "/tags", "/comentarios"],
  },
  // Novos módulos entram aqui
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">

      {/* Logo */}
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

      {/* Módulos */}
      <SidebarContent className="py-2">
        <SidebarGroup className="px-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {modulos.map((mod) => {
                const active = mod.match.some(
                  (m) => pathname === m || pathname.startsWith(m + "/")
                )
                return (
                  <SidebarMenuItem key={mod.id}>
                    <SidebarMenuButton
                      render={<Link href={mod.match[0]} />}
                      isActive={active}
                      tooltip={mod.label}
                      className="font-semibold"
                    >
                      <mod.icon className="h-4 w-4 shrink-0" />
                      <span>{mod.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rodapé: perfil + tema */}
      <SidebarFooter className="border-t border-sidebar-border pt-2 pb-2 space-y-1">
        <SidebarMenu>
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
