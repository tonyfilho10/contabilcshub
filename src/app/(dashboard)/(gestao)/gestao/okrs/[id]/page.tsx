"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Trash2, Plus, Save } from "lucide-react"

interface KR { id: string; descricao: string; meta: number; atual: number; unidade: string }
interface Okr { id: string; titulo: string; tipo: string; cluster: string | null; ciclo: string; progresso: number; status: string; keyResults: KR[] }

export default function OkrDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [okr, setOkr] = useState<Okr | null>(null)
  const [krForm, setKrForm] = useState({ descricao: "", meta: "", unidade: "" })
  const [adicionandoKr, setAdicionandoKr] = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/gestao/okrs/${id}`)
    setOkr(await res.json())
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function excluir() {
    await fetch(`/api/gestao/okrs/${id}`, { method: "DELETE" })
    toast.success("OKR excluído")
    router.push("/gestao/okrs")
  }

  async function addKr() {
    setAdicionandoKr(true)
    const res = await fetch(`/api/gestao/okrs/${id}/key-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...krForm, meta: Number(krForm.meta) }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setAdicionandoKr(false); return }
    toast.success("Key Result adicionado")
    setKrForm({ descricao: "", meta: "", unidade: "" })
    setAdicionandoKr(false)
    carregar()
  }

  async function updateKrAtual(krId: string, atual: number) {
    const res = await fetch(`/api/gestao/okrs/${id}/key-results?krId=${krId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atual }),
    })
    if (!res.ok) { toast.error("Erro ao atualizar"); return }

    // Recalcular progresso do OKR como média dos KRs
    const updatedKrs = okr!.keyResults.map(kr => kr.id === krId ? { ...kr, atual } : kr)
    const progresso = Math.round(updatedKrs.reduce((acc, kr) => acc + (kr.meta > 0 ? Math.min(100, (kr.atual / kr.meta) * 100) : 0), 0) / updatedKrs.length)
    await fetch(`/api/gestao/okrs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progresso }),
    })
    toast.success("Progresso atualizado")
    carregar()
  }

  async function removeKr(krId: string) {
    await fetch(`/api/gestao/okrs/${id}/key-results?krId=${krId}`, { method: "DELETE" })
    toast.success("Key Result removido")
    carregar()
  }

  if (!okr) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={okr.titulo}
        breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "OKRs", href: "/gestao/okrs" }, { label: okr.titulo.slice(0, 30) }]}
      >
        <Button size="sm" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 max-w-2xl space-y-6">
        {/* Info do OKR */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary">{okr.tipo}</Badge>
          {okr.cluster && <Badge variant="outline">{okr.cluster}</Badge>}
          <Badge variant="outline">{okr.ciclo}</Badge>
          <Badge variant={okr.status === "NO_PRAZO" ? "default" : okr.status === "EM_RISCO" ? "outline" : "destructive"}>{okr.status.replace("_", " ")}</Badge>
        </div>

        {/* Progresso geral */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-semibold">{okr.progresso}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${okr.progresso}%` }} />
          </div>
        </div>

        {/* Key Results */}
        <Card>
          <CardHeader><CardTitle className="text-base">Key Results ({okr.keyResults.length}/3)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {okr.keyResults.map(kr => (
              <div key={kr.id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{kr.descricao}</p>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeKr(kr.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="h-7 w-24 text-xs"
                    value={kr.atual}
                    onChange={e => setOkr(o => o ? { ...o, keyResults: o.keyResults.map(k => k.id === kr.id ? { ...k, atual: Number(e.target.value) } : k) } : null)}
                    onBlur={e => updateKrAtual(kr.id, Number(e.target.value))}
                  />
                  <span className="text-xs text-muted-foreground">/ {kr.meta} {kr.unidade}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, kr.meta > 0 ? (kr.atual / kr.meta) * 100 : 0)}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{kr.meta > 0 ? Math.round((kr.atual / kr.meta) * 100) : 0}%</span>
                </div>
              </div>
            ))}

            {okr.keyResults.length < 3 && (
              <div className="border border-dashed rounded-md p-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Adicionar Key Result</p>
                <Input placeholder="Descrição do resultado" className="h-8 text-xs" value={krForm.descricao} onChange={e => setKrForm(f => ({ ...f, descricao: e.target.value }))} />
                <div className="flex gap-2">
                  <Input placeholder="Meta" type="number" className="h-8 text-xs w-24" value={krForm.meta} onChange={e => setKrForm(f => ({ ...f, meta: e.target.value }))} />
                  <Input placeholder="Unidade (%, R$…)" className="h-8 text-xs flex-1" value={krForm.unidade} onChange={e => setKrForm(f => ({ ...f, unidade: e.target.value }))} />
                </div>
                <Button size="sm" variant="outline" onClick={addKr} disabled={adicionandoKr || !krForm.descricao || !krForm.meta}>
                  {adicionandoKr ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}Adicionar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status manual */}
        <Card>
          <CardHeader><CardTitle className="text-base">Atualizar status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {["NO_PRAZO", "EM_RISCO", "FORA_PRAZO"].map(s => (
                <Button
                  key={s}
                  size="sm"
                  variant={okr.status === s ? "default" : "outline"}
                  onClick={async () => {
                    await fetch(`/api/gestao/okrs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) })
                    carregar()
                  }}
                >
                  {s.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
