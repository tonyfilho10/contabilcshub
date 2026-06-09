import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get("usuarioId")
  const busca     = searchParams.get("busca") ?? ""
  const pastaId   = searchParams.get("pastaId")
  const sb = supabaseAdmin()
  let q = sb.from("anotacoes")
    .select("*, pasta:pastas_anotacoes(*), tags:anotacao_tags(tag:tags_anotacoes(*))")
    .order("atualizadoEm", { ascending: false })
  if (usuarioId) q = q.eq("usuarioId", usuarioId)
  if (pastaId)   q = q.eq("pastaId", pastaId)
  if (busca)     q = q.ilike("titulo", `%${busca}%`)
  const { data, error } = await q
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { titulo, conteudo, usuarioId, pastaId, mencionadosIds, tagIds } = await req.json()
  if (!titulo?.trim() || !usuarioId)
    return jsonRes({ error: "título e usuarioId são obrigatórios" }, 400)

  const sb = supabaseAdmin()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const { data, error } = await sb
    .from("anotacoes")
    .insert({
      id, titulo: titulo.trim(), conteudo: conteudo ?? null,
      usuarioId, pastaId: pastaId || null,
      mencionadosIds: mencionadosIds ?? [],
      criadoEm: now, atualizadoEm: now,
    })
    .select("*, pasta:pastas_anotacoes(*)")
    .single()

  if (error) return jsonRes({ error: error.message }, 500)

  // Inserir tags
  if (tagIds?.length) {
    await sb.from("anotacao_tags").insert(
      tagIds.map((tagId: string) => ({ anotacaoId: id, tagId }))
    )
  }

  // Notificar usuários mencionados
  if (mencionadosIds?.length) {
    await criarNotificacoesMencao({
      mencionadosIds,
      autorId: usuarioId,
      tipo: "mencao_anotacao",
      titulo: `Você foi mencionado em uma anotação`,
      mensagem: `Na anotação "${titulo.trim()}"`,
      referenciaId: id,
    })
  }

  return jsonRes(data, 201)
}
