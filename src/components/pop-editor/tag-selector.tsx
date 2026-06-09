"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tag, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TagItem { id: string; nome: string; cor: string }

const CORES = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444",
  "#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#64748b",
]

interface TagSelectorProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  /** Rota da API de tags — padrão: /api/tags (POPs) */
  apiRota?: string
}

export function TagSelector({ selectedIds, onChange, apiRota = "/api/tags" }: TagSelectorProps) {
  const [tags, setTags] = useState<TagItem[]>([])
  const [criando, setCriando] = useState(false)
  const [novoNome, setNovoNome] = useState("")
  const [novaCor, setNovaCor] = useState(CORES[0])
  const [salvando, setSalvando] = useState(false)

  function carregar() {
    fetch(apiRota)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setTags(d) : [])
      .catch(() => {})
  }

  useEffect(() => { carregar() }, [apiRota]) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((t) => t !== id) : [...selectedIds, id])
  }

  async function handleCriar() {
    if (!novoNome.trim()) return
    setSalvando(true)
    try {
      const res = await fetch(apiRota, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome.trim(), cor: novaCor }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao criar tag")
      }
      const nova: TagItem = await res.json()
      setTags((prev) => [...prev, nova])
      onChange([...selectedIds, nova.id])
      setNovoNome("")
      setNovaCor(CORES[0])
      setCriando(false)
      toast.success(`Tag "${nova.nome}" criada!`)
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Tags disponíveis */}
      {tags.length === 0 && !criando ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Tag className="h-3.5 w-3.5" />Nenhuma tag ainda.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const sel = selectedIds.includes(tag.id)
            return (
              <button key={tag.id} type="button" onClick={() => toggle(tag.id)} className="focus:outline-none">
                <Badge
                  variant={sel ? "default" : "outline"}
                  className="cursor-pointer text-[11px] transition-all"
                  style={
                    sel
                      ? { backgroundColor: tag.cor, borderColor: tag.cor, color: "#fff" }
                      : { borderColor: tag.cor + "88", color: tag.cor }
                  }
                >
                  {tag.nome}
                </Badge>
              </button>
            )
          })}
        </div>
      )}

      {/* Formulário inline de criação */}
      {criando ? (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
          <Input
            autoFocus
            placeholder="Nome da tag…"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCriar()}
            className="h-8 text-sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {CORES.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => setNovaCor(cor)}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                  novaCor === cor ? "border-foreground scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: cor }}
              />
            ))}
          </div>
          {novoNome && (
            <Badge
              className="text-[11px]"
              style={{ backgroundColor: novaCor, borderColor: novaCor, color: "#fff" }}
            >
              {novoNome}
            </Badge>
          )}
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleCriar} disabled={salvando || !novoNome.trim()}>
              {salvando ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              Criar
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setCriando(false); setNovoNome("") }}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
          onClick={() => setCriando(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />Nova tag
        </Button>
      )}
    </div>
  )
}
