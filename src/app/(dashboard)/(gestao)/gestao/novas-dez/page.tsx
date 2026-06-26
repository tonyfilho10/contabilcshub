"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Reuniao {
  id: string
  tema: string
  status: string
  criadoEm: string
  decisoes: { id: string }[]
}

const TEMAS: Record<number, string> = {
  1: "Gestão e Governança",
  2: "Comercial e Marketing",
  3: "Pessoas",
  4: "Operação e Onboarding",
  5: "Revisão da Semana",
}

export default function NovasDezPage() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [loading, setLoading] = useState(true)

  const carregarReunioes = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/gestao/reunioes")
    const data = await res.json()
    setReunioes(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { carregarReunioes() }, [carregarReunioes])

  const diaSemana = new Date().getDay()
  const temaHoje = TEMAS[diaSemana] ?? "Revisão da Semana"

  async function iniciarReuniao() {
    const res = await fetch("/api/gestao/reunioes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: temaHoje }),
    })
    if (!res.ok) { toast.error("Erro ao iniciar reunião"); return }
    const reuniao = await res.json()
    window.location.href = `/gestao/novas-dez/${reuniao.id}`
  }

  async function excluir(id: string) {
    await fetch(`/api/gestao/reunioes/${id}`, { method: "DELETE" })
    toast.success("Reunião excluída")
    carregarReunioes()
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Novas Dez"
        breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Novas Dez" }]}
      >
        <Button size="sm" onClick={iniciarReuniao}>
          <Plus className="h-4 w-4 mr-1" />Iniciar reunião de hoje
        </Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">Tema de hoje</p>
          <p className="font-semibold">{temaHoje}</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reunioes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p>Nenhuma reunião ainda. Inicie a primeira!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {reunioes.map(r => (
              <Card key={r.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.tema}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(r.criadoEm))}
                      {" · "}{r.decisoes.length} decisão(ões)
                    </p>
                  </div>
                  <Badge variant={r.status === "ABERTA" ? "default" : "secondary"}>{r.status}</Badge>
                  <Link href={`/gestao/novas-dez/${r.id}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                    Abrir
                  </Link>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => excluir(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
