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

export default function NovoRitualPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ nome: "", frequencia: "SEMANAL", duracaoMin: "60", facilitadorId: "" })

  useEffect(() => {
    fetch("/api/perfis").then(r => r.json()).then(setProfiles)
  }, [])

  async function salvar() {
    setSalvando(true)
    const res = await fetch("/api/gestao/rituais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duracaoMin: Number(form.duracaoMin) }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setSalvando(false); return }
    toast.success("Ritual criado")
    router.push("/gestao/rituais")
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Novo Ritual" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Rituais", href: "/gestao/rituais" }, { label: "Novo" }]} />
      <main className="flex-1 p-4 md:p-6 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Criar ritual</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nome do ritual" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.frequencia} onChange={e => setForm(f => ({ ...f, frequencia: e.target.value }))}>
              <option value="DIARIO">Diário</option>
              <option value="SEMANAL">Semanal</option>
              <option value="QUINZENAL">Quinzenal</option>
              <option value="MENSAL">Mensal</option>
              <option value="TRIMESTRAL">Trimestral</option>
            </select>
            <Input type="number" placeholder="Duração (minutos)" value={form.duracaoMin} onChange={e => setForm(f => ({ ...f, duracaoMin: e.target.value }))} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.facilitadorId} onChange={e => setForm(f => ({ ...f, facilitadorId: e.target.value }))}>
              <option value="">Facilitador</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <Button onClick={salvar} disabled={salvando || !form.nome || !form.facilitadorId}>
              {salvando && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Criar ritual
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
