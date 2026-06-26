"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Trash2, Save } from "lucide-react"

interface BacklogItem { id: string; nome: string; descricao: string | null; area: string; prioridade: string; status: string }

export default function BacklogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [item, setItem] = useState<BacklogItem | null>(null)
  const [form, setForm] = useState({ nome: "", descricao: "", area: "GESTAO", prioridade: "IMPORTANTE", status: "BACKLOG" })
  const [salvando, setSalvando] = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/gestao/backlog/${id}`)
    const data = await res.json()
    setItem(data)
    setForm({ nome: data.nome, descricao: data.descricao ?? "", area: data.area, prioridade: data.prioridade, status: data.status })
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function salvar() {
    setSalvando(true)
    const res = await fetch(`/api/gestao/backlog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, descricao: form.descricao || null }),
    })
    if (!res.ok) { toast.error("Erro ao salvar"); setSalvando(false); return }
    toast.success("Salvo")
    setSalvando(false)
    carregar()
  }

  async function excluir() {
    await fetch(`/api/gestao/backlog/${id}`, { method: "DELETE" })
    toast.success("Iniciativa excluída")
    router.push("/gestao/backlog")
  }

  if (!item) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={item.nome}
        breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Backlog", href: "/gestao/backlog" }, { label: item.nome.slice(0, 30) }]}
      >
        <Button size="sm" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Editar iniciativa</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome" />
            <Textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição" rows={2} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
              <option value="GESTAO">Gestão</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="OPERACAO">Operação</option>
              <option value="CLIENTE">Cliente</option>
              <option value="CULTURA">Cultura</option>
              <option value="MARKETING">Marketing</option>
            </select>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value }))}>
              <option value="URGENTE_IMPORTANTE">🔴 Urgente + Importante</option>
              <option value="IMPORTANTE">🟡 Importante</option>
              <option value="URGENTE">🟠 Urgente</option>
              <option value="BAIXA">⚪ Baixa prioridade</option>
            </select>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="BACKLOG">Backlog</option>
              <option value="EM_SPRINT">Em Sprint</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="DESCARTADO">Descartado</option>
            </select>
            <Button onClick={salvar} disabled={salvando || !form.nome}>
              {salvando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}Salvar
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
