"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { GerenciadorItens, type GerenciadorItem } from "@/components/gerenciador-itens"
import { Tag, Loader2 } from "lucide-react"

export default function TagsAnotacoesPage() {
  const [tags, setTags] = useState<GerenciadorItem[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/anotacoes/tags")
      const data = await res.json()
      setTags(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Tags das Notas"
        breadcrumbs={[{ label: "Anotações", href: "/anotacoes" }, { label: "Tags" }]}
      />
      <main className="flex-1 p-4 md:p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Estas tags são exclusivas das anotações e não se misturam com as tags dos POPs.
        </p>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GerenciadorItens
            apiBase="/api/anotacoes/tags"
            itens={tags}
            onRefresh={carregar}
            singular="tag"
            renderIcone={() => <Tag className="h-4 w-4" />}
          />
        )}
      </main>
    </div>
  )
}
