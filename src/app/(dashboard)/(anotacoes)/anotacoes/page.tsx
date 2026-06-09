"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { NotebookText, Plus, Search, Folder, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock inicial — substituir por fetch real
const mockNotes = [
  {
    id: "1",
    titulo: "Reunião com cliente — maio",
    resumo: "Discutir abertura de empresa, CNPJ, regime tributário...",
    pasta: "Clientes",
    pastaCor: "#f97316",
    tags: ["cliente", "tributário"],
    atualizadoEm: new Date("2025-06-01"),
  },
  {
    id: "2",
    titulo: "Checklist fechamento mensal",
    resumo: "1. Conciliação bancária 2. DRE 3. Balancete...",
    pasta: "Processos",
    pastaCor: "#6366f1",
    tags: ["mensal"],
    atualizadoEm: new Date("2025-05-28"),
  },
]

export default function AnotacoesPage() {
  const [busca, setBusca] = useState("")

  const filtradas = mockNotes.filter(
    (n) =>
      n.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      n.resumo.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Minhas Notas"
        breadcrumbs={[{ label: "Anotações", href: "/anotacoes" }, { label: "Minhas Notas" }]}
      >
        <Link href="/anotacoes/nova" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Nova Nota
        </Link>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-4">
        {/* Busca */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {filtradas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <NotebookText className="h-12 w-12 mb-3 opacity-25" />
              <p className="text-base font-medium">Nenhuma nota ainda</p>
              <p className="text-sm mt-1">Crie sua primeira anotação pessoal.</p>
              <Link href="/anotacoes/nova" className={cn(buttonVariants(), "mt-4")}>
                <Plus className="h-4 w-4 mr-1" />Criar Nota
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtradas.map((nota) => (
              <Link key={nota.id} href={`/anotacoes/${nota.id}`}>
                <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                  <CardContent className="p-4 flex flex-col gap-2 h-full">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-snug line-clamp-2">{nota.titulo}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{nota.resumo}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-border">
                      {nota.pasta && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: nota.pastaCor + "22", color: nota.pastaCor }}
                        >
                          <Folder className="h-3 w-3" />{nota.pasta}
                        </span>
                      )}
                      {nota.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-1.5">
                          {tag}
                        </Badge>
                      ))}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(nota.atualizadoEm)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
