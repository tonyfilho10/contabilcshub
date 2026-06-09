"use client"

import { CARGO_CONFIG, type Cargo } from "@/lib/permissoes"
import { cn } from "@/lib/utils"

interface CargoBadgeProps {
  cargo: Cargo
  className?: string
}

export function CargoBadge({ cargo, className }: CargoBadgeProps) {
  const config = CARGO_CONFIG[cargo]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
      style={{ backgroundColor: config.cor + "22", color: config.cor, border: `1px solid ${config.cor}55` }}
    >
      {config.label}
    </span>
  )
}
