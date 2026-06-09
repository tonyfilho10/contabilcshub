"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, BellOff, Check, CheckCheck, FileText, NotebookText, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Notificacao {
  id: string
  tipo: "mencao_anotacao" | "mencao_pop"
  titulo: string
  mensagem: string | null
  lida: boolean
  referenciaId: string | null
  criadoEm: string
}

const POLL_INTERVAL = 30_000 // 30s

export function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/notificacoes")
      if (!res.ok) return
      const data = await res.json()
      setNotificacoes(Array.isArray(data) ? data : [])
    } catch {
      // silencioso
    }
  }, [])

  // Poll a cada 30s
  useEffect(() => {
    carregar()
    intervalRef.current = setInterval(carregar, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [carregar])

  // Recarrega ao abrir
  useEffect(() => {
    if (open) carregar()
  }, [open, carregar])

  async function marcarLida(id: string) {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    )
    await fetch(`/api/notificacoes/${id}`, { method: "PATCH" })
  }

  async function marcarTodas() {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
    await fetch("/api/notificacoes/marcar-todas", { method: "PATCH" })
    toast.success("Todas marcadas como lidas")
  }

  async function apagarTodas() {
    setNotificacoes([])
    await fetch("/api/notificacoes", { method: "DELETE" })
    toast.success("Histórico apagado")
  }

  async function apagarUma(id: string) {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id))
    await fetch(`/api/notificacoes/${id}`, { method: "DELETE" })
  }

  const temHistorico = notificacoes.length > 0

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative h-8 w-8 shrink-0" />
        }
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground leading-none">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 overflow-hidden"
        sideOffset={8}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Notificações</span>
            {naoLidas > 0 && (
              <span className="rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 leading-none">
                {naoLidas}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {naoLidas > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={marcarTodas}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            {temHistorico && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={apagarTodas}
                title="Apagar todas"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="max-h-[420px] overflow-y-auto divide-y">
          {notificacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <BellOff className="h-8 w-8 opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            notificacoes.map((n) => (
              <NotificacaoItem
                key={n.id}
                notificacao={n}
                onMarcarLida={marcarLida}
                onApagar={apagarUma}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificacaoItem({
  notificacao: n,
  onMarcarLida,
  onApagar,
}: {
  notificacao: Notificacao
  onMarcarLida: (id: string) => void
  onApagar: (id: string) => void
}) {
  const Icone = n.tipo === "mencao_pop" ? FileText : NotebookText

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
        !n.lida && "bg-primary/5"
      )}
    >
      {/* Ícone do tipo */}
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          n.tipo === "mencao_pop"
            ? "bg-blue-500/10 text-blue-500"
            : "bg-amber-500/10 text-amber-500"
        )}
      >
        <Icone className="h-4 w-4" />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn("text-sm leading-tight", !n.lida && "font-semibold")}>
          {n.titulo}
        </p>
        {n.mensagem && (
          <p className="text-xs text-muted-foreground truncate">{n.mensagem}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(n.criadoEm), { addSuffix: true, locale: ptBR })}
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!n.lida && (
          <button
            onClick={() => onMarcarLida(n.id)}
            title="Marcar como lida"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onApagar(n.id)}
          title="Remover"
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Indicador não lida */}
      {!n.lida && (
        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  )
}
