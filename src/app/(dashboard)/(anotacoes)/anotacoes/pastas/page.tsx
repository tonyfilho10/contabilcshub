"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { GerenciadorItens, type GerenciadorItem } from "@/components/gerenciador-itens"
import { useCurrentUser } from "@/lib/use-current-user"
import { Folder, Loader2 } from "lucide-react"

export default function PastasPage() {
  const currentUser = useCurrentUser()
  const [pastas, setPastas] = useState<GerenciadorItem[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const params = currentUser?.id ? `?usuarioId=${currentUser.id}` : ""
      const res = await fetch(`/api/anotacoes/pastas${params}`)
      const data = await res.json()
      setPastas(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Pastas"
        breadcrumbs={[{ label: "Anotações", href: "/anotacoes" }, { label: "Pastas" }]}
      />
      <main className="flex-1 p-4 md:p-6">
        {loading || !currentUser ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <GerenciadorItens
            apiBase="/api/anotacoes/pastas"
            itens={pastas}
            onRefresh={carregar}
            singular="pasta"
            extraPayload={{ usuarioId: currentUser.id }}
            renderIcone={() => <Folder className="h-4 w-4" />}
            renderUso={(item) => `${item._count?.anotacoes ?? 0} nota(s)`}
          />
        )}
      </main>
    </div>
  )
}
