import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

const PRIORIDADE_ORDEM = ["URGENTE_IMPORTANTE", "IMPORTANTE", "URGENTE", "BAIXA"]

export async function GET() {
  const sb = createServiceClient()
  const { data, error } = await sb.from("backlog").select("*").order("criadoEm", { ascending: false })
  if (error) return jsonRes({ error: error.message }, 500)
  const ordenado = (data ?? []).sort((a, b) => PRIORIDADE_ORDEM.indexOf(a.prioridade) - PRIORIDADE_ORDEM.indexOf(b.prioridade))
  return jsonRes(ordenado)
}

export async function POST(req: NextRequest) {
  const { nome, descricao, area, prioridade } = await req.json()
  if (!nome?.trim())    return jsonRes({ error: "Nome obrigatório" }, 400)
  if (!area)            return jsonRes({ error: "Área obrigatória" }, 400)
  if (!prioridade)      return jsonRes({ error: "Prioridade obrigatória" }, 400)
  const sb = createServiceClient()
  const { data, error } = await sb.from("backlog").insert({ nome: nome.trim(), descricao: descricao ?? null, area, prioridade }).select().single()
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data, 201)
}
