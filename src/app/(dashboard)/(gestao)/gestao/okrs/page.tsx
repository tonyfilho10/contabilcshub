"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface KR { id: string; descricao: string; meta: number; atual: number; unidade: string }
interface Okr { id: string; titulo: string; tipo: string; cluster: string | null; ciclo: string; progresso: number; status: string; keyResults: KR[] }

const STATUS_COLOR: Record<string, string> = { NO_PRAZO: "default", EM_RISCO: "outline", FORA_PRAZO: "destructive" }

export default function OkrsPage() {
  const [okrs, setOkrs] = useState<Okr[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/gestao/okrs").then(r => r.json()).then(data => { setOkrs(data); setLoading(false) })
  }, [])

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="OKRs" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "OKRs" }]}>
        <Link href="/gestao/okrs/novo" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Novo objetivo
        </Link>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {okrs.map(okr => (
              <Link key={okr.id} href={`/gestao/okrs/${okr.id}`}>
                <Card className="hover:border-primary/30 transition-all h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-snug">{okr.titulo}</h3>
                      <Badge variant={STATUS_COLOR[okr.status] as "default" | "outline" | "destructive"} className="shrink-0 text-[10px]">{okr.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">{okr.tipo}</Badge>
                      {okr.cluster && <Badge variant="outline" className="text-[10px]">{okr.cluster}</Badge>}
                      <Badge variant="outline" className="text-[10px]">{okr.ciclo}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span><span>{okr.progresso}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${okr.progresso}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{okr.keyResults.length} key result(s)</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {okrs.length === 0 && (
              <div className="col-span-3 text-center py-20 text-muted-foreground">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-25" /><p>Nenhum OKR ainda.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
