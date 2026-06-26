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

export default function NovoIndicadorPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: "", cluster: "NEGOCIO", responsavelId: "", meta: "", unidade: "" })

  useEffect(() => {
    fetch("/api/perfis").then(r => r.json()).then(setProfiles)
  }, [])

  async function salvar() {
    setSalvando(true)
    const res = await fetch("/api/gestao/indicadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, meta: Number(form.meta) }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setSalvando(false); return }
    toast.success("Indicador criado")
    router.push("/gestao/indicadores")
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Novo Indicador" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Indicadores", href: "/gestao/indicadores" }, { label: "Novo" }]} />
      <main className="flex-1 p-4 md:p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Criar indicador</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nome do indicador" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.cluster} onChange={e => setForm(f => ({ ...f, cluster: e.target.value }))}>
              <option value="NEGOCIO">Negócio</option>
              <option value="OPERACIONAL">Operacional</option>
              <option value="CLIENTE">Cliente</option>
            </select>
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))}>
              <option value="">Responsável</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <div className="flex gap-2">
              <Input type="number" placeholder="Meta" value={form.meta} onChange={e => setForm(f => ({ ...f, meta: e.target.value }))} className="flex-1" />
              <Input placeholder="Unidade (%, R$, NPS…)" value={form.unidade} onChange={e => setForm(f => ({ ...f, unidade: e.target.value }))} className="flex-1" />
            </div>
            <Button onClick={salvar} disabled={salvando || !form.nome || !form.responsavelId}>
              {salvando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Criar indicador
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
