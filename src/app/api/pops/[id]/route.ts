import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = await createClient()
  const { data, error } = await sb
    .from("pops")
    .select("*, tags:pop_tags(tag:tags(*)), comentarios(*, autor:profiles(*)), anexos(*), autor:profiles(*)")
    .eq("id", id).single()
  if (error) return jsonRes({ error: "Não encontrado" }, 404)
  return jsonRes(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { titulo, descricao, conteudo, status, versao, mencionadosIds, tagIds, autorId } = await req.json()
  const sb = await createClient()
  const updates: Record<string, unknown> = { atualizadoEm: new Date().toISOString() }
  if (titulo         !== undefined) updates.titulo         = titulo
  if (descricao      !== undefined) updates.descricao      = descricao
  if (conteudo       !== undefined) updates.conteudo       = conteudo
  if (status         !== undefined) updates.status         = status
  if (versao         !== undefined) updates.versao         = versao
  if (mencionadosIds !== undefined) updates.mencionadosIds = mencionadosIds

  const { data, error } = await sb.from("pops").update(updates).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, 500)

  if (tagIds !== undefined) {
    await sb.from("pop_tags").delete().eq("popId", id)
    if (tagIds.length > 0) {
      await sb.from("pop_tags").insert(tagIds.map((tagId: string) => ({ popId: id, tagId })))
    }
  }

  if (mencionadosIds?.length && titulo) {
    await criarNotificacoesMencao({
      mencionadosIds, autorId: autorId ?? null,
      tipo: "mencao_pop",
      titulo: `Você foi mencionado em um POP`,
      mensagem: `No POP "${titulo}"`,
      referenciaId: id,
    })
  }

  return jsonRes(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = await createClient()
  const { error } = await sb.from("pops").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
