import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { data, error } = await sb.from("backlog").select("*").eq("id", id).single()
  if (error) return jsonRes({ error: error.message }, 404)
  return jsonRes(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const sb = createServiceClient()
  const { data, error } = await sb.from("backlog").update(body).eq("id", id).select().single()
  if (error) return jsonRes({ error: error.message }, 500)

  // Se movendo para EM_SPRINT, criar tarefa automaticamente
  if (body.status === "EM_SPRINT") {
    const { data: emSprint } = await sb.from("backlog").select("id").eq("status", "EM_SPRINT")
    if ((emSprint?.length ?? 0) > 5) return jsonRes({ error: "Máximo de 5 itens em sprint atingido" }, 400)
    await sb.from("tarefas").insert({
      descricao: data.nome,
      responsavelId: body.responsavelId ?? data.responsavelId ?? "sistema",
      prazo: new Date(Date.now() + 7 * 86400000).toISOString(),
      contexto: data.descricao ?? "Item movido do backlog para sprint",
      criadoPor: "sistema",
      status: "RECEBIDO",
    })
  }

  return jsonRes(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()
  const { error } = await sb.from("backlog").delete().eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes({ ok: true })
}
