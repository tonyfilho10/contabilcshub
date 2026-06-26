"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Profile { id: string; nome: string }

export default function NovaTarefaPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ descricao: "", responsavelId: "", prazo: "", contexto: "" })

  useEffect(() => {
    fetch("/api/perfis").then(r => r.json()).then(setProfiles)
  }, [])

  async function salvar() {
    if (!form.contexto.trim()) { toast.error("Contexto é obrigatório"); return }
    setSalvando(true)
    const res = await fetch("/api/gestao/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setSalvando(false); return }
    toast.success("Tarefa criada")
    router.push("/gestao/tarefas")
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Nova Tarefa" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Tarefas", href: "/gestao/tarefas" }, { label: "Nova" }]} />
      <main className="flex-1 p-4 md:p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Criar tarefa avulsa</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="O quê? (ação clara em uma linha)" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))}>
              <option value="">Quem? (responsável)</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <Input type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
            <Textarea placeholder="Contexto (obrigatório) — por que isso importa?" value={form.contexto} onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))} rows={3} />
            <Button onClick={salvar} disabled={salvando || !form.descricao || !form.responsavelId || !form.prazo || !form.contexto}>
              {salvando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Criar tarefa
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
