"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, List, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BacklogItem { id: string; nome: string; descricao: string | null; area: string; prioridade: string; status: string }

const PRIORIDADE_LABEL: Record<string, string> = {
  URGENTE_IMPORTANTE: "🔴 Urgente+Importante",
  IMPORTANTE: "🟡 Importante",
  URGENTE: "🟠 Urgente",
  BAIXA: "⚪ Baixa"
}
const STATUS_TABS = ["BACKLOG", "EM_SPRINT", "CONCLUIDO", "DESCARTADO"]

export default function BacklogPage() {
  const [itens, setItens] = useState<BacklogItem[]>([])
  const [aba, setAba] = useState("BACKLOG")
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(() => {
    fetch("/api/gestao/backlog").then(r => r.json()).then(d => { setItens(d); setLoading(false) })
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function moverParaSprint(id: string) {
    const res = await fetch(`/api/gestao/backlog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "EM_SPRINT" }),
    })
    if (!res.ok) { const e = await res.json(); toast.error(e.error); return }
    toast.success("Movido para sprint! Tarefa criada automaticamente.")
    carregar()
  }

  const filtrados = itens.filter(i => i.status === aba)

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Backlog" breadcrumbs={[{ label: "Gestão", href: "/gestao" }, { label: "Backlog" }]}>
        <Link href="/gestao/backlog/novo" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Nova iniciativa
        </Link>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex gap-1 flex-wrap">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setAba(s)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium border transition-colors",
                aba === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-2">
            {filtrados.map(item => (
              <Card key={item.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.nome}</p>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px]">{item.area}</Badge>
                      <span className="text-xs text-muted-foreground">{PRIORIDADE_LABEL[item.prioridade]}</span>
                    </div>
                  </div>
                  {aba === "BACKLOG" && (
                    <Button size="sm" variant="outline" onClick={() => moverParaSprint(item.id)}>→ Sprint</Button>
                  )}
                  <Link href={`/gestao/backlog/${item.id}`} className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}>Editar</Link>
                </CardContent>
              </Card>
            ))}
            {filtrados.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <List className="h-10 w-10 mx-auto mb-3 opacity-25" /><p>Nenhum item em {aba}.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
