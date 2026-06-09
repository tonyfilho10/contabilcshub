"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ── Paleta de cores preset ──────────────────────────────── */
const CORES = [
  "#f97316", "#ef4444", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
  "#6366f1", "#64748b", "#0ea5e9", "#a3e635",
]

interface CampoExtra {
  key: string
  label: string
  type: "text" | "select"
  options?: { value: string; label: string }[]
  defaultValue?: string
}

export interface GerenciadorItem {
  id: string
  nome: string
  cor: string
  [key: string]: any
}

interface GerenciadorItensProps {
  /** Rota base da API, ex: "/api/anotacoes/pastas" */
  apiBase: string
  /** Itens carregados externamente */
  itens: GerenciadorItem[]
  /** Chamado após qualquer mutação para recarregar */
  onRefresh: () => void
  /** Nome singular para textos — ex: "pasta", "tag" */
  singular: string
  /** Campos extras além de nome e cor */
  camposExtras?: CampoExtra[]
  /** Ícone para exibir no chip de cada item */
  renderIcone?: (item: GerenciadorItem) => React.ReactNode
  /** Texto de uso exibido em cada chip */
  renderUso?: (item: GerenciadorItem) => string
  /** Campos fixos sempre incluídos no POST (ex: { usuarioId: "..." }) */
  extraPayload?: Record<string, string>
}

/* ── Modal criar/editar ───────────────────────────────────── */
interface FormState {
  nome: string
  cor: string
  [key: string]: string
}

function buildDefault(extras?: CampoExtra[]): FormState {
  const base: FormState = { nome: "", cor: CORES[0] }
  extras?.forEach((c) => { base[c.key] = c.defaultValue ?? "" })
  return base
}

export function GerenciadorItens({
  apiBase,
  itens,
  onRefresh,
  singular,
  camposExtras,
  renderIcone,
  renderUso,
  extraPayload,
}: GerenciadorItensProps) {
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<GerenciadorItem | null>(null)
  const [excluindo, setExcluindo] = useState<GerenciadorItem | null>(null)
  const [form, setForm] = useState<FormState>(buildDefault(camposExtras))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function abrirCriacao() {
    setEditando(null)
    setForm(buildDefault(camposExtras))
    setFormAberto(true)
  }

  function abrirEdicao(item: GerenciadorItem) {
    setEditando(item)
    const f: FormState = { nome: item.nome, cor: item.cor }
    camposExtras?.forEach((c) => { f[c.key] = item[c.key] ?? c.defaultValue ?? "" })
    setForm(f)
    setFormAberto(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { toast.error("Nome é obrigatório"); return }
    setSaving(true)
    try {
      const payload: Record<string, string> = { nome: form.nome.trim(), cor: form.cor }
      camposExtras?.forEach((c) => { payload[c.key] = form[c.key] })
      // Campos fixos apenas no POST (criação)
      if (!editando && extraPayload) Object.assign(payload, extraPayload)

      const url  = editando ? `${apiBase}/${editando.id}` : apiBase
      const method = editando ? "PATCH" : "POST"
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro")
      toast.success(editando ? `${singular} atualizada!` : `${singular} criada!`)
      setFormAberto(false)
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleExcluir() {
    if (!excluindo) return
    setDeleting(true)
    try {
      const res = await fetch(`${apiBase}/${excluindo.id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Erro") }
      toast.success(`${singular} excluída!`)
      setExcluindo(null)
      onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const tituloSingular = singular.charAt(0).toUpperCase() + singular.slice(1)

  return (
    <>
      {/* Botão + lista */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={abrirCriacao}>
            <Plus className="h-4 w-4 mr-1" />Nova {tituloSingular}
          </Button>
        </div>

        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border rounded-xl border-dashed">
            <p className="text-sm font-medium">Nenhuma {singular} cadastrada</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={abrirCriacao}>
              <Plus className="h-4 w-4 mr-1" />Criar primeira {singular}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {itens.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-xl border bg-card p-3 hover:border-primary/30 transition-colors"
              >
                {/* Swatch de cor */}
                <div
                  className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: item.cor }}
                >
                  {renderIcone ? renderIcone(item) : (
                    <span className="text-xs font-bold">
                      {item.nome.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.nome}</p>
                  {renderUso && (
                    <p className="text-[11px] text-muted-foreground">{renderUso(item)}</p>
                  )}
                  {camposExtras?.map((c) => item[c.key] && (
                    <p key={c.key} className="text-[11px] text-muted-foreground capitalize">
                      {item[c.key].toLowerCase()}
                    </p>
                  ))}
                </div>

                {/* Ações — aparecem no hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => abrirEdicao(item)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setExcluindo(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      <Dialog open={formAberto} onOpenChange={setFormAberto}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editando ? `Editar ${tituloSingular}` : `Nova ${tituloSingular}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalvar} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder={`Nome da ${singular}…`}
                autoFocus
              />
            </div>

            {/* Campos extras (ex: tipo de tag) */}
            {camposExtras?.map((campo) => (
              <div key={campo.key} className="space-y-1.5">
                <Label>{campo.label}</Label>
                {campo.type === "select" && campo.options ? (
                  <Select
                    value={form[campo.key]}
                    onValueChange={(v) => setForm((f) => ({ ...f, [campo.key]: v ?? campo.defaultValue ?? "" }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {campo.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={form[campo.key]}
                    onChange={(e) => setForm((f) => ({ ...f, [campo.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            {/* Paleta de cores */}
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {CORES.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, cor }))}
                    className={cn(
                      "h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none",
                      form.cor === cor && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
              {/* Preview */}
              <div
                className="mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: form.cor }}
              >
                <span>{form.nome || tituloSingular}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormAberto(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editando ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação exclusão */}
      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {singular}?</AlertDialogTitle>
            <AlertDialogDescription>
              A {singular} <strong>"{excluindo?.nome}"</strong> será excluída permanentemente.
              {singular === "pasta" && " As anotações dentro dela não serão apagadas."}
              {singular === "tag" && " Ela será removida de todas as anotações/POPs que a usam."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
