"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft, FileText, Loader2, Download } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { PopEditor } from "@/components/pop-editor/editor"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserMentionPicker } from "@/components/user-mention-picker"
import { TagSelector } from "@/components/pop-editor/tag-selector"
import { useCurrentUser } from "@/lib/use-current-user"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Pasta { id: string; nome: string; cor: string }

interface AnotacaoEditorProps {
  modo: "novo" | "editar"
  id?: string
}

export function AnotacaoEditor({ modo, id }: AnotacaoEditorProps) {
  const router = useRouter()
  const currentUser = useCurrentUser()

  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState<string>("")
  const [pastaId, setPastaId] = useState("")
  const [mencionadosIds, setMencionadosIds] = useState<string[]>([])
  const [tagIds, setTagIds] = useState<string[]>([])
  const [pastas, setPastas] = useState<Pasta[]>([])
  const [saving, setSaving] = useState(false)
  const [carregando, setCarregando] = useState(modo === "editar")

  // Carrega pastas disponíveis (sem filtro para carregar imediatamente)
  useEffect(() => {
    fetch(`/api/anotacoes/pastas`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setPastas(d) : [])
      .catch(() => {})
  }, [])

  // Se editar, carrega a anotação
  useEffect(() => {
    if (modo !== "editar" || !id) return
    fetch(`/api/anotacoes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTitulo(d.titulo ?? "")
        setConteudo(d.conteudo ?? "")
        setPastaId(d.pastaId ?? "")
        setMencionadosIds(d.mencionadosIds ?? [])
        // Pré-popula pastas com a pasta da nota para evitar UUID no Select
        if (d.pasta) {
          setPastas((prev) =>
            prev.some((p) => p.id === d.pasta.id) ? prev : [d.pasta, ...prev]
          )
        }
        // tags da anotação: d.tags é [{ tag: { id, nome, cor } }]
        const ids = (d.tags ?? []).map((t: { tag: { id: string } }) => t.tag.id)
        setTagIds(ids)
      })
      .catch(() => toast.error("Erro ao carregar nota"))
      .finally(() => setCarregando(false))
  }, [modo, id])

  async function handleSave() {
    if (!titulo.trim()) { toast.error("Informe o título"); return }
    if (!currentUser?.id) { toast.error("Usuário não identificado"); return }
    setSaving(true)
    try {
      if (modo === "novo") {
        const res = await fetch("/api/anotacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo,
            conteudo,
            usuarioId: currentUser.id,
            pastaId: pastaId || null,
            mencionadosIds,
            tagIds,
          }),
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        toast.success("Nota salva!")
        router.push(`/anotacoes/${data.id}`)
      } else {
        const res = await fetch(`/api/anotacoes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo,
            conteudo,
            pastaId: pastaId || null,
            mencionadosIds,
            tagIds,
            autorId: currentUser.id,
          }),
        })
        if (!res.ok) throw new Error()
        toast.success("Nota atualizada!")
        router.push(`/anotacoes/${id}`)
      }
    } catch {
      toast.error("Não foi possível salvar a nota.")
    } finally {
      setSaving(false)
    }
  }

  function handleTransformarPOP() {
    router.push(`/pops/novo?titulo=${encodeURIComponent(titulo)}`)
  }

  function handleExportarPDF() {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${titulo}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; font-size: 13pt; color: #111; line-height: 1.7; padding: 40px 60px; max-width: 800px; margin: 0 auto; }
    h1.nota-titulo { font-size: 22pt; font-weight: bold; margin-bottom: 4px; }
    .nota-meta { font-size: 10pt; color: #555; margin-bottom: 28px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
    .nota-conteudo h1 { font-size: 18pt; font-weight: bold; margin: 20px 0 8px; }
    .nota-conteudo h2 { font-size: 15pt; font-weight: bold; margin: 18px 0 6px; }
    .nota-conteudo h3 { font-size: 12pt; font-weight: bold; margin: 16px 0 4px; }
    .nota-conteudo p { margin-bottom: 10px; }
    .nota-conteudo ul, .nota-conteudo ol { padding-left: 24px; margin-bottom: 10px; }
    .nota-conteudo li { margin-bottom: 4px; }
    .nota-conteudo blockquote { border-left: 3px solid #aaa; padding-left: 16px; color: #555; margin: 12px 0; font-style: italic; }
    .nota-conteudo pre { background: #f4f4f4; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 11pt; white-space: pre-wrap; margin-bottom: 10px; }
    .nota-conteudo code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 10.5pt; }
    .nota-conteudo pre code { background: none; padding: 0; }
    .nota-conteudo strong { font-weight: bold; }
    .nota-conteudo em { font-style: italic; }
    .nota-conteudo u { text-decoration: underline; }
    .nota-conteudo s { text-decoration: line-through; }
    .nota-conteudo mark { padding: 1px 2px; border-radius: 2px; }
    .nota-conteudo hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    .nota-conteudo a { color: #0055cc; }
    .nota-conteudo img { max-width: 100%; height: auto; }
    .mention { font-weight: bold; color: #0055cc; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1 class="nota-titulo">${titulo}</h1>
  <div class="nota-meta">Exportado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
  <div class="nota-conteudo">${conteudo}</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`)
    win.document.close()
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={modo === "novo" ? "Nova Nota" : "Editar Nota"}
        breadcrumbs={[
          { label: "Anotações", href: "/anotacoes" },
          { label: modo === "novo" ? "Nova Nota" : "Editar Nota" },
        ]}
      >
        <Link href="/anotacoes" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Link>
        {modo === "novo" && (
          <Button variant="outline" size="sm" onClick={handleTransformarPOP}>
            <FileText className="h-4 w-4 mr-1" />Transformar em POP
          </Button>
        )}
        {modo === "editar" && (
          <Button variant="outline" size="sm" onClick={handleExportarPDF}>
            <Download className="h-4 w-4 mr-1" />Exportar PDF
          </Button>
        )}
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Editor principal */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Título da nota…"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="text-lg font-medium h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo</Label>
              <PopEditor
                content={conteudo}
                onChange={setConteudo}
                onMentionsChange={setMencionadosIds}
                placeholder="Escreva sua anotação…"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Organização */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Organização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pasta */}
                <div className="space-y-1.5">
                  <Label>Pasta</Label>
                  <Select value={pastaId} onValueChange={(v) => setPastaId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma pasta">
                        {pastaId
                          ? (pastas.find((p) => p.id === pastaId)?.nome ?? "Carregando…")
                          : "Nenhuma pasta"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma pasta</SelectItem>
                      {pastas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <TagSelector
                    selectedIds={tagIds}
                    onChange={setTagIds}
                    apiRota="/api/anotacoes/tags"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Menções */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Menções</CardTitle>
              </CardHeader>
              <CardContent>
                <UserMentionPicker
                  selectedIds={mencionadosIds}
                  onChange={setMencionadosIds}
                />
                <p className="text-[11px] text-muted-foreground mt-2">
                  Marque usuários relacionados a esta nota.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
