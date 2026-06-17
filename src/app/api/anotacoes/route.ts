import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca   = searchParams.get("busca") ?? ""
  const pastaId = searchParams.get("pastaId")
  const tagId   = searchParams.get("tagId")
  const sb = await createClient()
  const tipo = searchParams.get("tipo") ?? "minhas" // "minhas" | "mencionadas"

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return jsonRes({ error: "Não autenticado" }, 401)

  let q = sb.from("anotacoes")
    .select("*, pasta:pastas_anotacoes(*), tags:anotacao_tags(tag:tags_anotacoes(*))")
    .order("atualizadoEm", { ascending: false })

  if (tipo === "mencionadas") {
    // Busca ids das notas em que este usuário foi mencionado via notificações
    const { data: notifs } = await sb
      .from("notificacoes")
      .select("referenciaId")
      .eq("usuarioId", user.id)
      .eq("tipo", "mencao_anotacao")
      .not("referenciaId", "is", null)

    const ids = [...new Set((notifs ?? []).map((n: any) => n.referenciaId as string))]
    if (ids.length === 0) return jsonRes([])

    q = q.in("id", ids).neq("usuarioId", user.id)
  } else {
    q = q.eq("usuarioId", user.id)
  }

  if (pastaId) q = q.eq("pastaId", pastaId)
  if (busca)   q = q.ilike("titulo", `%${busca}%`)

  // Filtro por tag: busca ids das notas que têm essa tag
  if (tagId) {
    const { data: tagLinks } = await sb
      .from("anotacao_tags").select("anotacaoId").eq("tagId", tagId)
    const ids = (tagLinks ?? []).map((t: any) => t.anotacaoId as string)
    if (ids.length === 0) return jsonRes([])
    q = q.in("id", ids)
  }

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
