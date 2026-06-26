"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function NovoBacklogPage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: "", descricao: "", area: "GESTAO", prioridade: "IMPORTANTE" })

  async function salvar() {
    setSalvando(true)
    const res = await fetch("/api/gestao/backlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, descricao: form.descricao || null }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setSalvando(false); return }
    toast.success("Iniciativa criada")
    router.push("/gestao/backlog")
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Nova Iniciativa" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Backlog", href: "/gestao/backlog" }, { label: "Nova" }]} />
      <main className="flex-1 p-4 md:p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Criar iniciativa</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nome da iniciativa" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            <Textarea placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} rows={2} />
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
            <Button onClick={salvar} disabled={salvando || !form.nome}>
              {salvando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Criar iniciativa
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
