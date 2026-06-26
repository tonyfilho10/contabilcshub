"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Profile { id: string; nome: string }

export default function NovoOkrPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ titulo: "", tipo: "EMPRESA", cluster: "", responsavelId: "", ciclo: "" })

  useEffect(() => {
    fetch("/api/perfis").then(r => r.json()).then(setProfiles)
  }, [])

  async function salvar() {
    setSalvando(true)
    const res = await fetch("/api/gestao/okrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cluster: form.cluster || null }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setSalvando(false); return }
    const okr = await res.json()
    toast.success("OKR criado")
    router.push(`/gestao/okrs/${okr.id}`)
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Novo OKR" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "OKRs", href: "/gestao/okrs" }, { label: "Novo" }]} />
      <main className="flex-1 p-4 md:p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Criar objetivo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Título do objetivo" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option value="EMPRESA">Empresa</option>
              <option value="CLUSTER">Cluster</option>
              <option value="PESSOA">Pessoa</option>
            </select>
            {form.tipo === "CLUSTER" && (
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.cluster} onChange={e => setForm(f => ({ ...f, cluster: e.target.value }))}>
                <option value="">Selecione o cluster</option>
                <option value="NEGOCIO">Negócio</option>
                <option value="OPERACIONAL">Operacional</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            )}
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))}>
              <option value="">Responsável</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <Input placeholder="Ciclo (ex: 2026-Q3)" value={form.ciclo} onChange={e => setForm(f => ({ ...f, ciclo: e.target.value }))} />
            <Button onClick={salvar} disabled={salvando || !form.titulo || !form.responsavelId || !form.ciclo}>
              {salvando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Criar OKR
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
