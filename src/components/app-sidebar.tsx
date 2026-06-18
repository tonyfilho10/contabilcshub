"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calculator,
  BookOpen,
  NotebookText,
  ShieldCheck,
  Sun,
  Moon,
  Network,
} from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCurrentUser, podeVerAdmin } from "@/lib/use-current-user"

export function AppSidebar() {
  const pathname = usePathname()
  const currentUser = useCurrentUser()
  const { theme, setTheme } = useTheme()

  const initials = currentUser?.nome
    ? currentUser.nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "US"

  const isAdmin = podeVerAdmin(currentUser?.cargo)

  const modulosItens = [
    {
      id: "pops",
      label: "POPs",
      icon: BookOpen,
      href: "/pops",
      match: ["/dashboard", "/pops", "/tags", "/comentarios"],
    },
  ]

  const pessoalAnotacoesItem = {
    id: "anotacoes",
    label: "Anotações",
    icon: NotebookText,
    href: "/anotacoes",
    match: ["/anotacoes"],
  }

  const pessoalGrafoItem = {
    id: "grafo",
    label: "Grafo",
    icon: Network,
    href: "/anotacoes/grafo",
    match: ["/anotacoes/grafo"],
  }

  function isActive(match: string[]) {
    return match.some((m) => pathname === m || pathname.startsWith(m + "/"))
  }

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

      <SidebarContent className="py-2">

        {/* Módulos */}
        <SidebarGroup className="px-1">
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modulosItens.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.match)}
                    tooltip={item.label}
                    className="font-semibold"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Pessoal */}
        <SidebarGroup className="px-1">
          <SidebarGroupLabel>Pessoal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Anotações */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={pessoalAnotacoesItem.href} />}
                  isActive={isActive(pessoalAnotacoesItem.match)}
                  tooltip={pessoalAnotacoesItem.label}
                  className="font-semibold"
                >
                  <pessoalAnotacoesItem.icon className="h-4 w-4 shrink-0" />
                  <span>{pessoalAnotacoesItem.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Grafo */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={pessoalGrafoItem.href} />}
                  isActive={isActive(pessoalGrafoItem.match)}
                  tooltip={pessoalGrafoItem.label}
                  className="font-semibold"
                >
                  <pessoalGrafoItem.icon className="h-4 w-4 shrink-0" />
                  <span>{pessoalGrafoItem.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Configurações */}
        <SidebarGroup className="px-1">
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/admin/usuarios" />}
                    isActive={isActive(["/admin"])}
                    tooltip="Administração"
                    className="font-semibold"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Administração</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={theme === "dark" ? "Modo claro" : "Modo escuro"}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 shrink-0" />
                  ) : (
                    <Moon className="h-4 w-4 shrink-0" />
                  )}
                  <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Rodapé: perfil */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/perfil" />}
              isActive={isActive(["/perfil"])}
              tooltip="Meu Perfil"
              className="h-12 overflow-visible"
            >
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={currentUser?.avatar ?? ""} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[9px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-sm font-medium truncate text-sidebar-foreground">
                  {currentUser?.nome ?? "Meu Perfil"}
                </span>
                <span className="text-[11px] text-sidebar-foreground/60 truncate">
                  {currentUser?.cargo
                    ? currentUser.cargo.charAt(0) + currentUser.cargo.slice(1).toLowerCase()
                    : "perfil"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
