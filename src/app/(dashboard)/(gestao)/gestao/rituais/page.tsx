"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Ocorrencia { id: string; data: string }
interface Ritual { id: string; nome: string; frequencia: string; duracaoMin: number; ocorrencias: Ocorrencia[] }

export default function RituaisPage() {
  const [rituais, setRituais] = useState<Ritual[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/gestao/rituais").then(r => r.json()).then(data => { setRituais(data); setLoading(false) })
  }, [])

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Rituais" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Rituais" }]}>
        <Link href="/gestao/rituais/novo" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Novo ritual
        </Link>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rituais.map(r => (
              <Link key={r.id} href={`/gestao/rituais/${r.id}`}>
                <Card className="hover:border-primary/30 transition-all">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{r.nome}</h3>
                      <Badge variant="outline" className="text-[10px] shrink-0">{r.frequencia}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.duracaoMin} min · {r.ocorrencias.length} ata(s)</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {rituais.length === 0 && (
              <div className="col-span-3 text-center py-20 text-muted-foreground">
                <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-25" /><p>Nenhum ritual ainda.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
