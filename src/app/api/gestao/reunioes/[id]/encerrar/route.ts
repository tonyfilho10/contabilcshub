import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = createServiceClient()

  const { data: decisoes } = await sb
    .from("decisoes")
    .select("id, responsavelId, descricao, prazo, contexto")
    .eq("reuniaoId", id)
  if (!decisoes?.length) return jsonRes({ error: "Adicione ao menos uma decisão antes de encerrar" }, 400)

  const tarefas = decisoes.map(d => ({
    decisaoId: d.id,
    descricao: d.descricao,
    responsavelId: d.responsavelId,
    prazo: d.prazo,
    contexto: d.contexto,
    status: "RECEBIDO",
    criadoPor: "sistema",
    leituraConfirmada: false,
  }))
  const { error: tarefaErr } = await sb.from("tarefas").insert(tarefas)
  if (tarefaErr) return jsonRes({ error: tarefaErr.message }, 500)

  const { error } = await sb
    .from("reunioes")
    .update({ status: "ENCERRADA", encerradoEm: new Date().toISOString() })
    .eq("id", id)
  if (error) return jsonRes({ error: error.message }, 500)

  return jsonRes({ ok: true })
}
