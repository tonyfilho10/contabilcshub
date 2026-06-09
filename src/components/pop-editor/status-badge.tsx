import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type PopStatus = "RASCUNHO" | "EM_REVISAO" | "APROVADO" | "PUBLICADO" | "ARQUIVADO"

const STATUS_CONFIG: Record<PopStatus, { label: string; className: string }> = {
  RASCUNHO:   { label: "Rascunho",    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  EM_REVISAO: { label: "Em Revisão",  className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  APROVADO:   { label: "Aprovado",    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  PUBLICADO:  { label: "Publicado",   className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
  ARQUIVADO:  { label: "Arquivado",   className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
}

export function StatusBadge({ status }: { status: PopStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.RASCUNHO
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}

export { STATUS_CONFIG }
export type { PopStatus }
