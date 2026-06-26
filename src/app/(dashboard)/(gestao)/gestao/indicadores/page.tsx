"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Medicao { id: string; valor: number; data: string }
interface Indicador { id: string; nome: string; cluster: string; meta: number; unidade: string; medicoes: Medicao[] }

const CLUSTERS = ["NEGOCIO", "OPERACIONAL", "CLIENTE"]

export default function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/gestao/indicadores").then(r => r.json()).then(d => { setIndicadores(d); setLoading(false) })
  }, [])

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Indicadores" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Indicadores" }]}>
        <Link href="/gestao/indicadores/novo" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Novo indicador
        </Link>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          CLUSTERS.map(cluster => {
            const grupo = indicadores.filter(i => i.cluster === cluster)
            if (!grupo.length) return null
            return (
              <div key={cluster}>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">{cluster}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {grupo.map(ind => {
                    const ultima = [...ind.medicoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
                    const valorAtual = ultima?.valor ?? 0
                    const pct = ind.meta > 0 ? Math.min(100, (valorAtual / ind.meta) * 100) : 0
                    const abaixoDaMeta = valorAtual < ind.meta
                    return (
                      <Link key={ind.id} href={`/gestao/indicadores/${ind.id}`}>
                        <Card className={cn("hover:border-primary/30 transition-all", abaixoDaMeta && "border-orange-500/40")}>
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-1">
                              <p className="font-medium text-sm">{ind.nome}</p>
                              {abaixoDaMeta && <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />}
                            </div>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-bold">{valorAtual}</span>
                              <span className="text-xs text-muted-foreground">meta: {ind.meta} {ind.unidade}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full transition-all", abaixoDaMeta ? "bg-orange-500" : "bg-green-500")} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{ind.medicoes.length} medição(ões)</p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
        {!loading && indicadores.length === 0 && (
          <div className="text-center py-20 text-muted-foreground"><p>Nenhum indicador ainda.</p></div>
        )}
      </main>
    </div>
  )
}
