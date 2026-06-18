"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { buttonVariants, Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { StatusBadge, type PopStatus } from "@/components/pop-editor/status-badge"
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  Loader2,
  Network,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { MentionAvatarStack } from "@/components/mention-avatar-stack"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GrafoAnotacoes } from "@/components/grafo-anotacoes"

interface Pop {
  id: string
  titulo: string
  descricao: string | null
  status: PopStatus
  versao: string
  mencionadosIds: string[]
  atualizadoEm: string
  tags: { tag: { id: string; nome: string; cor: string } }[]
}

export default function POPsPage() {
  const [pops, setPops] = useState<Pop[]>([])
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)
  const [excluindo, setExcluindo] = useState<Pop | null>(null)
  const [excluindoLoad, setExcluindoLoad] = useState(false)
  const [aba, setAba] = useState("lista")

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pops")
      const data = await res.json()
      setPops(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = pops.filter(
    (p) =>
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      (p.descricao ?? "").toLowerCase().includes(busca.toLowerCase())
  )

  async function handleExcluir() {
    if (!excluindo) return
    setExcluindoLoad(true)
    try {
      await fetch(`/api/pops/${excluindo.id}`, { method: "DELETE" })
      toast.success("POP excluído")
      setExcluindo(null)
      await carregar()
    } finally {
      setExcluindoLoad(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="POPs"
        breadcrumbs={[{ label: "CSHUB Contábil", href: "/dashboard" }, { label: "POPs" }]}
      >
        <Link href="/pops/novo" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Novo POP
        </Link>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList>
            <TabsTrigger value="lista">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />POPs
              {pops.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  {pops.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="grafo">
              <Network className="h-3.5 w-3.5 mr-1.5" />Grafo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="mt-4 space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar POPs…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
            ) : filtrados.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-3 opacity-25" />
                  <p className="text-base font-medium">
                    {busca ? "Nenhum POP encontrado" : "Nenhum POP criado ainda"}
                  </p>
                  {!busca && (
                    <>
                      <p className="text-sm mt-1">Comece criando o primeiro procedimento.</p>
                      <Link href="/pops/novo" className={cn(buttonVariants(), "mt-4")}>
                        <Plus className="h-4 w-4 mr-1" />Criar POP
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.map((pop) => (
                  <Card
                    key={pop.id}
                    className="h-full hover:shadow-md hover:border-primary/30 transition-all group relative"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
                          <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem render={<Link href={`/pops/${pop.id}/editar`} />}>
                            <Pencil className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setExcluindo(pop)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Link href={`/pops/${pop.id}`}>
                      <CardContent className="p-4 flex flex-col gap-2 h-full">
                        <div className="flex items-start gap-2 pr-6">
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{pop.titulo}</h3>
                          <StatusBadge status={pop.status} />
                        </div>
                        {pop.descricao && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{pop.descricao}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-border">
                          {pop.tags.slice(0, 2).map(({ tag }) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-[10px] h-5 px-1.5"
                              style={{ borderColor: tag.cor + "66", color: tag.cor }}
                            >
                              {tag.nome}
                            </Badge>
                          ))}
                          <span className="text-[10px] text-muted-foreground">v{pop.versao}</span>
                          {pop.mencionadosIds?.length > 0 && (
                            <MentionAvatarStack ids={pop.mencionadosIds} max={3} />
                          )}
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
                              new Date(pop.atualizadoEm)
                            )}
                          </span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="grafo" className="mt-4">
            <GrafoAnotacoes initialFiltro="pops" />
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir POP?</AlertDialogTitle>
            <AlertDialogDescription>
              O POP <strong>"{excluindo?.titulo}"</strong> e todos os seus dados serão excluídos permanentemente.
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
