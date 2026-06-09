"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { PopEditor } from "@/components/pop-editor/editor"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagSelector } from "@/components/pop-editor/tag-selector"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TagItem { id: string; nome: string; cor: string }

const mockPastas = [
  { id: "1", nome: "Clientes", cor: "#f97316" },
  { id: "2", nome: "Processos", cor: "#6366f1" },
]

export default function NovaAnotacaoPage() {
  const router = useRouter()
  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [pastaId, setPastaId] = useState("")
  const [tags, setTags] = useState<TagItem[]>([])
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!titulo.trim()) { toast.error("Informe o título"); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600)) // placeholder
    toast.success("Nota salva!")
    router.push("/anotacoes")
    setSaving(false)
  }

  async function handleTransformarPOP() {
    toast.info("A nota será aberta como rascunho de POP…")
    router.push(`/pops/novo?titulo=${encodeURIComponent(titulo)}&conteudo=${encodeURIComponent(conteudo)}`)
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Nova Nota"
        breadcrumbs={[
          { label: "Anotações", href: "/anotacoes" },
          { label: "Nova Nota" },
        ]}
      >
        <Link href="/anotacoes" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Link>
        <Button variant="outline" size="sm" onClick={handleTransformarPOP}>
          <FileText className="h-4 w-4 mr-1" />Transformar em POP
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-1" />{saving ? "Salvando…" : "Salvar"}
        </Button>
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
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
              <PopEditor content={conteudo} onChange={setConteudo} placeholder="Escreva sua anotação…" />
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Organização</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Pasta</Label>
                  <Select value={pastaId} onValueChange={(v) => setPastaId(v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pasta" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPastas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <TagSelector selectedTags={tags} onChange={setTags} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
