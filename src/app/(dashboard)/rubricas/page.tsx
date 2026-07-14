"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { RubricaForm, type RubricaFormData } from "@/components/rubricas/rubrica-form"
import { GRUPO_OPTIONS, GRUPO_LABEL, type RubricaGrupo } from "@/lib/rubricas-grupos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Upload, Loader2, CheckCircle2, XCircle, Search,
  MoreHorizontal, Pencil, Trash2, Plus, ClipboardPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface RubricaMapeamento {
  id: string
  codigo: string
  descricao: string
  grupo: RubricaGrupo
  lancamento: string | null
  contaDebito: string | null
  contaCredito: string | null
  historico: string | null
  origem: "IMPORTADO" | "MANUAL"
  criadoEm: string
  atualizadoEm: string
}

interface RelatorioItem {
  grupo: RubricaGrupo
  codigo: string
  descricao: string
  match: RubricaMapeamento | null
}

function toFormData(m: RubricaMapeamento): RubricaFormData {
  return {
    id: m.id,
    codigo: m.codigo,
    descricao: m.descricao,
    grupo: m.grupo,
    lancamento: m.lancamento ?? "",
    contaDebito: m.contaDebito ?? "",
    contaCredito: m.contaCredito ?? "",
    historico: m.historico ?? "",
  }
}

export default function RubricasPage() {
  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Rubricas"
        breadcrumbs={[{ label: "CSHUB Contábil", href: "/dashboard" }, { label: "Rubricas" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="conferencia" className="gap-4">
          <TabsList variant="line">
            <TabsTrigger value="conferencia">Conferência</TabsTrigger>
            <TabsTrigger value="cadastradas">Cadastradas</TabsTrigger>
          </TabsList>
          <TabsContent value="conferencia">
            <ConferenciaTab />
          </TabsContent>
          <TabsContent value="cadastradas">
            <CadastradasTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// ── Conferência: sobe o relatório de erros e cruza com o banco ──────

function ConferenciaTab() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [itens, setItens] = useState<RelatorioItem[] | null>(null)
  const [erro, setErro] = useState("")
  const [cadastrando, setCadastrando] = useState<RelatorioItem | null>(null)
  const [manualAberto, setManualAberto] = useState(false)

  const handleArquivo = async (file: File) => {
    setEnviando(true)
    setErro("")
    try {
      const formData = new FormData()
      formData.append("arquivo", file)
      const res = await fetch("/api/rubricas/importar", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar o relatório")
      setItens(data.itens)
    } catch (err: unknown) {
      setErro((err as Error)?.message ?? "Erro ao processar o relatório")
      setItens(null)
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const sincronizarComNovaRubrica = (criado: RubricaMapeamento) => {
    setItens((prev) =>
      prev?.map((i) => (i.grupo === criado.grupo && i.codigo === criado.codigo ? { ...i, match: criado } : i)) ?? prev
    )
  }

  const configuradas = itens?.filter((i) => i.match).length ?? 0
  const naoConfiguradas = itens ? itens.length - configuradas : 0

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Relatório de rubricas/itens não configurados</p>
          <p className="text-xs text-muted-foreground">
            Envie o PDF exportado pelo sistema de folha — o CSHUB cruza cada código com o banco de rubricas cadastradas.
          </p>
        </div>
        <Button variant="outline" onClick={() => setManualAberto(true)} className="shrink-0">
          <ClipboardPlus className="mr-2 h-4 w-4" />
          Cadastrar rubrica
        </Button>
        <Button onClick={() => inputRef.current?.click()} disabled={enviando} className="shrink-0">
          {enviando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {enviando ? "Processando…" : "Enviar PDF"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleArquivo(e.target.files[0])}
        />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {itens && (
        <>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> {configuradas} encontrada{configuradas !== 1 ? "s" : ""} na base
            </span>
            <span className="flex items-center gap-1.5 text-destructive">
              <XCircle className="h-4 w-4" /> {naoConfiguradas} não encontrada{naoConfiguradas !== 1 ? "s" : ""} na base
            </span>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-28">Grupo</TableHead>
                  <TableHead>Lançamento / contas</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Nenhuma rubrica encontrada nesse relatório.
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((item) => (
                    <TableRow key={`${item.grupo}-${item.codigo}`}>
                      <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
                      <TableCell className="text-sm">{item.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{GRUPO_LABEL[item.grupo]}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.match ? (
                          <div className="text-xs space-y-0.5">
                            <p className="font-medium text-sm">{item.match.lancamento ?? "—"}</p>
                            {item.match.contaDebito && <p className="text-muted-foreground">Débito: {item.match.contaDebito}</p>}
                            {item.match.contaCredito && <p className="text-muted-foreground">Crédito: {item.match.contaCredito}</p>}
                            {item.match.historico && <p className="text-muted-foreground">Histórico: {item.match.historico}</p>}
                          </div>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3" /> Não encontrada na base
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.match ? (
                          <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-600 bg-emerald-500/10">
                            <CheckCircle2 className="h-3 w-3" /> Encontrada
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setCadastrando(item)}>
                            Cadastrar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {cadastrando && (
        <RubricaForm
          open={!!cadastrando}
          onOpenChange={(v) => !v && setCadastrando(null)}
          travarIdentificacao
          inicial={{
            codigo: cadastrando.codigo,
            descricao: cadastrando.descricao,
            grupo: cadastrando.grupo,
            lancamento: "",
            contaDebito: "",
            contaCredito: "",
            historico: "",
          }}
          onSave={async (data) => {
            const res = await fetch("/api/rubricas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            })
            const criado = await res.json()
            if (!res.ok) throw new Error(criado.error ?? "Erro ao cadastrar")
            sincronizarComNovaRubrica(criado)
            toast.success("Rubrica cadastrada")
          }}
        />
      )}

      <RubricaForm
        open={manualAberto}
        onOpenChange={setManualAberto}
        onSave={async (data) => {
          const res = await fetch("/api/rubricas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
          const criado = await res.json()
          if (!res.ok) throw new Error(criado.error ?? "Erro ao cadastrar")
          sincronizarComNovaRubrica(criado)
          toast.success("Rubrica cadastrada")
        }}
      />
    </div>
  )
}

// ── Cadastradas: CRUD completo do banco de rubricas ──────────────────

function CadastradasTab() {
  const [rubricas, setRubricas] = useState<RubricaMapeamento[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroGrupo, setFiltroGrupo] = useState<string>("todos")

  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<RubricaFormData | undefined>()
  const [excluindo, setExcluindo] = useState<RubricaMapeamento | null>(null)
  const [excluindoLoading, setExcluindoLoading] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (busca) params.set("busca", busca)
      if (filtroGrupo !== "todos") params.set("grupo", filtroGrupo)
      const res = await fetch(`/api/rubricas?${params}`)
      const data = await res.json()
      setRubricas(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [busca, filtroGrupo])

  useEffect(() => {
    const t = setTimeout(carregar, 300)
    return () => clearTimeout(t)
  }, [carregar])

  const handleSalvar = async (data: RubricaFormData) => {
    const res = await fetch(data.id ? `/api/rubricas/${data.id}` : "/api/rubricas", {
      method: data.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? "Erro ao salvar")
    }
    await carregar()
  }

  const handleExcluir = async () => {
    if (!excluindo) return
    setExcluindoLoading(true)
    try {
      await fetch(`/api/rubricas/${excluindo.id}`, { method: "DELETE" })
      setExcluindo(null)
      await carregar()
    } finally {
      setExcluindoLoading(false)
    }
  }

  const abrirEdicao = (r: RubricaMapeamento) => {
    setEditando(toFormData(r))
    setFormAberto(true)
  }

  const abrirCriacao = () => {
    setEditando(undefined)
    setFormAberto(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Banco de rubricas com o grupo, lançamento e contas contábeis de cada uma.
        </p>
        <Button onClick={abrirCriacao} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Nova rubrica
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por código, descrição ou lançamento…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroGrupo} onValueChange={(v) => setFiltroGrupo(v ?? "todos")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Todos os grupos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os grupos</SelectItem>
            {GRUPO_OPTIONS.map((g) => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-28">Grupo</TableHead>
              <TableHead>Lançamento</TableHead>
              <TableHead className="hidden lg:table-cell">Contas</TableHead>
              <TableHead className="w-24">Origem</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rubricas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Nenhuma rubrica cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              rubricas.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.codigo}</TableCell>
                  <TableCell className="text-sm">{r.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{GRUPO_LABEL[r.grupo]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.lancamento ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {r.contaDebito && <p>Débito: {r.contaDebito}</p>}
                    {r.contaCredito && <p>Crédito: {r.contaCredito}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        r.origem === "MANUAL"
                          ? "border-blue-500/50 text-blue-600 bg-blue-500/10"
                          : "border-amber-500/50 text-amber-600 bg-amber-500/10"
                      )}
                    >
                      {r.origem === "MANUAL" ? "Manual" : "Importado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => abrirEdicao(r)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setExcluindo(r)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && rubricas.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {rubricas.length} rubrica{rubricas.length !== 1 ? "s" : ""} encontrada{rubricas.length !== 1 ? "s" : ""}
        </p>
      )}

      <RubricaForm open={formAberto} onOpenChange={setFormAberto} inicial={editando} onSave={handleSalvar} />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir rubrica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A rubrica <strong>{excluindo?.codigo} — {excluindo?.descricao}</strong> será removida do banco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={excluindoLoading}
            >
              {excluindoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
