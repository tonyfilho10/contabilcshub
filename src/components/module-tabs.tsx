"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  MessageSquare,
  NotebookText,
  Folder,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TabItem {
  label: string
  url: string
  icon: React.ElementType
  exact?: boolean
}

interface ModuleTabsProps {
  tabs: TabItem[]
}

export function ModuleTabs({ tabs }: ModuleTabsProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-end gap-0 border-b border-border bg-background px-4 md:px-6 overflow-x-auto shrink-0">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.url
          : pathname === tab.url || pathname.startsWith(tab.url + "/")
        return (
          <Link
            key={tab.url}
            href={tab.url}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}

/* Tabs do módulo POPs */
export const CONTABIL_TABS: TabItem[] = [
  { label: "Dashboard",    url: "/dashboard",    icon: LayoutDashboard, exact: true },
  { label: "POPs",         url: "/pops",         icon: BookOpen },
  { label: "Tags",         url: "/tags",         icon: Tags },
  { label: "Comentários",  url: "/comentarios",  icon: MessageSquare },
]

/* Tabs do módulo Anotações */
export const ANOTACOES_TABS: TabItem[] = [
  { label: "Minhas Notas", url: "/anotacoes",                  icon: NotebookText, exact: true },
  { label: "Pastas",       url: "/anotacoes/pastas",           icon: Folder },
  { label: "Tags",         url: "/anotacoes/tags",             icon: Tag },
]
