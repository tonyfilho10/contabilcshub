import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca   = searchParams.get("busca") ?? ""
  const pastaId = searchParams.get("pastaId")
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  // Retorna notas do próprio usuário + notas em que ele é mencionado
  let q = sb.from("anotacoes")
    .select("*, pasta:pastas_anotacoes(*), tags:anotacao_tags(tag:tags_anotacoes(*))")
    .or(`usuarioId.eq.${user.id},mencionadosIds.cs.{${user.id}}`)
    .order("atualizadoEm", { ascending: false })
  if (pastaId) q = q.eq("pastaId", pastaId)
  if (busca)   q = q.ilike("titulo", `%${busca}%`)
  const { data, error } = await q
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { titulo, conteudo, pastaId, mencionadosIds, tagIds } = await req.json()
  if (!titulo?.trim())
    return jsonRes({ error: "título é obrigatório" }, 400)

  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const { data, error } = await sb
    .from("anotacoes")
    .insert({
      id, titulo: titulo.trim(), conteudo: conteudo ?? null,
      usuarioId: user.id, pastaId: pastaId || null,
      mencionadosIds: mencionadosIds ?? [],
      criadoEm: now, atualizadoEm: now,
    })
    .select("*, pasta:pastas_anotacoes(*)")
    .single()

  if (error) return jsonRes({ error: error.message }, 500)

  if (tagIds?.length) {
    await sb.from("anotacao_tags").insert(tagIds.map((tagId: string) => ({ anotacaoId: id, tagId })))
  }

  if (mencionadosIds?.length) {
    await criarNotificacoesMencao({
      mencionadosIds, autorId: user.id,
      tipo: "mencao_anotacao",
      titulo: `Você foi mencionado em uma anotação`,
      mensagem: `Na anotação "${titulo.trim()}"`,
      referenciaId: id,
    })
  }

  return jsonRes(data, 201)
}
