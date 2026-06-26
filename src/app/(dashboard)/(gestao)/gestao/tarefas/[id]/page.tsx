"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Trash2, Save } from "lucide-react"

interface Tarefa { id: string; descricao: string; responsavelId: string; prazo: string; contexto: string; status: string; motivoTravado: string | null; leituraConfirmada: boolean }
interface Profile { id: string; nome: string }

export default function TarefaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [tarefa, setTarefa] = useState<Tarefa | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [form, setForm] = useState({ descricao: "", responsavelId: "", prazo: "", contexto: "", status: "", motivoTravado: "" })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    const [t, p] = await Promise.all([fetch(`/api/gestao/tarefas/${id}`), fetch("/api/perfis")])
    const tarefa = await t.json()
    setTarefa(tarefa)
    setForm({ descricao: tarefa.descricao, responsavelId: tarefa.responsavelId, prazo: tarefa.prazo?.split("T")[0] ?? "", contexto: tarefa.contexto, status: tarefa.status, motivoTravado: tarefa.motivoTravado ?? "" })
    setProfiles(await p.json())
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function salvar() {
    if (form.status === "TRAVADO" && !form.motivoTravado.trim()) { toast.error("Informe o motivo do travamento"); return }
    setSalvando(true)
    const res = await fetch(`/api/gestao/tarefas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, motivoTravado: form.status === "TRAVADO" ? form.motivoTravado : null }),
    })
    if (!res.ok) { toast.error("Erro ao salvar"); setSalvando(false); return }
    toast.success("Salvo")
    setSalvando(false)
  }

  async function excluir() {
    await fetch(`/api/gestao/tarefas/${id}`, { method: "DELETE" })
    toast.success("Tarefa excluída")
    router.push("/gestao/tarefas")
  }

  if (!tarefa) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Tarefa" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Tarefas", href: "/gestao/tarefas" }, { label: tarefa.descricao.slice(0, 30) }]}>
        <Button size="sm" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 max-w-xl space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">Editar tarefa <Badge>{form.status}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="O quê?" />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))}>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <Input type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
            <Textarea value={form.contexto} onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))} placeholder="Contexto" rows={2} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {["RECEBIDO","ANDAMENTO","CONCLUIDO","TRAVADO"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {form.status === "TRAVADO" && (
              <Textarea value={form.motivoTravado} onChange={e => setForm(f => ({ ...f, motivoTravado: e.target.value }))} placeholder="Motivo do travamento (obrigatório)" rows={2} />
            )}
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}Salvar
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
