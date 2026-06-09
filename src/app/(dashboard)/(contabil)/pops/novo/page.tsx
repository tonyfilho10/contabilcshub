"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { PopEditor } from "@/components/pop-editor/editor"
import { TagSelector } from "@/components/pop-editor/tag-selector"
import { AnexosUpload } from "@/components/pop-editor/anexos-upload"
import { StatusBadge, type PopStatus } from "@/components/pop-editor/status-badge"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
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

interface TagItem {
  id: string
  nome: string
  cor: string
}

interface AnexoItem {
  id: string
  nome: string
  tipo: string
  tamanho?: number
  file?: File
}

export default function NovoPOPPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [status, setStatus] = useState<PopStatus>("RASCUNHO")
  const [versao, setVersao] = useState("1.0")
  const [tags, setTags] = useState<TagItem[]>([])
  const [anexos, setAnexos] = useState<AnexoItem[]>([])

  async function handleSave() {
    if (!titulo.trim()) {
      toast.error("Informe o título do POP")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/pops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descricao, conteudo, status, versao, tags }),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      const data = await res.json()
      toast.success("POP salvo com sucesso!")
      router.push(`/pops/${data.id}`)
    } catch {
      toast.error("Não foi possível salvar o POP. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Novo POP"
        breadcrumbs={[
          { label: "CSHUB Contábil", href: "/dashboard" },
          { label: "POPs", href: "/pops" },
          { label: "Novo POP" },
        ]}
      >
        <Link href="/pops" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Link>
        <Button onClick={handleSave} disabled={saving} size="sm">
          <Save className="h-4 w-4 mr-1" />
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
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
                placeholder="Descreva o passo a passo do procedimento…"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Publicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as PopStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input
                    value={versao}
                    onChange={(e) => setVersao(e.target.value)}
                    placeholder="1.0"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status atual</span>
                  <StatusBadge status={status} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <TagSelector selectedTags={tags} onChange={setTags} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Anexos</CardTitle>
              </CardHeader>
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
