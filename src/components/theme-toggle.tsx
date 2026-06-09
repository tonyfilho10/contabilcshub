"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const options = [
  { value: "light",  label: "Claro",   icon: Sun },
  { value: "dark",   label: "Escuro",  icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  /* ── Sidebar expandida: seletor com 3 botões ──────────────── */
  if (!collapsed) {
    return (
      <div className="px-2 py-1 space-y-1.5">
        <span className="text-[11px] uppercase tracking-widest text-sidebar-foreground/50 font-semibold px-1">
          Aparência
        </span>
        <div className="flex gap-1">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 px-1 text-[11px] font-medium transition-all border",
                theme === value
                  ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary shadow-sm"
                  : "bg-sidebar-accent/40 text-sidebar-foreground/60 border-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ── Sidebar colapsada: ícone único com tooltip ───────────── */
  const current = options.find((o) => o.value === theme) ?? options[2]
  const Icon = current.icon

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        onClick={() => {
          const next = options[(options.findIndex((o) => o.value === theme) + 1) % options.length]
          setTheme(next.value)
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors mx-auto"
      >
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent side="right">
        Aparência: {current.label}
      </TooltipContent>
    </Tooltip>
  )
}
