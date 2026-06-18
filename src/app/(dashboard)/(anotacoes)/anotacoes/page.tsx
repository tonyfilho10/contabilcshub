"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { buttonVariants, Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AtSign,
  Tag,
  X,
  Network,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { GrafoAnotacoes } from "@/components/grafo-anotacoes"

interface Pasta { id: string; nome: string; cor: string }
interface TagItem { id: string; nome: string; cor: string }

interface Nota {
  id: string
  titulo: string
  conteudo: any
  usuarioId: string
  pastaId: string | null
  pasta: Pasta | null
  tags: { tag: { id: string; nome: string; cor: string } }[]
  mencionadosIds: string[]
  atualizadoEm: string
}

function resumo(conteudo: any): string {
  if (!conteudo) return ""
  try {
    if (typeof conteudo === "string") {
      return conteudo.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
    }
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

function NotaCard({
  nota,
  onExcluir,
  podExcluir = true,
}: {
  nota: Nota
  onExcluir?: (nota: Nota) => void
  podExcluir?: boolean
}) {
  return (
    <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all group relative">
      {podExcluir && onExcluir && (
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
                onClick={() => onExcluir(nota)}
              >
                <Trash2 className="mr-2 h-4 w-4" />Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {!podExcluir && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
              <MoreVertical className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/anotacoes/${nota.id}/editar`} />}>
                <Pencil className="mr-2 h-4 w-4" />Editar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Link href={`/anotacoes/${nota.id}/editar`}>
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
  )
}

function ListaNotas({
  notas,
  loading,
  vazio,
  onExcluir,
  podExcluir = true,
}: {
  notas: Nota[]
  loading: boolean
  vazio: React.ReactNode
  onExcluir?: (nota: Nota) => void
  podExcluir?: boolean
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (notas.length === 0) return <>{vazio}</>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notas.map((nota) => (
        <NotaCard key={nota.id} nota={nota} onExcluir={onExcluir} podExcluir={podExcluir} />
      ))}
    </div>
  )
}

export default function AnotacoesPage() {
  const [minhas, setMinhas] = useState<Nota[]>([])
  const [mencionadas, setMencionadas] = useState<Nota[]>([])
  const [busca, setBusca] = useState("")
  const [pastaId, setPastaId] = useState("")
  const [tagId, setTagId] = useState("")
  const [abaAtiva, setAbaAtiva] = useState("minhas")
  const [loadingMinhas, setLoadingMinhas] = useState(true)
  const [loadingMencionadas, setLoadingMencionadas] = useState(true)
  const [excluindo, setExcluindo] = useState<Nota | null>(null)
  const [excluindoLoad, setExcluindoLoad] = useState(false)

  // Derive pastas and tags from the loaded notes for the active tab
  const notasAtivas = abaAtiva === "minhas" ? minhas : mencionadas

  const pastas = useMemo(() => {
    const map = new Map<string, Pasta>()
    notasAtivas.forEach((n) => { if (n.pasta && n.pastaId) map.set(n.pastaId, { ...n.pasta, id: n.pastaId }) })
    return [...map.values()]
  }, [notasAtivas])

  const tags = useMemo(() => {
    const map = new Map<string, TagItem>()
    notasAtivas.forEach((n) => n.tags.forEach(({ tag }) => map.set(tag.id, tag)))
    return [...map.values()]
  }, [notasAtivas])

  const carregarMinhas = useCallback(async () => {
    setLoadingMinhas(true)
    try {
      const params = new URLSearchParams({ tipo: "minhas" })
      if (busca) params.set("busca", busca)
      if (pastaId) params.set("pastaId", pastaId)
      if (tagId) params.set("tagId", tagId)
      const res = await fetch(`/api/anotacoes?${params}`)
      const data = await res.json()
      setMinhas(Array.isArray(data) ? data : [])
    } finally {
      setLoadingMinhas(false)
    }
  }, [busca, pastaId, tagId])

  const carregarMencionadas = useCallback(async () => {
    setLoadingMencionadas(true)
    try {
      const params = new URLSearchParams({ tipo: "mencionadas" })
      if (busca) params.set("busca", busca)
      if (pastaId) params.set("pastaId", pastaId)
      if (tagId) params.set("tagId", tagId)
      const res = await fetch(`/api/anotacoes?${params}`)
      const data = await res.json()
      setMencionadas(Array.isArray(data) ? data : [])
    } finally {
      setLoadingMencionadas(false)
    }
  }, [busca, pastaId, tagId])

  useEffect(() => {
    const t = setTimeout(() => { carregarMinhas(); carregarMencionadas() }, 300)
    return () => clearTimeout(t)
  }, [carregarMinhas, carregarMencionadas])

  async function handleExcluir() {
    if (!excluindo) return
    setExcluindoLoad(true)
    try {
      await fetch(`/api/anotacoes/${excluindo.id}`, { method: "DELETE" })
      toast.success("Nota excluída")
      setExcluindo(null)
      carregarMinhas()
    } finally {
      setExcluindoLoad(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Anotações"
        breadcrumbs={[{ label: "Anotações", href: "/anotacoes" }]}
      >
        <Link href="/anotacoes/nova" className={cn(buttonVariants({ size: "sm" }))}>
          <Plus className="h-4 w-4 mr-1" />Nova Nota
        </Link>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtro de pasta */}
          <Select value={pastaId} onValueChange={(v) => setPastaId(!v || v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-44 h-9">
              <Folder className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Pasta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as pastas</SelectItem>
              {pastas.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro de tag */}
          <Select value={tagId} onValueChange={(v) => setTagId(!v || v === "__all__" ? "" : v)}>
            <SelectTrigger className="w-40 h-9">
              <Tag className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas as tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Limpar filtros */}
          {(pastaId || tagId) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-muted-foreground"
              onClick={() => { setPastaId(""); setTagId("") }}
            >
              <X className="h-3.5 w-3.5 mr-1" />Limpar
            </Button>
          )}
        </div>

        <Tabs value={abaAtiva} onValueChange={(v) => { setAbaAtiva(v); setPastaId(""); setTagId("") }}>
          <TabsList>
            <TabsTrigger value="minhas">
              <NotebookText className="h-3.5 w-3.5 mr-1.5" />
              Minhas Notas
              {minhas.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  {minhas.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="mencionadas">
              <AtSign className="h-3.5 w-3.5 mr-1.5" />
              Marcado em
              {mencionadas.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 leading-none">
                  {mencionadas.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="grafo">
              <Network className="h-3.5 w-3.5 mr-1.5" />
              Grafo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="minhas" className="mt-4">
            <ListaNotas
              notas={minhas}
              loading={loadingMinhas}
              onExcluir={setExcluindo}
              podExcluir
              vazio={
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
              }
            />
          </TabsContent>

          <TabsContent value="mencionadas" className="mt-4">
            <ListaNotas
              notas={mencionadas}
              loading={loadingMencionadas}
              podExcluir={false}
              vazio={
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <AtSign className="h-12 w-12 mb-3 opacity-25" />
                    <p className="text-base font-medium">Nenhuma menção ainda</p>
                    <p className="text-sm mt-1">Notas em que você for marcado aparecem aqui.</p>
                  </CardContent>
                </Card>
              }
            />
          </TabsContent>

          <TabsContent value="grafo" className="mt-4">
            <GrafoAnotacoes />
          </TabsContent>
        </Tabs>
      </main>

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
