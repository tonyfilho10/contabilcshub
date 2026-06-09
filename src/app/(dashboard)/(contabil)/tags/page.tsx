"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { GerenciadorItens, type GerenciadorItem } from "@/components/gerenciador-itens"
import { Tag, Loader2 } from "lucide-react"

const TIPO_OPTIONS = [
  { value: "CUSTOM",     label: "Geral" },
  { value: "PROCESSO",   label: "Processo" },
  { value: "AREA",       label: "Área" },
  { value: "PRIORIDADE", label: "Prioridade" },
  { value: "STATUS",     label: "Status" },
]

export default function TagsPOPsPage() {
  const [tags, setTags] = useState<GerenciadorItem[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tags")
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
        title="Tags dos POPs"
        breadcrumbs={[{ label: "CSHUB Contábil", href: "/dashboard" }, { label: "Tags" }]}
      />
      <main className="flex-1 p-4 md:p-6 space-y-2">
        <p className="text-sm text-muted-foreground">
          Tags usadas para categorizar os POPs. Independentes das tags das anotações.
        </p>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GerenciadorItens
            apiBase="/api/tags"
            itens={tags}
            onRefresh={carregar}
            singular="tag"
            camposExtras={[
              {
                key: "tipo",
                label: "Categoria",
                type: "select",
                options: TIPO_OPTIONS,
                defaultValue: "CUSTOM",
              },
            ]}
            renderIcone={() => <Tag className="h-4 w-4" />}
            renderUso={(item) => TIPO_OPTIONS.find((o) => o.value === item.tipo)?.label ?? "Geral"}
          />
        )}
      </main>
    </div>
  )
}
