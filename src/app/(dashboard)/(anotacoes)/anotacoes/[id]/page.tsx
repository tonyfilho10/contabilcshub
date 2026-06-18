"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Folder, Clock, Tag } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/lib/use-current-user"

interface Nota {
  id: string
  titulo: string
  conteudo: string
  usuarioId: string
  pasta: { id: string; nome: string; cor: string } | null
  tags: { tag: { id: string; nome: string; cor: string } }[]
  atualizadoEm: string
}

export default function VerAnotacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const currentUser = useCurrentUser()
  const [nota, setNota] = useState<Nota | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch(`/api/anotacoes/${id}`)
      .then((r) => r.json())
      .then(setNota)
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) {
    return (
      <div className="flex items-center justify-center flex-1 py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!nota) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-muted-foreground">
        <p>Nota não encontrada.</p>
        <Link href="/anotacoes" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-4")}>
          Voltar
        </Link>
      </div>
    )
  }

  const isDono = currentUser?.id === nota.usuarioId

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={nota.titulo}
        breadcrumbs={[
          { label: "Anotações", href: "/anotacoes" },
          { label: nota.titulo },
        ]}
      >
        <Link href="/anotacoes" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Voltar
        </Link>
        {isDono && (
          <Link href={`/anotacoes/${id}/editar`} className={cn(buttonVariants({ size: "sm" }))}>
            <Pencil className="h-4 w-4 mr-1" />Editar
          </Link>
        )}
      </PageHeader>

      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pb-3 border-b">
            {nota.pasta && (
              <span
                className="flex items-center gap-1 font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: nota.pasta.cor + "22", color: nota.pasta.cor }}
              >
                <Folder className="h-3 w-3" />{nota.pasta.nome}
              </span>
            )}
            {nota.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px] h-5 px-1.5">
                <Tag className="h-2.5 w-2.5 mr-1" />{tag.nome}
              </Badge>
            ))}
            <span className="ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(
                new Date(nota.atualizadoEm)
              )}
            </span>
          </div>

          {/* Conteúdo */}
          <article
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: nota.conteudo ?? "" }}
          />
        </div>
      </main>
    </div>
  )
}
