"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CargoBadge } from "@/components/admin/cargo-badge"
import { Search, X, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Cargo } from "@/lib/permissoes"

interface Profile {
  id: string
  nome: string
  email: string
  cargo: Cargo
  avatar: string | null
}

interface UserMentionPickerProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  className?: string
}

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

export function UserMentionPicker({ selectedIds, onChange, className }: UserMentionPickerProps) {
  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<Profile[]>([])
  const [todos, setTodos] = useState<Profile[]>([])
  const [aberto, setAberto] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Carrega todos os usuários uma vez
  useEffect(() => {
    fetch("/api/admin/usuarios")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setTodos(data) : [])
      .catch(() => {})
  }, [])

  // Filtra localmente
  useEffect(() => {
    const q = busca.toLowerCase()
    setResultados(
      todos.filter(
        (u) =>
          !selectedIds.includes(u.id) &&
          (u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      )
    )
  }, [busca, todos, selectedIds])

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selecionados = todos.filter((u) => selectedIds.includes(u.id))

  function adicionar(id: string) {
    onChange([...selectedIds, id])
    setBusca("")
  }

  function remover(id: string) {
    onChange(selectedIds.filter((s) => s !== id))
  }

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {/* Chips dos selecionados */}
      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selecionados.map((u) => (
            <span
              key={u.id}
              className="flex items-center gap-1.5 bg-muted rounded-full pl-1 pr-2 py-0.5 text-xs font-medium"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={u.avatar ?? ""} />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                  {iniciais(u.nome)}
                </AvatarFallback>
              </Avatar>
              {u.nome.split(" ")[0]}
              <button
                type="button"
                onClick={() => remover(u.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Campo de busca */}
      <div className="relative">
        <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Mencionar usuário…"
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setAberto(true) }}
          onFocus={() => setAberto(true)}
          className="pl-8 h-8 text-xs"
        />
        {/* Dropdown */}
        {aberto && (busca || resultados.length > 0) && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-lg border bg-popover shadow-lg overflow-hidden">
            {resultados.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground text-center">
                {busca ? "Nenhum usuário encontrado" : "Todos já mencionados"}
              </p>
            ) : (
              <ul className="max-h-48 overflow-y-auto">
                {resultados.slice(0, 8).map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left"
                      onClick={() => { adicionar(u.id); setAberto(false) }}
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={u.avatar ?? ""} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {iniciais(u.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{u.nome}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <CargoBadge cargo={u.cargo} className="shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
