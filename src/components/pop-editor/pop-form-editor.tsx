"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { PopEditor } from "@/components/pop-editor/editor"
import { TagSelector } from "@/components/pop-editor/tag-selector"
import { AnexosUpload } from "@/components/pop-editor/anexos-upload"
import { StatusBadge, type PopStatus } from "@/components/pop-editor/status-badge"
import { UserMentionPicker } from "@/components/user-mention-picker"
import { useCurrentUser } from "@/lib/use-current-user"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface AnexoItem { id: string; nome: string; tipo: string; tamanho?: number; file?: File }

interface PopFormEditorProps {
  modo: "novo" | "editar"
  id?: string
}

export function PopFormEditor({ modo, id }: PopFormEditorProps) {
  const router = useRouter()
  const currentUser = useCurrentUser()

  const [saving, setSaving] = useState(false)
  const [carregando, setCarregando] = useState(modo === "editar")

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [conteudo, setConteudo] = useState<string>("")
  const [status, setStatus] = useState<PopStatus>("RASCUNHO")
  const [versao, setVersao] = useState("1.0")
  const [tagIds, setTagIds] = useState<string[]>([])
  const [anexos, setAnexos] = useState<AnexoItem[]>([])
  const [mencionadosIds, setMencionadosIds] = useState<string[]>([])

  // Carrega POP para edição
  useEffect(() => {
    if (modo !== "editar" || !id) return
    fetch(`/api/pops/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setTitulo(d.titulo ?? "")
        setDescricao(d.descricao ?? "")
        setConteudo(d.conteudo ?? "")
        setStatus(d.status ?? "RASCUNHO")
        setVersao(d.versao ?? "1.0")
        setMencionadosIds(d.mencionadosIds ?? [])
        setTagIds(d.tags?.map((t: { tag: { id: string } }) => t.tag.id) ?? [])
      })
      .catch(() => toast.error("Erro ao carregar POP"))
      .finally(() => setCarregando(false))
  }, [modo, id])

  async function handleSave() {
    if (!titulo.trim()) { toast.error("Informe o título do POP"); return }
    setSaving(true)
    try {
      if (modo === "novo") {
        const res = await fetch("/api/pops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo, descricao, conteudo, status, versao,
            mencionadosIds, tagIds,
            autorId: currentUser?.id ?? null,
          }),
        })
        if (!res.ok) throw new Error()
        const data = await res.json()

        // Inserir tags via PATCH (o POST não salva tags ainda)
        if (tagIds.length > 0) {
          await fetch(`/api/pops/${data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagIds }),
          })
        }

        toast.success("POP salvo com sucesso!")
        router.push(`/pops/${data.id}`)
      } else {
        const res = await fetch(`/api/pops/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo, descricao, conteudo, status, versao,
            mencionadosIds, tagIds,
            autorId: currentUser?.id ?? null,
          }),
        })
        if (!res.ok) throw new Error()
        toast.success("POP atualizado!")
        router.push(`/pops/${id}`)
      }
    } catch {
      toast.error("Não foi possível salvar o POP. Tente novamente.")
    } finally {
      setSaving(false)
    }
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
        title={modo === "novo" ? "Novo POP" : "Editar POP"}
        breadcrumbs={[
          { label: "CSHUB Contábil", href: "/dashboard" },
          { label: "POPs", href: "/pops" },
          { label: modo === "novo" ? "Novo POP" : "Editar POP" },
        ]}
      >
        <Link href="/pops" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Link>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título do POP</Label>
              <Input
                id="titulo"
                placeholder="Ex: Conciliação Bancária Mensal"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="text-lg font-medium h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição resumida</Label>
              <Textarea
                id="descricao"
                placeholder="Objetivo e escopo deste procedimento…"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo do Procedimento</Label>
              <PopEditor
                content={conteudo}
                onChange={setConteudo}
                onMentionsChange={setMencionadosIds}
                placeholder="Descreva o passo a passo do procedimento…"
              />
            </div>
          </div>

          {/* Painel lateral */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Publicação</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as PopStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RASCUNHO">Rascunho</SelectItem>
                      <SelectItem value="EM_REVISAO">Em Revisão</SelectItem>
                      <SelectItem value="APROVADO">Aprovado</SelectItem>
                      <SelectItem value="PUBLICADO">Publicado</SelectItem>
                      <SelectItem value="ARQUIVADO">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Versão</Label>
                  <Input value={versao} onChange={(e) => setVersao(e.target.value)} placeholder="1.0" />
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status atual</span>
                  <StatusBadge status={status} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tags</CardTitle></CardHeader>
              <CardContent>
                <TagSelector selectedIds={tagIds} onChange={setTagIds} />
              </CardContent>
            </Card>

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
                  Marque os usuários relacionados a este POP.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Anexos</CardTitle></CardHeader>
              <CardContent>
                <AnexosUpload anexos={anexos} onChange={setAnexos} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
