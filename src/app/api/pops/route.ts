import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { criarNotificacoesMencao } from "@/lib/notificacoes"

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("pops")
    .select("*, tags:pop_tags(tag:tags(*))")
    .order("atualizadoEm", { ascending: false })
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { titulo, descricao, conteudo, status, versao, mencionadosIds, autorId, tagIds } = await req.json()
  if (!titulo?.trim()) return jsonRes({ error: "Título obrigatório" }, 400)

  const sb = supabaseAdmin()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const { data, error } = await sb
    .from("pops")
    .insert({
      id, titulo: titulo.trim(), descricao: descricao ?? null,
      conteudo: conteudo ?? null, status: status ?? "RASCUNHO",
      versao: versao ?? "1.0", mencionadosIds: mencionadosIds ?? [],
      autorId: autorId ?? null,
      criadoEm: now, atualizadoEm: now,
    })
    .select().single()

  if (error) return jsonRes({ error: error.message }, 500)

  // Inserir tags
  if (tagIds?.length) {
    await sb.from("pop_tags").insert(
      tagIds.map((tagId: string) => ({ popId: id, tagId }))
    )
  }

  // Notificar usuários mencionados
  if (mencionadosIds?.length) {
    await criarNotificacoesMencao({
      mencionadosIds,
      autorId: autorId ?? null,
      tipo: "mencao_pop",
      titulo: `Você foi mencionado em um POP`,
      mensagem: `No POP "${titulo.trim()}"`,
      referenciaId: id,
    })
  }

  return jsonRes(data, 201)
}
