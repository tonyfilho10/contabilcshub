"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Medicao { id: string; valor: number; data: string; atualizadoPor: string }
interface Indicador { id: string; nome: string; cluster: string; meta: number; unidade: string; responsavelId: string; medicoes: Medicao[] }

export default function IndicadorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [indicador, setIndicador] = useState<Indicador | null>(null)
  const [novaForm, setNovaForm] = useState({ valor: "", data: new Date().toISOString().split("T")[0] })
  const [registrando, setRegistrando] = useState(false)

  const carregar = useCallback(async () => {
    const res = await fetch(`/api/gestao/indicadores/${id}`)
    setIndicador(await res.json())
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  async function excluir() {
    await fetch(`/api/gestao/indicadores/${id}`, { method: "DELETE" })
    toast.success("Indicador excluído")
    router.push("/gestao/indicadores")
  }

  async function registrarMedicao() {
    if (!novaForm.valor) { toast.error("Informe o valor"); return }
    setRegistrando(true)
    const res = await fetch(`/api/gestao/indicadores/${id}/medicoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: Number(novaForm.valor), data: novaForm.data }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); setRegistrando(false); return }
    toast.success("Medição registrada")
    setNovaForm({ valor: "", data: new Date().toISOString().split("T")[0] })
    setRegistrando(false)
    carregar()
  }

  async function editarMedicao(medicaoId: string, valor: number) {
    await fetch(`/api/gestao/indicadores/${id}/medicoes?medicaoId=${medicaoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor }),
    })
    toast.success("Medição atualizada")
    carregar()
  }

  if (!indicador) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  const medicoesOrdenadas = [...indicador.medicoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  const ultima = medicoesOrdenadas[0]
  const valorAtual = ultima?.valor ?? 0
  const pct = indicador.meta > 0 ? Math.min(100, (valorAtual / indicador.meta) * 100) : 0
  const abaixoDaMeta = valorAtual < indicador.meta

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={indicador.nome}
        breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Indicadores", href: "/gestao/indicadores" }, { label: indicador.nome }]}
      >
        <Button size="sm" variant="destructive" onClick={excluir}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 max-w-2xl space-y-6">
        {/* Card de status */}
        <Card className={cn(abaixoDaMeta && "border-orange-500/40")}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{valorAtual} <span className="text-sm font-normal text-muted-foreground">{indicador.unidade}</span></p>
                <p className="text-xs text-muted-foreground">meta: {indicador.meta} {indicador.unidade}</p>
              </div>
              <Badge variant="outline">{indicador.cluster}</Badge>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full transition-all", abaixoDaMeta ? "bg-orange-500" : "bg-green-500")} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-right">{Math.round(pct)}% da meta</p>
            </div>
          </CardContent>
        </Card>

        {/* Registrar nova medição */}
        <Card>
          <CardHeader><CardTitle className="text-base">Registrar medição</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Valor (${indicador.unidade})`}
                value={novaForm.valor}
                onChange={e => setNovaForm(f => ({ ...f, valor: e.target.value }))}
                className="flex-1"
              />
              <Input
                type="date"
                value={novaForm.data}
                onChange={e => setNovaForm(f => ({ ...f, data: e.target.value }))}
                className="flex-1"
              />
            </div>
            <Button size="sm" onClick={registrarMedicao} disabled={registrando || !novaForm.valor}>
              {registrando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}Registrar
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de medições */}
        <Card>
          <CardHeader><CardTitle className="text-base">Histórico ({indicador.medicoes.length} medições)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {medicoesOrdenadas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma medição ainda.</p>}
            {medicoesOrdenadas.slice(0, 8).map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2 border rounded-md">
                <p className="text-xs text-muted-foreground w-24 shrink-0">{new Intl.DateTimeFormat("pt-BR").format(new Date(m.data))}</p>
                <Input
                  type="number"
                  className="h-7 w-24 text-xs"
                  defaultValue={m.valor}
                  onBlur={e => { if (Number(e.target.value) !== m.valor) editarMedicao(m.id, Number(e.target.value)) }}
                />
                <span className="text-xs text-muted-foreground">{indicador.unidade}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
