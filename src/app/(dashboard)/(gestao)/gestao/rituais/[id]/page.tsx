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
import { Loader2, Trash2, Plus } from "lucide-react"

interface Ocorrencia { id: string; data: string; ata: string | null; facilitadorId: string | null }
interface Ritual { id: string; nome: string; frequencia: string; duracaoMin: number; facilitadorId: string; ocorrencias: Ocorrencia[] }
interface Profile { id: string; nome: string }

export default function RitualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [ataForm, setAtaForm] = useState({ data: "", ata: "", facilitadorId: "" })
  const [registrando, setRegistrando] = useState(false)
  const [editandoAta, setEditandoAta] = useState<string | null>(null)
  const [editAtaTexto, setEditAtaTexto] = useState("")

  const carregar = useCallback(async () => {
    const [rRes, pRes] = await Promise.all([fetch(`/api/gestao/rituais/${id}`), fetch("/api/perfis")])
    setRitual(await rRes.json())
    setProfiles(await pRes.json())
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function excluir() {
    await fetch(`/api/gestao/rituais/${id}`, { method: "DELETE" })
    toast.success("Ritual excluído")
    router.push("/gestao/rituais")
  }

  async function registrarAta() {
    if (!ataForm.data) { toast.error("Data obrigatória"); return }
    setRegistrando(true)
    const res = await fetch(`/api/gestao/rituais/${id}/ocorrencias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: ataForm.data, ata: ataForm.ata || null, facilitadorId: ataForm.facilitadorId || null }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setRegistrando(false); return }
    toast.success("Ata registrada")
    setAtaForm({ data: "", ata: "", facilitadorId: "" })
    setRegistrando(false)
    carregar()
  }

  async function salvarEditAta(ocorrenciaId: string) {
    await fetch(`/api/gestao/rituais/${id}/ocorrencias?ocorrenciaId=${ocorrenciaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ata: editAtaTexto }),
    })
    toast.success("Ata atualizada")
    setEditandoAta(null)
    carregar()
  }

  if (!ritual) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={ritual.nome}
        breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Rituais", href: "/gestao/rituais" }, { label: ritual.nome }]}
      >
        <Button size="sm" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 max-w-2xl space-y-6">
        <div className="flex gap-2">
          <Badge variant="outline">{ritual.frequencia}</Badge>
          <Badge variant="secondary">{ritual.duracaoMin} min</Badge>
        </div>

        {/* Registrar nova ata */}
        <Card>
          <CardHeader><CardTitle className="text-base">Registrar ata</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input type="date" value={ataForm.data} onChange={e => setAtaForm(f => ({ ...f, data: e.target.value }))} />
            <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={ataForm.facilitadorId} onChange={e => setAtaForm(f => ({ ...f, facilitadorId: e.target.value }))}>
              <option value="">Facilitador (opcional)</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <Textarea placeholder="Ata (opcional — pode preencher depois)" value={ataForm.ata} onChange={e => setAtaForm(f => ({ ...f, ata: e.target.value }))} rows={3} />
            <Button size="sm" onClick={registrarAta} disabled={registrando || !ataForm.data}>
              {registrando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}Registrar
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de atas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Histórico ({ritual.ocorrencias.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ritual.ocorrencias.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ata registrada ainda.</p>}
            {[...ritual.ocorrencias].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(o => {
              const facilitador = profiles.find(p => p.id === o.facilitadorId)
              return (
                <div key={o.id} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{new Intl.DateTimeFormat("pt-BR").format(new Date(o.data))}</p>
                    {facilitador && <span className="text-xs text-muted-foreground">{facilitador.nome}</span>}
                  </div>
                  {editandoAta === o.id ? (
                    <div className="space-y-2">
                      <Textarea value={editAtaTexto} onChange={e => setEditAtaTexto(e.target.value)} rows={4} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => salvarEditAta(o.id)}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditandoAta(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {o.ata ? (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{o.ata}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Sem ata registrada.</p>
                      )}
                      <Button size="sm" variant="ghost" className="mt-1 h-6 text-xs px-2" onClick={() => { setEditandoAta(o.id); setEditAtaTexto(o.ata ?? "") }}>
                        {o.ata ? "Editar ata" : "Adicionar ata"}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
