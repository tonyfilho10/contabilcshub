"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NotebookText,
  Plus,
  Search,
  Folder,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { MentionAvatarStack } from "@/components/mention-avatar-stack"

interface Nota {
  id: string
  titulo: string
  conteudo: any
  pastaId: string | null
  pasta: { nome: string; cor: string } | null
  tags: { tag: { id: string; nome: string; cor: string } }[]
  mencionadosIds: string[]
  atualizadoEm: string
}

function resumo(conteudo: any): string {
  if (!conteudo) return ""
  try {
    // HTML do editor TipTap → texto simples
    if (typeof conteudo === "string") {
      return conteudo
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120)
    }

    // TipTap JSON → texto simples
    const texto: string[] = []
    function walk(node: any) {
      if (node.type === "text") texto.push(node.text ?? "")
      if (node.content) node.content.forEach(walk)
    }
    walk(conteudo)
    return texto.join(" ").slice(0, 120)
  } catch {
    return ""
  }
}

export default function AnotacoesPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState<Nota | null>(null)
  const [excluindoLoad, setExcluindoLoad] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (busca) params.set("busca", busca)
      const res = await fetch(`/api/anotacoes?${params}`)
      const data = await res.json()
      setNotas(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [busca])

  useEffect(() => {
    const t = setTimeout(carregar, 300)
    return () => clearTimeout(t)
  }, [carregar])

  async function handleExcluir() {
    if (!excluindo) return
    setExcluindoLoad(true)
    try {
      await fetch(`/api/anotacoes/${excluindo.id}`, { method: "DELETE" })
      toast.success("Nota excluída")
      setExcluindo(null)
      await carregar()
    } finally {
      setExcluindoLoad(false)
    }
  }

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
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : notas.length === 0 ? (
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
            {notas.map((nota) => (
              <Card
                key={nota.id}
                className="h-full hover:shadow-md hover:border-primary/30 transition-all group relative"
              >
                {/* Ações */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
                      <MoreVertical className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/anotacoes/${nota.id}/editar`} />}>
                        <Pencil className="mr-2 h-4 w-4" />Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setExcluindo(nota)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/anotacoes/${nota.id}`}>
                  <CardContent className="p-4 flex flex-col gap-2 h-full">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 pr-6">{nota.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {resumo(nota.conteudo) || "Sem conteúdo"}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-border">
                      {nota.pasta && (
                        <span
                          className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: nota.pasta.cor + "22", color: nota.pasta.cor }}
                        >
                          <Folder className="h-3 w-3" />{nota.pasta.nome}
                        </span>
                      )}
                      {nota.tags.slice(0, 2).map(({ tag }) => (
                        <Badge key={tag.id} variant="secondary" className="text-[10px] h-5 px-1.5">
                          {tag.nome}
                        </Badge>
                      ))}
                      {nota.mencionadosIds.length > 0 && (
                        <MentionAvatarStack ids={nota.mencionadosIds} max={3} />
                      )}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
                          new Date(nota.atualizadoEm)
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Confirmação exclusão */}
      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
            <AlertDialogDescription>
              A nota <strong>"{excluindo?.titulo}"</strong> será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={excluindoLoad}
            >
              {excluindoLoad && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
