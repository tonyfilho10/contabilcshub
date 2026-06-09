"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Calculator, BookOpen, NotebookText, ShieldCheck, LogOut } from "lucide-react"

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
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser, podeVerAdmin, clearCurrentUserCache } from "@/lib/use-current-user"
import { createClient } from "@/lib/supabase/client"

const MODULOS_BASE = [
  {
    id: "pops",
    label: "POPs",
    icon: BookOpen,
    href: "/pops",
    match: ["/dashboard", "/pops", "/tags", "/comentarios"],
  },
  {
    id: "anotacoes",
    label: "Anotações",
    icon: NotebookText,
    href: "/anotacoes",
    match: ["/anotacoes"],
  },
]

const MODULO_ADMIN = {
  id: "admin",
  label: "Administração",
  icon: ShieldCheck,
  href: "/admin/usuarios",
  match: ["/admin"],
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = useCurrentUser()

  const modulos = [
    ...MODULOS_BASE,
    ...(podeVerAdmin(currentUser?.cargo) ? [MODULO_ADMIN] : []),
  ]

  async function handleLogout() {
    clearCurrentUserCache()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = currentUser?.nome
    ? currentUser.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "US"

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">

      {/* Logo */}
      <SidebarHeader className="border-b border-sidebar-border pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                <Calculator className="h-4 w-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-sm tracking-wide text-sidebar-foreground">CSHUB</span>
                <span className="text-[11px] text-sidebar-foreground/60">Módulo Contábil</span>
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
                      render={<Link href={mod.href} />}
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
      <SidebarFooter className="border-t border-sidebar-border p-2 gap-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton tooltip="Meu Perfil" className="h-10 w-full" />}>
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={currentUser?.avatar ?? ""} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-none min-w-0">
                    <span className="text-sm font-medium truncate text-sidebar-foreground">
                      {currentUser?.nome ?? "Usuário"}
                    </span>
                    <span className="text-[11px] text-sidebar-foreground/60 truncate">
                      {currentUser?.cargo
                        ? currentUser.cargo.charAt(0) + currentUser.cargo.slice(1).toLowerCase()
                        : "Meu perfil"}
                    </span>
                  </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="start" className="w-52">
                <DropdownMenuItem render={<Link href="/perfil" />}>
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  Meu perfil
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onSelect={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="group-data-[collapsible=icon]:hidden">
          <ThemeToggle />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
