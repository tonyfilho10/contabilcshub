import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin()
    .from("anotacoes")
    .select("*, pasta:pastas_anotacoes(*), tags:anotacao_tags(tag:tags_anotacoes(*))")
    .eq("id", id).single()
  if (error) return jsonRes({ error: "Não encontrada" }, 404)
  return jsonRes(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { titulo, conteudo, pastaId, mencionadosIds, autorId, tagIds } = body

  const sb = supabaseAdmin()
  const updates: Record<string, unknown> = { atualizadoEm: new Date().toISOString() }
  if (titulo         !== undefined) updates.titulo         = titulo
  if (conteudo       !== undefined) updates.conteudo       = conteudo
  if (pastaId        !== undefined) updates.pastaId        = pastaId || null
  if (mencionadosIds !== undefined) updates.mencionadosIds = mencionadosIds

  const { data, error } = await sb
    .from("anotacoes").update(updates).eq("id", id)
    .select("*, pasta:pastas_anotacoes(*)").single()
  if (error) return jsonRes({ error: error.message }, 500)

  // Atualizar tags
  if (tagIds !== undefined) {
    await sb.from("anotacao_tags").delete().eq("anotacaoId", id)
    if (tagIds.length > 0) {
      await sb.from("anotacao_tags").insert(
        tagIds.map((tagId: string) => ({ anotacaoId: id, tagId }))
      )
    }
  }

  // Notificar novos mencionados
  if (mencionadosIds?.length && titulo) {
    await criarNotificacoesMencao({
      mencionadosIds,
      autorId: autorId ?? null,
      tipo: "mencao_anotacao",
      titulo: `Você foi mencionado em uma anotação`,
      mensagem: `Na anotação "${titulo}"`,
      referenciaId: id,
    })
  }

  return jsonRes(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin().from("anotacoes").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
