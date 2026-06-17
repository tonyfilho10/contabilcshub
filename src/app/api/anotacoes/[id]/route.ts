import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const select = "*, pasta:pastas_anotacoes(*), tags:anotacao_tags(tag:tags_anotacoes(*))"

  // Tenta como dono primeiro
  const { data: owned } = await sb.from("anotacoes").select(select)
    .eq("id", id).eq("usuarioId", user.id).single()
  if (owned) return jsonRes(owned)

  // Tenta como mencionado (somente leitura)
  const { data: mentioned } = await sb.from("anotacoes").select(select)
    .eq("id", id).contains("mencionadosIds", [user.id]).single()
  if (mentioned) return jsonRes(mentioned)

  return jsonRes({ error: "Não encontrada" }, 404)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { titulo, conteudo, pastaId, mencionadosIds, tagIds } = await req.json()

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const updates: Record<string, unknown> = { atualizadoEm: new Date().toISOString() }
  if (titulo         !== undefined) updates.titulo         = titulo
  if (conteudo       !== undefined) updates.conteudo       = conteudo
  if (pastaId        !== undefined) updates.pastaId        = pastaId || null
  if (mencionadosIds !== undefined) updates.mencionadosIds = mencionadosIds

  const { data, error } = await sb
    .from("anotacoes").update(updates).eq("id", id).eq("usuarioId", user.id)
    .select("*, pasta:pastas_anotacoes(*)").single()
  if (error) return jsonRes({ error: error.message }, 500)

  if (tagIds !== undefined) {
    await sb.from("anotacao_tags").delete().eq("anotacaoId", id)
    if (tagIds.length > 0) {
      await sb.from("anotacao_tags").insert(tagIds.map((tagId: string) => ({ anotacaoId: id, tagId })))
    }
  }

  if (mencionadosIds?.length && titulo) {
    await criarNotificacoesMencao({
      mencionadosIds, autorId: user.id,
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
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)
  const { error } = await sb.from("anotacoes").delete().eq("id", id).eq("usuarioId", user.id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
