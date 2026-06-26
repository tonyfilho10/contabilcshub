"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tarefa { id: string; descricao: string; responsavelId: string; prazo: string; status: string; motivoTravado: string | null; leituraConfirmada: boolean }
interface Profile { id: string; nome: string }

const STATUS_BADGE: Record<string, string> = {
  RECEBIDO: "secondary", ANDAMENTO: "outline", CONCLUIDO: "default", TRAVADO: "destructive",
}

export default function TarefasSociosPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filtroStatus, setFiltroStatus] = useState("")
  const [filtroResp, setFiltroResp] = useState("")
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    const [t, p] = await Promise.all([fetch("/api/gestao/tarefas"), fetch("/api/perfis")])
    setTarefas(await t.json())
    setProfiles(await p.json())
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtradas = tarefas.filter(t =>
    (!filtroStatus || t.status === filtroStatus) &&
    (!filtroResp || t.responsavelId === filtroResp)
  )

  const hoje = new Date().toISOString().split("T")[0]
  const vencida = (t: Tarefa) => t.prazo < hoje && t.status !== "CONCLUIDO"

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Tarefas" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Tarefas" }]}>
        <Link href="/gestao/tarefas/nova" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Nova tarefa
        </Link>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {["RECEBIDO","ANDAMENTO","CONCLUIDO","TRAVADO"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="border rounded-md px-2 py-1.5 text-sm bg-background" value={filtroResp} onChange={e => setFiltroResp(e.target.value)}>
            <option value="">Todos os responsáveis</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-2">
            {filtradas.map(t => {
              const resp = profiles.find(p => p.id === t.responsavelId)
              const eVencida = vencida(t)
              return (
                <Card key={t.id} className={cn("transition-all", eVencida && "border-destructive/50", t.status === "TRAVADO" && "border-orange-500/50")}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {(eVencida || t.status === "TRAVADO") && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                        <p className="font-medium text-sm truncate">{t.descricao}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {resp?.nome} · prazo: {new Intl.DateTimeFormat("pt-BR").format(new Date(t.prazo))}
                        {t.motivoTravado && ` · ${t.motivoTravado}`}
                      </p>
                    </div>
                    <Badge variant={STATUS_BADGE[t.status] as "default" | "secondary" | "outline" | "destructive"}>{t.status}</Badge>
                    <Link href={`/gestao/tarefas/${t.id}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>Ver</Link>
                  </CardContent>
                </Card>
              )
            })}
            {filtradas.length === 0 && <p className="text-center text-muted-foreground py-10">Nenhuma tarefa encontrada.</p>}
          </div>
        )}
      </main>
    </div>
  )
}
