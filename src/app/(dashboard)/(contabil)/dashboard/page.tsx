"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle2, Clock, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StatusBadge, type PopStatus } from "@/components/pop-editor/status-badge"

interface Pop {
  id: string
  titulo: string
  status: PopStatus
  atualizadoEm: string
}

export default function DashboardPage() {
  const [pops, setPops] = useState<Pop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    fetch("/api/pops")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelado) setPops(Array.isArray(data) ? data : [])
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })
    return () => { cancelado = true }
  }, [])

  const stats = [
    { label: "Total de POPs", value: pops.length, icon: BookOpen, color: "text-blue-500" },
    { label: "Publicados", value: pops.filter((p) => p.status === "PUBLICADO").length, icon: CheckCircle2, color: "text-green-500" },
    { label: "Em Revisão", value: pops.filter((p) => p.status === "EM_REVISAO").length, icon: Clock, color: "text-amber-500" },
    { label: "Rascunhos", value: pops.filter((p) => p.status === "RASCUNHO").length, icon: FileText, color: "text-slate-500" },
  ]

  const recentes = pops.slice(0, 5)

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "CSHUB Contábil", href: "/dashboard" }, { label: "Dashboard" }]}
      >
        <Link href="/pops/novo" className={cn(buttonVariants({ size: "sm" }))}>
          Novo POP
        </Link>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "—" : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>POPs Recentes</CardTitle>
              <CardDescription>Últimos procedimentos criados ou atualizados</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">Nenhum POP criado ainda.</p>
                  <Link href="/pops/novo" className={cn(buttonVariants({ variant: "link", size: "sm" }), "mt-1")}>
                    Criar primeiro POP
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentes.map((pop) => (
                    <Link
                      key={pop.id}
                      href={`/pops/${pop.id}`}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-2 -mx-2 hover:bg-accent transition-colors"
                    >
                      <span className="text-sm font-medium truncate">{pop.titulo}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={pop.status} />
                        <span className="text-[11px] text-muted-foreground">
                          {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
                            new Date(pop.atualizadoEm)
                          )}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Comentários e atualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">Sem atividade recente.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
