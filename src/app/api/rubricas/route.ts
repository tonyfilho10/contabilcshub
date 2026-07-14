import { NextRequest } from "next/server"
import { jsonRes } from "@/lib/api-helpers"
import { createServiceClient } from "@/lib/supabase/service"

export async function GET(req: NextRequest) {
  const busca = req.nextUrl.searchParams.get("busca")?.trim()
  const grupo = req.nextUrl.searchParams.get("grupo")

  const sb = createServiceClient()
  let query = sb.from("rubrica_mapeamentos").select("*").order("grupo").order("codigo")

  if (grupo) query = query.eq("grupo", grupo)
  if (busca) query = query.or(`codigo.ilike.%${busca}%,descricao.ilike.%${busca}%,lancamento.ilike.%${busca}%`)

  const { data, error } = await query
  if (error) return jsonRes({ error: error.message }, 500)
  return jsonRes(data ?? [])
}

export async function POST(req: NextRequest) {
  const { codigo, descricao, grupo, lancamento, contaDebito, contaCredito, historico } = await req.json()
  if (!codigo?.trim()) return jsonRes({ error: "Código obrigatório" }, 400)
  if (!descricao?.trim()) return jsonRes({ error: "Descrição obrigatória" }, 400)
  if (!grupo) return jsonRes({ error: "Grupo obrigatório" }, 400)

  const sb = createServiceClient()
  const now = new Date().toISOString()
  const { data, error } = await sb
    .from("rubrica_mapeamentos")
    .insert({
      id: crypto.randomUUID(),
      codigo: codigo.trim(),
      descricao: descricao.trim(),
      grupo,
      lancamento: lancamento?.trim() || null,
      contaDebito: contaDebito?.trim() || null,
      contaCredito: contaCredito?.trim() || null,
      historico: historico?.trim() || null,
      origem: "MANUAL",
      criadoEm: now,
      atualizadoEm: now,
    })
    .select().single()

  if (error) {
    if (error.code === "23505") return jsonRes({ error: "Já existe uma rubrica com esse código nesse grupo" }, 409)
    return jsonRes({ error: error.message }, 500)
  }
  return jsonRes(data, 201)
}
