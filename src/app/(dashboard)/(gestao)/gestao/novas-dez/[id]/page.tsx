"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TimerBloco } from "@/components/gestao/timer-bloco"
import { Trash2, Plus, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface Profile { id: string; nome: string }
interface Decisao { id: string; descricao: string; responsavelId: string; prazo: string; contexto: string }
interface Reuniao { id: string; tema: string; status: string; decisoes: Decisao[] }

export default function ReuniaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [reuniao, setReuniao] = useState<Reuniao | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [encerrando, setEncerrando] = useState(false)
  const [form, setForm] = useState({ descricao: "", responsavelId: "", prazo: "", contexto: "" })

  const carregar = useCallback(async () => {
    const [rRes, pRes] = await Promise.all([
      fetch(`/api/gestao/reunioes/${id}`),
      fetch("/api/perfis"),
    ])
    setReuniao(await rRes.json())
    setProfiles(await pRes.json())
    setLoading(false)
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function addDecisao() {
    if (!form.contexto.trim()) { toast.error("Contexto é obrigatório"); return }
    const res = await fetch(`/api/gestao/reunioes/${id}/decisoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); return }
    toast.success("Decisão adicionada")
    setForm({ descricao: "", responsavelId: "", prazo: "", contexto: "" })
    carregar()
  }

  async function removeDecisao(decisaoId: string) {
    await fetch(`/api/gestao/reunioes/${id}/decisoes?decisaoId=${decisaoId}`, { method: "DELETE" })
    carregar()
  }

  async function encerrar() {
    if (!reuniao?.decisoes.length) { toast.error("Adicione ao menos uma decisão"); return }
    setEncerrando(true)
    const res = await fetch(`/api/gestao/reunioes/${id}/encerrar`, { method: "POST" })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setEncerrando(false); return }
    toast.success("Reunião encerrada! Tarefas criadas e enviadas.")
    router.push("/gestao/novas-dez")
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
  if (!reuniao) return <div className="p-6 text-muted-foreground">Reunião não encontrada.</div>

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={`Novas Dez — ${reuniao.tema}`}
        breadcrumbs={[
          { label: "Gestão", href: "/gestao" },
          { label: "Novas Dez", href: "/gestao/novas-dez" },
          { label: reuniao.tema },
        ]}
      >
        {reuniao.status === "ABERTA" && (
          <Button
            size="sm"
            onClick={encerrar}
            disabled={encerrando || !reuniao.decisoes.length}
          >
            {encerrando
              ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              : <CheckCircle2 className="h-4 w-4 mr-1" />}
            Encerrar reunião
          </Button>
        )}
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-3xl">
        {reuniao.status === "ABERTA" && <TimerBloco />}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Decisões ({reuniao.decisoes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reuniao.decisoes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma decisão ainda.</p>
            )}
            {reuniao.decisoes.map(d => {
              const resp = profiles.find(p => p.id === d.responsavelId)
              return (
                <div key={d.id} className="flex items-start gap-2 p-2 border rounded-md">
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{d.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {resp?.nome ?? d.responsavelId} · prazo: {new Intl.DateTimeFormat("pt-BR").format(new Date(d.prazo))}
                    </p>
                    <p className="text-xs text-muted-foreground italic">{d.contexto}</p>
                  </div>
                  {reuniao.status === "ABERTA" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive shrink-0"
                      onClick={() => removeDecisao(d.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {reuniao.status === "ABERTA" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nova Decisão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="O quê? (ação clara em uma linha)"
                value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              />
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.responsavelId}
                onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))}
              >
                <option value="">Quem? (responsável)</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <Input
                type="date"
                value={form.prazo}
                onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))}
              />
              <Textarea
                placeholder="Contexto (obrigatório) — por que isso importa?"
                value={form.contexto}
                onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))}
                rows={2}
              />
              <Button
                size="sm"
                onClick={addDecisao}
                disabled={!form.descricao || !form.responsavelId || !form.prazo || !form.contexto}
              >
                <Plus className="h-4 w-4 mr-1" />Adicionar decisão
              </Button>
            </CardContent>
          </Card>
        )}

        {reuniao.status === "ENCERRADA" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md p-3">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Reunião encerrada. Tarefas delegadas automaticamente.
          </div>
        )}
      </main>
    </div>
  )
}
